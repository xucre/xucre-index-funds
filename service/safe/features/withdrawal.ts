'use server';
import { buildContractSignature, buildSignatureBytes } from "@safe-global/protocol-kit";
import { Safe4337InitOptions, Safe4337Pack, Safe4337CreateTransactionProps } from "@safe-global/relay-kit";
import { encodeFunctionData, getAddress, parseUnits } from "viem";
import { globalChainId } from "../../constants";
import { bundlerUrl, paymasterUrl, contractAddressMap, USDT_ADDRESS, CORP_SIGNER_SAFE } from "../helpers";
import ERC20_ABI from '../../../public/erc20.json'; // Ensure you have the ERC20 ABI JSON file
import XUCREINDEXFUNDS_ABI from '../../../public/XucreETF.json'; // Ensure you have the ERC20 ABI JSON file
import SafeApiKit from "@safe-global/api-kit";
import { getUserDetails } from "../../db";
import { validateCurrentERC20Allowance } from "./erc20";
import { deploySafe } from "./accounts";

export interface TokenWithdrawalToWalletOptions {
  to: string;
  tokenAddress: string;
  amount: number;
  decimals: number;
  from: string;
  chainId: number;
}

export async function executeTokenWithdrawalToWallet({to, tokenAddress, amount, decimals, from, chainId}: TokenWithdrawalToWalletOptions): Promise<string> {
  console.log('Executing token withdrawal to wallet', from, 'to', to);
  
  // Prepare transaction data
  const recipientAddress = getAddress(to);
  const _amount = parseUnits(amount.toString(), decimals);
  
  const rawTransferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [recipientAddress, _amount],
  });
  
  const transferTransaction = [{
    to: getAddress(tokenAddress),
    data: rawTransferData,
    value: '0'
  }] as Safe4337CreateTransactionProps['transactions'];
  
  // Initialize Safe4337Pack with the source wallet
  const safeAccountConfig = {
    safeAddress: from,
  };

  const packData = {
    provider: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    signer: process.env.DEVACCOUNTKEY,
    bundlerUrl: bundlerUrl(chainId || 11155111),
    options: safeAccountConfig,
    paymasterOptions: {
      isSponsored: true,
      paymasterUrl: paymasterUrl(chainId || 11155111),
    }
  } as Safe4337InitOptions;
  
  const safe4337Pack = await Safe4337Pack.init(packData);
  const PARENT_SAFE = await safe4337Pack.protocolKit.getAddress();
  const nonce = await safe4337Pack.protocolKit.getNonce();
  
  await deploySafe(safe4337Pack, chainId || 11155111);
  
  // Connect to controlling safe
  const controllingSafe = await safe4337Pack.protocolKit.connect({
    provider: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });
  
  // Create transaction
  console.log('Creating token withdrawal transaction');
  const trans = await controllingSafe.createTransaction({
    transactions: [...transferTransaction], 
    options: {nonce}
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
  const safeTxHash = await controllingSafe.getTransactionHash(trans);
  const senderSignature = await controllingSafe.signHash(safeTxHash);
  const safeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedTransaction);

  // Initialize API Kit and propose transaction
  const apiKit = new SafeApiKit({ chainId: BigInt(chainId || globalChainId) });
  
  console.log('Proposing token withdrawal transaction via API Kit');
  await apiKit.proposeTransaction({
    safeAddress: PARENT_SAFE,
    safeTransactionData: signedTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
    senderSignature: buildSignatureBytes([signatureSafe]),
  });

  // Get pending transactions and find proposed transaction
  const pendingTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results;
  const proposedTransaction = pendingTransactions.find(tx => tx.safeTxHash === safeTransactionHash);
  if (!proposedTransaction) throw new Error('Transaction not found');
  
  console.log('Executing token withdrawal transaction');
  const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction);
  console.log('Token withdrawal operation hash:', userOperation.hash);
  
  if (!userOperation.transactionResponse) throw new Error('Transaction not found');
  // @ts-ignore
  const receipt = await userOperation.transactionResponse?.wait();
  console.log('Token withdrawal transaction receipt:', receipt);
  
  return userOperation.hash;
}

