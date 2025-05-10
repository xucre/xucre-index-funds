'use server';
import { buildContractSignature, buildSignatureBytes } from "@safe-global/protocol-kit";
import { Safe4337InitOptions, Safe4337Pack, Safe4337CreateTransactionProps } from "@safe-global/relay-kit";
import { bundlerUrl, paymasterUrl, CORP_SIGNER_SAFE } from "../helpers";
import { globalChainId } from "../../constants";
import SafeApiKit from "@safe-global/api-kit";
import { deploySafe } from "./accounts";

export interface TransactionData {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
}

export interface GenericTransactionOptions {
  safeWalletAddress: string;
  transactions: TransactionData[];
  rpcUrl?: string;
  chainId?: number;
  isSponsored?: boolean;
}

/**
 * Generic function to sign and submit a transaction using Safe protocol
 * @param options Transaction options containing safe wallet address and transaction data
 * @returns Transaction hash
 */
export async function signAndSubmitTransaction({
  safeWalletAddress,
  transactions,
  rpcUrl,
  chainId,
  isSponsored = true
}: GenericTransactionOptions): Promise<string> {
  console.log('Signing and submitting transaction from', safeWalletAddress);
  
  // Initialize Safe4337Pack with the source wallet
  const safeAccountConfig = {
    safeAddress: safeWalletAddress,
  };

  const effectiveChainId = chainId || globalChainId;
  const effectiveRpcUrl = rpcUrl || process.env.NEXT_PUBLIC_SAFE_RPC_URL;

  const packData = {
    provider: effectiveRpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    bundlerUrl: bundlerUrl(effectiveChainId),
    options: safeAccountConfig,
    paymasterOptions: {
      isSponsored,
      paymasterUrl: paymasterUrl(effectiveChainId),
    }
  } as Safe4337InitOptions;
  
  const safe4337Pack = await Safe4337Pack.init(packData);
  const PARENT_SAFE = await safe4337Pack.protocolKit.getAddress();
  const nonce = await safe4337Pack.protocolKit.getNonce();
  
  await deploySafe(safe4337Pack, effectiveChainId);
  
  // Connect to controlling safe
  const controllingSafe = await safe4337Pack.protocolKit.connect({
    provider: effectiveRpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });
  
  // Create transaction
  console.log('Creating transaction');
  const trans = await controllingSafe.createTransaction({
    transactions: transactions as Safe4337CreateTransactionProps['transactions'], 
    onlyCalls: true,
    options: { nonce }
  });

  // Sign transaction
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
  console.log('Getting transaction hash');
  // const safeTxHash = await controllingSafe.getTransactionHash(trans);
  // const senderSignature = await controllingSafe.signHash(safeTxHash);
  const safeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedTransaction);

  // Initialize API Kit and propose transaction
  const apiKit = new SafeApiKit({ chainId: BigInt(effectiveChainId) });
  
  console.log('Proposing transaction via API Kit');
  await apiKit.proposeTransaction({
    safeAddress: PARENT_SAFE,
    safeTransactionData: signedTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
    senderSignature: buildSignatureBytes([signatureSafe]),
  });

  // Get pending transactions and find proposed transaction
  const pendingTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results;
  console.log('safeTransactionHash', safeTransactionHash);
  //pendingTransactions.map(tx => {console.log('pending transactions',tx)});
  const proposedTransaction = pendingTransactions.find(tx => tx.safeTxHash === safeTransactionHash);
  if (!proposedTransaction) throw new Error('Transaction not found');
  
  console.log('Executing transaction');
  const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction);
  console.log('Operation hash:', userOperation.hash);
  
  if (!userOperation.transactionResponse) throw new Error('Transaction not found');
  // @ts-ignore
  await userOperation.transactionResponse?.wait();  
  //const receipt = await userOperation.transactionResponse?.wait();
  //console.log('Transaction receipt:', receipt);
  
  return userOperation.hash;
}

/**
 * Helper function to create a transaction with contract interaction
 * @param contractAddress Contract address to interact with
 * @param data Encoded function data
 * @param value ETH value to send (default '0')
 * @returns Transaction data object
 */
export async function createContractInteractionTransaction(
  contractAddress: `0x${string}`,
  data: `0x${string}`,
  value: string = '0'
): Promise<TransactionData> { // Added return type Promise<TransactionData>
  return {
    to: contractAddress,
    data,
    value
  };
}

/**
 * Helper function to create a batch of transactions
 * @param transactions Array of transaction data
 * @param safeWalletAddress Safe wallet address
 * @param chainId Chain ID (default to global chain ID)
 * @param rpcUrl RPC URL (default to environment variable)
 * @param isSponsored Whether the transaction should be sponsored (default true)
 * @returns Promise with transaction hash
 */
export async function executeBatchTransaction(
  transactions: TransactionData[],
  safeWalletAddress: string,
  chainId?: number,
  rpcUrl?: string,
  isSponsored: boolean = true
): Promise<string> {
  return signAndSubmitTransaction({
    safeWalletAddress,
    transactions,
    chainId,
    rpcUrl,
    isSponsored
  });
}
