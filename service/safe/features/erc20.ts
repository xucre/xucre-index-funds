'use server';
import { Safe4337CreateTransactionProps, Safe4337InitOptions, Safe4337Pack } from "@safe-global/relay-kit";
import { encodeFunctionData, getAddress } from "viem";
import { globalChainId } from "../../constants";
import { publicClient, contractAddressMap, USDT_ADDRESS, CORP_SIGNER_SAFE, MAX_UINT256, paymasterUrl, bundlerUrl, USDC_ADDRESS } from "../helpers";
import ERC20_ABI from '../../../public/erc20.json'; // Ensure you have the ERC20 ABI JSON file
import { buildContractSignature, buildSignatureBytes } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { deploySafe } from "../safev2";

export interface CreateERC20ApprovalOptions {
    safeAddress: string;
    rpcUrl: string;
    chainid: number;
    tokenAddress?: string;
}
  
export async function createERC20Approval({safeAddress, rpcUrl, chainid, tokenAddress = getAddress(USDC_ADDRESS)}: CreateERC20ApprovalOptions): Promise<string> {
    console.log('Creating ERC20 Approval for safe wallet', safeAddress);
    
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
    const nonce = await safe4337Pack.protocolKit.getNonce();
    
    await deploySafe(safe4337Pack, chainid || 11155111);
  
    // Create approval transaction
    const rawApprovalData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contractAddressMap[chainid || globalChainId], MAX_UINT256],
    });
    
    const approvalTransaction = [{
      to: tokenAddress,
      data: rawApprovalData,
      value: '0',
    }] as Safe4337CreateTransactionProps['transactions'];
  
    // Connect to controlling safe
    const controllingSafe = await safe4337Pack.protocolKit.connect({
      provider: rpcUrl,
      signer: process.env.DEVACCOUNTKEY,
      safeAddress: CORP_SIGNER_SAFE
    });
  
    // Create and sign transaction
    const trans = await controllingSafe.createTransaction({transactions: [...approvalTransaction], options: {nonce}});
    const signedTransaction = await controllingSafe.signTransaction(
      trans,
      'safe_sign',
      PARENT_SAFE // Parent Safe address
    );
    
    const signatureSafe = await buildContractSignature(
      Array.from(signedTransaction.signatures.values()),
      CORP_SIGNER_SAFE as `0x${string}`,
    );
    
    // Get transaction hashes
    const safeTxHash = await controllingSafe.getTransactionHash(trans);
    const senderSignature = await controllingSafe.signHash(safeTxHash);
    const safeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedTransaction);
  
    // Initialize API Kit
    const apiKit = new SafeApiKit({ chainId: BigInt(chainid || globalChainId)});
    
    console.log('Proposing approval transaction via API Kit');
    // Propose the transaction
    await apiKit.proposeTransaction({
      safeAddress: PARENT_SAFE,
      safeTransactionData: signedTransaction.data,
      safeTxHash: safeTransactionHash,
      senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
      senderSignature: buildSignatureBytes([signatureSafe]),
    });
  
    // Get pending transactions and find our proposed transaction
    const pendingTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results;
    const proposedTransaction = pendingTransactions.find((tx) => tx.safeTxHash === safeTransactionHash);
    if (!proposedTransaction) throw new Error('Transaction not found');
    
    console.log('Executing approval transaction');
    const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction);
    console.log('Approval operation hash:', userOperation.hash);
    
    if (!userOperation.transactionResponse) throw new Error('Transaction not found');
    // @ts-ignore
    const receipt = await userOperation.transactionResponse?.wait();
    console.log('Approval transaction receipt:', receipt);
    
    return userOperation.hash;
}
  

export async function validateCurrentERC20Allowance (chainid: number, safeAddress: string, memberContribution: bigint, safe4337Pack: Safe4337Pack, tokenAddress: string = getAddress(USDC_ADDRESS)) {
  const _allowance = await getCurrentERC20Allowance(chainid, safeAddress, tokenAddress);
  //console.log(_allowance, memberContribution, _allowance < memberContribution);
  if (_allowance < memberContribution) {
    await createERC20Approval(
      { chainid, rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL as string, safeAddress, tokenAddress });
  }
}


export async function getCurrentERC20Allowance (chainid: number, safeAddress: string, tokenAddress: string = getAddress(USDC_ADDRESS)) {
    return getCurrentERC20AllowanceRaw(chainid, safeAddress, tokenAddress, contractAddressMap[chainid || globalChainId]);
}
  
export async function getCurrentERC20AllowanceRaw(chainid: number, safeAddress: string, tokenAddress: string = getAddress(USDC_ADDRESS), contractAddress: string) {
    const pubCli = publicClient(chainid);
    
    const _allowance = await pubCli.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [safeAddress, contractAddress]
    })
    return _allowance as bigint;
}
  