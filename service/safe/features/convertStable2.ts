'use server';
import { buildContractSignature, buildSignatureBytes } from "@safe-global/protocol-kit";
import { Safe4337InitOptions, Safe4337Pack, Safe4337CreateTransactionProps } from "@safe-global/relay-kit";
import { encodeFunctionData, encodeAbiParameters, encodePacked, getAddress, zeroAddress } from "viem";
import { globalChainId } from "../../constants";
import { bundlerUrl, paymasterUrl, publicClient, MAX_UINT256, USDT_ADDRESS, CORP_SIGNER_SAFE, USDC_ADDRESS, UNIVERSAL_ROUTER_ABI, UNIVERSAL_ROUTER_ADDRESS, PERMIT2_ABI } from "../helpers";
import ERC20_ABI from '../../../public/erc20.json';
import SafeApiKit from "@safe-global/api-kit";
import { addProposer as _addProposer, AddProposerOptions as _AddProposerOptions, GetProposerOptions as _GetProposerOptions, getSafeProposer as _getSafeProposer } from "./proposers";
import { getCurrentERC20AllowanceRaw } from "./erc20";
import {CreateAccountOptions as _CreateAccountOptions, createAccount as _createAccount, deploySafe as _deploySafe, addSignerOwnership as _addSignerOwnership, removeSignerOwnership as _removeSignerOwnership, deploySafe} from './accounts';
import {CreateInvoiceOptions as _CreateInvoiceOptions, createInvoiceTransactionV2 as _createInvoiceTransactionV2} from './invoice'
import { executeUserSpotExecution as _executeUserSpotExecution } from './portfolioExecute'
// Import the Permit2 SDK types properly
import { 
  AllowanceProvider, 
  PERMIT2_ADDRESS, 
  MaxAllowanceTransferAmount, 
  PermitSingle as PermitSingleSDK,
  AllowanceTransfer
} from '@uniswap/permit2-sdk'
import { ethers } from "ethers";

export interface ConvertUsdcToUsdtOptions {
  safeAddress: string;
  rpcUrl: string;
  chainid: number;
}

