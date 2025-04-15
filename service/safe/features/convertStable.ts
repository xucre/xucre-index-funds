'use server';
import { buildContractSignature, buildSignatureBytes } from "@safe-global/protocol-kit";
import { Safe4337InitOptions, Safe4337Pack, Safe4337CreateTransactionProps } from "@safe-global/relay-kit";
import { encodeFunctionData, getAddress } from "viem";
import { globalChainId } from "../../constants";
import { bundlerUrl, paymasterUrl, publicClient, MAX_UINT256, USDT_ADDRESS, CORP_SIGNER_SAFE, USDC_ADDRESS } from "../helpers";
import ISWAPROUTER_ABI from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import ERC20_ABI from '../../../public/erc20.json'; // Ensure you have the ERC20 ABI JSON file
import SafeApiKit from "@safe-global/api-kit";
import { addProposer as _addProposer, AddProposerOptions as _AddProposerOptions, GetProposerOptions as _GetProposerOptions, getSafeProposer as _getSafeProposer } from "./proposers";
import { getCurrentERC20AllowanceRaw } from "./erc20";
import {CreateAccountOptions as _CreateAccountOptions, createAccount as _createAccount, deploySafe as _deploySafe, addSignerOwnership as _addSignerOwnership, removeSignerOwnership as _removeSignerOwnership, deploySafe} from './accounts';
import {CreateInvoiceOptions as _CreateInvoiceOptions, createInvoiceTransactionV2 as _createInvoiceTransactionV2} from './invoice'
import { executeUserSpotExecution as _executeUserSpotExecution } from './portfolioExecute'

export interface ConvertUsdcToUsdtOptions {
  safeAddress: string;
  rpcUrl: string;
  chainid: number;
}