export interface TokenWithdrawalToSourceOptions {
  userId: string;
  safeWalletAddress: string;
  rpcUrl: string;
  chainid: number;
  amount: number;
  decimals: number;
  poolFee: number;
  tokenAddress: string;
}

export async function executeTokenWithdrawalToSource({userId, safeWalletAddress, rpcUrl, chainid, amount, decimals, poolFee, tokenAddress}: TokenWithdrawalToSourceOptions): Promise<string> {
  console.log('Executing token withdrawal to source from', safeWalletAddress);
  
  const memberDetails = await getUserDetails(userId);
  if (memberDetails === null) return '';
  
  // Initialize Safe4337Pack with the safe wallet
  const safeAccountConfig = {
    safeAddress: safeWalletAddress,
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
  
  // Validate token allowance
  const memberContribution = parseUnits(amount.toString(), decimals);
  await validateCurrentERC20Allowance(chainid || globalChainId, PARENT_SAFE, memberContribution, safe4337Pack, getAddress(tokenAddress));

  console.log('Building portfolio for user', safeWalletAddress);
  const tokenAllocations = [10000];
  const tokenAddresses = [getAddress(USDT_ADDRESS)];
  const tokenPoolFees = [poolFee];
  
  // Create spot execution transaction data
  const unencodedData = {
    abi: XUCREINDEXFUNDS_ABI.abi,
    functionName: 'spotExecution',
    args: [
      PARENT_SAFE,
      tokenAddresses,
      tokenAllocations,
      tokenPoolFees,
      getAddress(tokenAddress),
      memberContribution
    ],
  };
  
  const rawSpotExecutionData = encodeFunctionData(unencodedData);
  const spotExecutionTransaction = [{
    to: getAddress(contractAddressMap[chainid || globalChainId]),
    data: rawSpotExecutionData,
    value: '0',
  }] as Safe4337CreateTransactionProps['transactions'];

  // Connect to controlling safe
  const controllingSafe = await safe4337Pack.protocolKit.connect({
    provider: rpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });
  
  // Create transaction
  console.log('Creating token withdrawal to source transaction');
  const trans = await controllingSafe.createTransaction({
    transactions: [...spotExecutionTransaction], 
    options: {nonce}
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
  const safeTxHash = await controllingSafe.getTransactionHash(trans);
  const senderSignature = await controllingSafe.signHash(safeTxHash);
  const safeTransactionHash = await safe4337Pack.protocolKit.getTransactionHash(signedTransaction);

  // Initialize API Kit and propose transaction
  const apiKit = new SafeApiKit({ chainId: BigInt(chainid || globalChainId) });
  
  console.log('Proposing token withdrawal to source transaction via API Kit');
  await apiKit.proposeTransaction({
    safeAddress: PARENT_SAFE,
    safeTransactionData: signedTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: CORP_SIGNER_SAFE as `0x${string}`,
    senderSignature: buildSignatureBytes([signatureSafe]),
  });

  // Get pending transactions and find proposed transaction
  const pendingTransactions = (await apiKit.getPendingTransactions(PARENT_SAFE)).results;
  const proposedTransaction = pendingTransactions.find(tx => tx.safeTxHash === safeTransactionHash);
  if (!proposedTransaction) throw new Error('Transaction not found');
  
  console.log('Executing token withdrawal to source transaction');
  const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction);
  console.log('Token withdrawal to source operation hash:', userOperation.hash);
  
  if (!userOperation.transactionResponse) throw new Error('Transaction not found');
  // @ts-ignore
  const receipt = await userOperation.transactionResponse?.wait();
  console.log('Token withdrawal to source transaction receipt:', receipt);
  
  return userOperation.hash;
}

export interface TokenWithdrawalToSourceOptions {
  userId: string;
  safeWalletAddress: string;
  rpcUrl: string;
  chainid: number;
  amount: number;
  decimals: number;
  poolFee: number;
  tokenAddress: string;
}