export async function convertUsdcToUsdt({safeAddress, rpcUrl, chainid}: ConvertUsdcToUsdtOptions): Promise<string> {
  console.log('Converting USDC to USDT for safe wallet', safeAddress);
  
  try {
    // Get Universal Router address for V4
    const universalRouterAddress = getAddress(UNIVERSAL_ROUTER_ADDRESS);
    // Permit2 contract address is standardized
    const permit2Address = getAddress(PERMIT2_ADDRESS);
  
  // Initialize Safe4337Pack with the safe wallet
  const safeAccountConfig = {
    safeAddress: safeAddress,
  };

  const packData = {
    provider: rpcUrl || process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    signer: process.env.DEVACCOUNTKEY,
    bundlerUrl: bundlerUrl(chainid || 11155111),
    options: safeAccountConfig,
    paymasterOptions: {
      isSponsored: true,
      paymasterUrl: paymasterUrl(chainid || 11155111),
    }
  } as Safe4337InitOptions;

  const safe4337Pack = await Safe4337Pack.init(packData);
  const PARENT_SAFE = await safe4337Pack.protocolKit.getAddress();
  const pubClient = publicClient(chainid || globalChainId);
  const nonce = await safe4337Pack.protocolKit.getNonce();
  
  await deploySafe(safe4337Pack, chainid || globalChainId);

  // Get current USDC balance
  let usdcBalance: bigint;
  try {
    usdcBalance = await pubClient.readContract({
      address: getAddress(USDC_ADDRESS),
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [safeAddress]
    }) as bigint;

    console.log('Current USDC balance:', usdcBalance.toString());
  } catch (error) {
    console.error('Error reading USDC balance:', error);
    throw new Error(`Failed to get USDC balance: ${error.message}`);
  }
  
  // If balance is 0 or too small, return early
  if (usdcBalance <= BigInt(0)) {
    console.log('No USDC to convert');
    return '';
  }

  const controllingSafe = await safe4337Pack.protocolKit.connect({
    provider: rpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });

  // Set up deadline for permit
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
  const sigDeadline = BigInt(deadline);
  
  // Get the current nonce for the Permit2 token allowance
  try {
    console.log('Using Permit2 SDK for token approval');
    
    // First, ensure USDC is approved for Permit2
    const currentAllowance = await getCurrentERC20AllowanceRaw(
        chainid || globalChainId, 
        safeAddress, 
        getAddress(USDC_ADDRESS),
        PERMIT2_ADDRESS
    );

    if (currentAllowance < usdcBalance) {
        console.log('Approving USDC for spending by Permit2');
        const erc20ApprovalData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [PERMIT2_ADDRESS, MAX_UINT256],
        });
        
        const approvalTransaction = [{
          to: getAddress(USDC_ADDRESS),
          data: erc20ApprovalData,
          value: '0',
        }] as Safe4337CreateTransactionProps['transactions'];
    
        // Execute the ERC20 approval transaction
        const trans = await controllingSafe.createTransaction({transactions: [...approvalTransaction], options: {nonce}});
        const signedTransaction = await controllingSafe.signTransaction(
          trans,
          'safe_sign',
          PARENT_SAFE
        );
        
        const signatureSafe = await buildContractSignature(
          Array.from(signedTransaction.signatures.values()),
          CORP_SIGNER_SAFE as `0x${string}`,
        );
        
        const safeTxHash = await controllingSafe.getTransactionHash(trans);
        const safeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedTransaction);
        
        // Instantiate the API Kit
        const apiKit = new SafeApiKit({ chainId: BigInt(chainid || globalChainId)});
        
        console.log('Proposing ERC20 approval transaction');
        await apiKit.proposeTransaction({
          safeAddress: PARENT_SAFE,
          safeTransactionData: signedTransaction.data,
          safeTxHash: safeTransactionHash,
          senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
          senderSignature: buildSignatureBytes([signatureSafe]),
        });
      
        const pendingTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results;
        const proposedTransaction = pendingTransactions.find((tx) => tx.safeTxHash === safeTransactionHash);
        if (!proposedTransaction) throw new Error('ERC20 approval transaction not found');
        
        console.log('Executing ERC20 approval transaction');
        const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction);
        console.log('ERC20 approval operation hash:', userOperation.hash);
        
        if (!userOperation.transactionResponse) throw new Error('ERC20 approval transaction response not found');
        
        // Wait for the approval transaction to be mined
        // @ts-ignore
        const receipt = await userOperation.transactionResponse?.wait();
        console.log('ERC20 approval receipt:', receipt.status);
    }
    
    // Create a provider for the AllowanceProvider
    const provider = new ethers.providers.JsonRpcProvider('wss://polygon-mainnet.g.alchemy.com/v2/93MwFQzBC2oy_1UUDDIIo2gLs2BKXrjA');
    console.log('Provider for AllowanceProvider:', 'wss://polygon-mainnet.g.alchemy.com/v2/93MwFQzBC2oy_1UUDDIIo2gLs2BKXrjA');
    const allowanceProvider = new AllowanceProvider(provider, PERMIT2_ADDRESS);
    
    // Function to build the permit using Uniswap Permit2 SDK
    async function buildPermit(): Promise<PermitSingleSDK> {
      try {
        // Get current allowance data including nonce
        const { nonce } = await allowanceProvider.getAllowanceData(
          getAddress(USDC_ADDRESS),
          safeAddress, 
          universalRouterAddress
        );
        
        console.log('Current Permit2 nonce from allowance provider:', nonce.toString());
        
        // Calculate deadlines
        const PERMIT_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
        const SIG_DEADLINE_MS = 1000 * 60 * 30; // 30 minutes
        const toDeadline = (ms: number) => BigInt(Math.floor((Date.now() + ms) / 1000));
        
        // Create the permit details
        return {
          details: {
            token: getAddress(USDC_ADDRESS),
            amount: MaxAllowanceTransferAmount,
            expiration: toDeadline(PERMIT_EXPIRATION_MS),
            nonce: BigInt(nonce),
          },
          spender: universalRouterAddress,
          sigDeadline: toDeadline(SIG_DEADLINE_MS),
        };
      } catch (error) {
        console.error('Error getting allowance data, using fallback method:', error);
        
        // Fallback method if getAllowanceData fails
        const wordPos = Math.floor(Date.now() / 1000 / 2**12);
        const nonceResponse = await pubClient.readContract({
          address: getAddress(PERMIT2_ADDRESS),
          abi: PERMIT2_ABI,
          functionName: 'nonceBitmap',
          args: [safeAddress, wordPos]
        }) as bigint;
        
        const permitNonce = nonceResponse + BigInt(1);
        console.log('Using nonceBitmap fallback, current nonce:', permitNonce.toString());
        
        const PERMIT_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
        const SIG_DEADLINE_MS = 1000 * 60 * 30; // 30 minutes
        const toDeadline = (ms: number) => BigInt(Math.floor((Date.now() + ms) / 1000));
        
        return {
          details: {
            token: getAddress(USDC_ADDRESS),
            amount: MaxAllowanceTransferAmount,
            expiration: toDeadline(PERMIT_EXPIRATION_MS),
            nonce: permitNonce,
          },
          spender: universalRouterAddress,
          sigDeadline: toDeadline(SIG_DEADLINE_MS),
        };
      }
    }
    
    // Build the permit
    const permitSingle = await buildPermit();
    
    console.log('Using Permit2 SDK types for approval with MaxAllowanceTransferAmount');
    console.log('Permit details:', {
      token: permitSingle.details.token,
      amount: permitSingle.details.amount.toString(),
      expiration: permitSingle.details.expiration.toString(),
      nonce: permitSingle.details.nonce.toString(),
      spender: permitSingle.spender,
      sigDeadline: permitSingle.sigDeadline.toString()
    });
    
    // Get typed data for Permit signature using the SDK
    // The SDK might expect a number for chainId, so we'll explicitly convert
    const chainIdNumber = Number(chainid || globalChainId);
    
    // Use the AllowanceTransfer.getPermitData with the required types
    const permitData = AllowanceTransfer.getPermitData(
      permitSingle, 
      PERMIT2_ADDRESS, 
      chainIdNumber
    );
    
    console.log('Generated Permit2 typed data for signing');
    
    // Create the permit transaction with the Safe
    console.log('Creating permit2 transaction');
    
    // Safe can't directly sign typed data as expected by Permit2, 
    // so we'll use the traditional permit approach with empty signature
    const permitFunctionData = encodeFunctionData({
      abi: PERMIT2_ABI,
      functionName: 'permit',
      args: [
        safeAddress,           // owner
        permitSingle,          // permitSingle struct
        '0x'                   // signature (Safe will handle this through its transaction)
      ],
    });
    
    // Create and execute a Permit2 approval transaction
    const permitTransaction = [{
      to: permit2Address,
      data: permitFunctionData,
      value: '0',
    }] as Safe4337CreateTransactionProps['transactions'];

    const permitTrans = await controllingSafe.createTransaction({
      transactions: [...permitTransaction], 
      options: {nonce}
    });
    
    const signedPermitTransaction = await controllingSafe.signTransaction(
      permitTrans,
      'safe_sign',
      PARENT_SAFE
    );
    
    const permitSignatureSafe = await buildContractSignature(
      Array.from(signedPermitTransaction.signatures.values()),
      CORP_SIGNER_SAFE as `0x${string}`,
    );
    
    console.log('getting permit transaction hash', permitSignatureSafe);
    //const permitSafeTxHash = await controllingSafe.getTransactionHash(permitTrans);
    const permitSafeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedPermitTransaction);

    // Instantiate the API Kit
    const apiKit = new SafeApiKit({ chainId: BigInt(chainid || globalChainId)});
    
    console.log('proposing permit transaction w/ apikit');
    // Propose the permit transaction
    await apiKit.proposeTransaction({
      safeAddress: PARENT_SAFE,
      safeTransactionData: signedPermitTransaction.data,
      safeTxHash: permitSafeTransactionHash,
      senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
      senderSignature: buildSignatureBytes([permitSignatureSafe]),
    });

    const pendingPermitTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results;
    console.log(`Found ${pendingPermitTransactions.length} pending permit transactions`);
    
    const proposedPermitTransaction = pendingPermitTransactions.find((tx) => tx.safeTxHash === permitSafeTransactionHash);
    if (!proposedPermitTransaction) {
      console.error('Available transactions:', pendingPermitTransactions.map(tx => tx.safeTxHash));
      throw new Error(`Permit transaction not found. Expected hash: ${permitSafeTransactionHash}`);
    }
    
    console.log('Found proposed permit transaction:', proposedPermitTransaction.safeTxHash);
    console.log('Executing permit transaction...');
    
    const permitUserOperation = await safe4337Pack.protocolKit.executeTransaction(proposedPermitTransaction);
    console.log('Permit operation hash:', permitUserOperation.hash);
    
    if (!permitUserOperation.transactionResponse) {
      throw new Error('Permit transaction response not found');
    }
    
    // Add a timeout for transaction receipt
    const permitTimeout = setTimeout(() => {
      console.error('Permit transaction receipt wait timed out after 60 seconds');
    }, 60000);
    
    try {
      // @ts-ignore
      const permitReceipt = await permitUserOperation.transactionResponse?.wait();
      clearTimeout(permitTimeout);
      console.log('Permit receipt status:', permitReceipt.status);
      console.log('Permit transaction successful!');
    } catch (receiptError) {
      clearTimeout(permitTimeout);
      console.error('Error waiting for permit transaction receipt:', receiptError);
      throw new Error(`Permit transaction failed: ${receiptError.message}`);
    }
  } catch (error) {
    console.error('Error with Permit2 process:', error);
    // Fall back to standard ERC20 approval if Permit2 fails
    throw new Error(`Approval transaction failed: ${error.message}`);
  }

  // Now perform the V4 swap using Universal Router
  // V4 pools require slightly different parameters than V3
  // Command 0x10: V4_SWAP_EXACT_IN - Swap exact amount in through a V4 pool
  const commands = encodePacked(['uint8'], [0x10]);
  console.log('Using V4 swap with Universal Router');
  console.log('Swap amount:', usdcBalance.toString());
  
  // Encode V4 swap parameters
  const poolKey = {
    currency0: getAddress(USDC_ADDRESS),
    currency1: getAddress(USDT_ADDRESS),
    fee: 100,                // 0.3% fee tier
    tickSpacing: 60,          // Standard tick spacing for 0.3% pools
    hooks: zeroAddress as `0x${string}` // No hooks for this swap
  };
  
  console.log('Pool key:', poolKey);
  
  // Direction based on token order
  const zeroForOne = USDC_ADDRESS.toLowerCase() < USDT_ADDRESS.toLowerCase();
  console.log('Zero for one:', zeroForOne, 'USDC:', USDC_ADDRESS.toLowerCase(), 'USDT:', USDT_ADDRESS.toLowerCase());
  
  // Set a minimum acceptable amount out (1% slippage maximum)
  // USDC and USDT both have 6 decimals, so the exchange rate should be close to 1:1
  const minAmountOut = usdcBalance * BigInt(99) / BigInt(100);
  console.log('Minimum amount out with 1% max slippage:', minAmountOut.toString());
  
  const v4SwapParams = encodeAbiParameters(
    [
      { type: 'tuple', components: [
        { name: 'poolKey', type: 'tuple', components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' }
        ]},
        { name: 'zeroForOne', type: 'bool' },
        { name: 'amountIn', type: 'uint128' },
        { name: 'amountOutMinimum', type: 'uint128' },
        { name: 'hookData', type: 'bytes' }
      ]}
    ],
    [{
      poolKey,
      zeroForOne,
      amountIn: usdcBalance,
      amountOutMinimum: minAmountOut,
      hookData: '0x'               // No hook data needed
    }]
  );
  
  // Additional encoded data needed for V4 swaps:
  // Approval data for the tokens involved
  const approvalData = encodeAbiParameters(
    [{ type: 'address' }, { type: 'uint128' }], 
    [getAddress(USDC_ADDRESS), usdcBalance]
  );
  
  // Settlement data for where to receive the tokens
  const settleData = encodeAbiParameters(
    [{ type: 'address' }, { type: 'uint128' }], 
    [getAddress(USDT_ADDRESS), BigInt(0)]
  );
  
  // Encode the actions for the V4 swap
  const actions = encodePacked(
    [{ type: 'uint8' }, { type: 'uint8' }, { type: 'uint8' }], 
    [0x06, 0x0c, 0x0f]
  );
  
  // The inputs array for the execute function
  const inputs = [
    encodeAbiParameters(
      [{ type: 'bytes' }, { type: 'bytes[]' }], 
      [actions, [v4SwapParams, approvalData, settleData]]
    )
  ];
  
  // Encode the function call for execute
  const swapData = encodeFunctionData({ 
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: [commands, inputs]
  });
  
  // Create swap transaction
  const swapTransaction = [{
    to: universalRouterAddress,
    data: swapData,
    value: '0',
  }] as Safe4337CreateTransactionProps['transactions'];

  // Create and sign the transaction
  const trans = await controllingSafe.createTransaction({transactions: [...swapTransaction], options: {nonce: nonce + 1}});
  const signedTransaction = await controllingSafe.signTransaction(
    trans,
    'safe_sign',
    PARENT_SAFE
  );
  
  const signatureSafe = await buildContractSignature(
    Array.from(signedTransaction.signatures.values()),
    CORP_SIGNER_SAFE as `0x${string}`,
  );
  
  console.log('getting swap transaction hash');
  const safeTxHash = await controllingSafe.getTransactionHash(trans);
  const safeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedTransaction);

  // Instantiate the API Kit
  const apiKit = new SafeApiKit({ chainId: BigInt(chainid || globalChainId)});
  
  console.log('proposing swap transaction w/ apikit');
  // Propose the transaction
  await apiKit.proposeTransaction({
    safeAddress: PARENT_SAFE,
    safeTransactionData: signedTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
    senderSignature: buildSignatureBytes([signatureSafe]),
  });

  const pendingTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results;
  console.log(`Found ${pendingTransactions.length} pending transactions`);
  
  const proposedTransaction = pendingTransactions.find((tx) => tx.safeTxHash === safeTransactionHash);
  if (!proposedTransaction) {
    console.error('Proposed transaction details:', pendingTransactions.map(tx => tx.safeTxHash));
    throw new Error(`Swap transaction not found. Expected hash: ${safeTransactionHash}`);
  }
  
  console.log('Found proposed transaction:', proposedTransaction.safeTxHash);
  console.log('Executing swap transaction...');
  
  const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction);
  console.log('Swap operation hash:', userOperation.hash);
  
  if (!userOperation.transactionResponse) {
    throw new Error('Swap transaction response not found');
  }
  
  // Add a timeout for transaction receipt
  const timeout = setTimeout(() => {
    console.error('Transaction receipt wait timed out after 60 seconds');
  }, 60000);
  
  try {
    // @ts-ignore
    const receipt = await userOperation.transactionResponse?.wait();
    clearTimeout(timeout);
    console.log('Swap receipt status:', receipt.status);
    console.log('Swap transaction successful!');
  } catch (receiptError) {
    clearTimeout(timeout);
    console.error('Error waiting for transaction receipt:', receiptError);
    throw new Error(`Transaction failed: ${receiptError.message}`);
  }
  
  return userOperation.hash;
  } catch (error) {
    console.error('Error in convertUsdcToUsdt:', error);
    throw new Error(`Failed to convert USDC to USDT: ${error.message}`);
  }
}