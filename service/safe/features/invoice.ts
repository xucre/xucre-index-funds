'use server';
import { buildContractSignature, buildSignatureBytes } from "@safe-global/protocol-kit";
import { Safe4337InitOptions, Safe4337Pack, Safe4337CreateTransactionProps } from "@safe-global/relay-kit";
import { encodeFunctionData, getAddress, parseUnits } from "viem";
import { globalChainId } from "../../constants";
import { encodeStringToBigInt } from "../../helpers";
import { Invoice, InvoiceMember } from "../../types";
import { bundlerUrl, paymasterUrl, USDT_ADDRESS, CORP_SIGNER_SAFE } from "../helpers";
import ERC20_ABI from '../../../public/erc20.json'; // Ensure you have the ERC20 ABI JSON file
import SafeApiKit from "@safe-global/api-kit";
import { addProposer as _addProposer, AddProposerOptions as _AddProposerOptions, GetProposerOptions as _GetProposerOptions, getSafeProposer as _getSafeProposer } from "./proposers";
import {CreateAccountOptions as _CreateAccountOptions, createAccount as _createAccount, deploySafe as _deploySafe, addSignerOwnership as _addSignerOwnership, removeSignerOwnership as _removeSignerOwnership} from './accounts';
import { deploySafe } from "./accounts";

export interface CreateInvoiceOptions {
  //ownerPrivateKey: string;
  rpcUrl: string;
  owner: string;
  chainid?: number;
  id: string;
  invoice: Invoice;
  safeAddress?: string;
  signerSafeWallet?: string; // Safe wallet address to use as signer
}

export async function createInvoiceTransactionV2(options: CreateInvoiceOptions): Promise<string> {
  const { owner, rpcUrl, chainid, id, safeAddress } = options;
  const safeAccountConfig = safeAddress ? {
    safeAddress: safeAddress,
  } : owner === '' ? {
    owners: [CORP_SIGNER_SAFE as `0x${string}`],
    threshold: 1,
    saltNonce: encodeStringToBigInt(id).toString()
  } :{
    owners: [owner, CORP_SIGNER_SAFE as `0x${string}`],
    threshold: 1,
    saltNonce: encodeStringToBigInt(id).toString()
  };

  const packData = {
      provider: rpcUrl,
      signer : process.env.DEVACCOUNTKEY,
      //safeAddress: CORP_SIGNER_SAFE,
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

  const invoiceTransactions = options.invoice.members.reduce((acc, member) => {
    const result = createUserSourceTransfer(member);
    if (result === null) return acc;
    return [...acc, result];
  }, [] as Safe4337CreateTransactionProps['transactions']);
  
  console.log('controlling safe transaction signed');
  // const secondTransactionData = {
  //   transactions: [...invoiceTransactions]
  // } as Safe4337CreateTransactionProps;

  const controllingSafe = await safe4337Pack.protocolKit.connect({
    provider: rpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });
  // console.log('controlling safe initialized');
  const trans = await controllingSafe.createTransaction({transactions: [...invoiceTransactions], options: {nonce}});

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
  return safeAddress || '';
}

function createUserSourceTransfer(member: InvoiceMember) {
    const recipientAddress = getAddress(member.safeWalletAddress);
    const contributionTotal = Number(member.salaryContribution) + Number(member.organizationContribution);
    const amount = parseUnits(contributionTotal.toString(), 6);
  
    if (contributionTotal < 0.01) return null;
  
    const rawTransferData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipientAddress, amount],
    });
    return {
      to: getAddress(USDT_ADDRESS),
      data: rawTransferData,
      value: '0'
    };
}