export async function convertUsdcToUsdt({safeAddress, rpcUrl, chainid}: ConvertUsdcToUsdtOptions): Promise<string> {
  console.log('Converting USDC to USDT for safe wallet', safeAddress);
  
  // Get contract address for the current chain
  const contractAddress = getAddress('0xE592427A0AEce92De3Edee1F18E0157C05861564');
  //const contractAddress = UNIVERSAL_ROUTER_ADDRESS(UniversalRouterVersion.V2_0, chainid);
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
  const usdcBalance = await pubClient.readContract({
    address: getAddress(USDC_ADDRESS),
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [safeAddress]
  }) as bigint;

  console.log('Current USDC balance:', usdcBalance.toString());
  
  // If balance is 0 or too small, return early
  if (usdcBalance <= BigInt(0)) {
    console.log('No USDC to convert');
    return '';
  }

  // Check if contract already has approval to spend USDC
  const currentAllowance = await getCurrentERC20AllowanceRaw(
    chainid || globalChainId, 
    safeAddress, 
    getAddress(USDC_ADDRESS),
    contractAddress
  );

  
  // If allowance is insufficient, approve first
  if (currentAllowance < usdcBalance) {
    console.log('Approving USDC for spending');
    const rawApprovalData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contractAddress, MAX_UINT256],
    });
    
    const approvalTransaction = [{
      to: getAddress(USDC_ADDRESS),
      data: rawApprovalData,
      value: '0',
    }] as Safe4337CreateTransactionProps['transactions'];

    const controllingSafe = await safe4337Pack.protocolKit.connect({
      provider: rpcUrl,
      signer: process.env.DEVACCOUNTKEY,
      safeAddress: CORP_SIGNER_SAFE
    });
    // console.log('controlling safe initialized');
    const trans = await controllingSafe.createTransaction({transactions: [...approvalTransaction], options: {nonce}});
  
    // console.log('controlling safe transaction created');
    const signedTransaction =  await controllingSafe.signTransaction(
      trans,
      'safe_sign',
      PARENT_SAFE // Parent Safe address
    )
    const signatureSafe = await buildContractSignature(
      Array.from(signedTransaction.signatures.values()),
      CORP_SIGNER_SAFE as `0x${string}`,
    )
    console.log('getting transaction hash');
    // Deterministic hash based on transaction parameters
    const safeTxHash = await controllingSafe.getTransactionHash(trans)
  
    // Sign transaction to verify that the transaction is coming from owner 1
    const senderSignature = await controllingSafe.signHash(safeTxHash)
  
    const safeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedTransaction)
  
    // Instantiate the API Kit
    // Use the chainId where you have the Safe account deployed
    const apiKit = new SafeApiKit({ chainId: BigInt(chainid || globalChainId)})
    
    console.log('proposing transaction w/ apikit');
    // Propose the transaction
    await apiKit.proposeTransaction({
      safeAddress: PARENT_SAFE,
      safeTransactionData: signedTransaction.data,
      safeTxHash: safeTransactionHash,
      //safeTxHash,
      senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
      senderSignature: buildSignatureBytes([signatureSafe]),
      //safeTransactionData: trans.data,
      //senderSignature: senderSignature.data
    })
  
    const pendingTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results
    console.log('pendingTransactions');
    const proposedTransaction = pendingTransactions.find((tx) => tx.safeTxHash === safeTransactionHash);
    if (!proposedTransaction) throw new Error('Transaction not found');
    console.log('confirming transaction w/ apikit');
    
    console.log('sending safe transaction signed');
    
    const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction)
    console.log('userOperationHash', userOperation.hash);
    
    //let isOperationComplete = false;
    if (!userOperation.transactionResponse) throw new Error('Transaction not found');
    // @ts-ignore
    const receipt = await userOperation.transactionResponse?.wait();
    console.log('receipt', receipt);
    
  }
  const params = {
    tokenIn: getAddress(USDC_ADDRESS),  // USDC on mainnet
    tokenOut: getAddress(USDT_ADDRESS), // WETH on mainnet
    fee: 3000,                                             // 0.3% fee tier
    recipient: safeAddress,                        // Your wallet address
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,       // 20 minutes from now
    amountIn: usdcBalance,                                    // 1 USDC (USDC has 6 decimals: 1 * 10^6)
    amountOutMinimum: 1n,                                  // Set a minimum acceptable amount out
    sqrtPriceLimitX96: 0n                                  // No price limit; set to 0
  };
  
  const swapData2 = {
    abi: ISWAPROUTER_ABI.abi,
    functionName: 'exactInputSingle',
    args: [params],
  }
  //console.log(swapData2);
  // Create swap transaction using the contract's swap function
  const swapData = encodeFunctionData(swapData2);
  const swapTransaction = [{
    to: getAddress(USDC_ADDRESS),
    data: swapData,
    value: '0',
  }] as Safe4337CreateTransactionProps['transactions'];

  const controllingSafe = await safe4337Pack.protocolKit.connect({
    provider: rpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });
  // console.log('controlling safe initialized');
  const trans = await controllingSafe.createTransaction({transactions: [...swapTransaction], options: {nonce}});

  // console.log('controlling safe transaction created');
  const signedTransaction =  await controllingSafe.signTransaction(
    trans,
    'safe_sign',
    PARENT_SAFE // Parent Safe address
  )
  const signatureSafe = await buildContractSignature(
    Array.from(signedTransaction.signatures.values()),
    CORP_SIGNER_SAFE as `0x${string}`,
  )
  console.log('getting transaction hash');
  // Deterministic hash based on transaction parameters
  const safeTxHash = await controllingSafe.getTransactionHash(trans)

  // Sign transaction to verify that the transaction is coming from owner 1
  const senderSignature = await controllingSafe.signHash(safeTxHash)

  const safeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedTransaction)

  // Instantiate the API Kit
  // Use the chainId where you have the Safe account deployed
  const apiKit = new SafeApiKit({ chainId: BigInt(chainid || globalChainId)})
  
  console.log('proposing transaction w/ apikit');
  // Propose the transaction
  await apiKit.proposeTransaction({
    safeAddress: PARENT_SAFE,
    safeTransactionData: signedTransaction.data,
    safeTxHash: safeTransactionHash,
    //safeTxHash,
    senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
    senderSignature: buildSignatureBytes([signatureSafe]),
    //safeTransactionData: trans.data,
    //senderSignature: senderSignature.data
  })

  const pendingTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results
  console.log('pendingTransactions');
  const proposedTransaction = pendingTransactions.find((tx) => tx.safeTxHash === safeTransactionHash);
  if (!proposedTransaction) throw new Error('Transaction not found');
  console.log('confirming transaction w/ apikit');
  
  console.log('sending safe transaction signed');
  
  const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction)
  console.log('userOperationHash', userOperation.hash);
  
  //let isOperationComplete = false;
  if (!userOperation.transactionResponse) throw new Error('Transaction not found');
  // @ts-ignore
  const receipt = await userOperation.transactionResponse?.wait();
  console.log('receipt', receipt);
  
  return userOperation.hash;
}