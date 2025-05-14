'use server';
import { buildContractSignature, buildSignatureBytes } from "@safe-global/protocol-kit";
import { Safe4337InitOptions, Safe4337Pack, Safe4337CreateTransactionProps } from "@safe-global/relay-kit";
import { encodeFunctionData, getAddress, parseUnits } from "viem";
import { globalChainId } from "../../constants";
import { InvoiceMember, IndexFund } from "../../types";
import { bundlerUrl, paymasterUrl, contractAddressMap, USDT_ADDRESS, CORP_SIGNER_SAFE, USDC_ADDRESS } from "../helpers";
import XUCREINDEXFUNDS_ABI from '../../../public/XucreETF.json'; // Ensure you have the ERC20 ABI JSON file
import SafeApiKit from "@safe-global/api-kit";
import { createFailureLog } from "../../db";
import { addProposer as _addProposer, AddProposerOptions as _AddProposerOptions, GetProposerOptions as _GetProposerOptions, getSafeProposer as _getSafeProposer } from "./proposers";
import { validateCurrentERC20Allowance } from "./erc20";
import {CreateAccountOptions as _CreateAccountOptions, createAccount as _createAccount, deploySafe as _deploySafe, addSignerOwnership as _addSignerOwnership, removeSignerOwnership as _removeSignerOwnership, deploySafe} from './accounts';
import {CreateInvoiceOptions as _CreateInvoiceOptions, createInvoiceTransactionV2 as _createInvoiceTransactionV2} from './invoice'


export async function executeUserSpotExecution(member: InvoiceMember, rpcUrl: string, chainid: number, invoiceId: string, fundMap: {[key: string]: IndexFund}): Promise<string | undefined> {
  try {
    console.log('Executing spot execution for member', member.safeWalletAddress);
    return await createUserSpotExecution(member, rpcUrl, chainid, fundMap);
  } catch (err) {
    console.log('Error executing spot for member', member.safeWalletAddress);
    console.log(err);
    await createFailureLog(member.organization.id, invoiceId, member.id, 'error executing spot for member');
    return undefined;
  }
}

async function createUserSpotExecution(member: InvoiceMember, rpcUrl: string, chainid: number, fundMap: {[key: string]: IndexFund}): Promise<string> {
  const selectedFund = fundMap[member.riskTolerance] || fundMap['Moderate'];
  console.log('Building portfolio for user', member.safeWalletAddress, 'with risk tolerance', member.riskTolerance);
  
  // Initialize safe configuration
  const safeAccountConfig = {
    safeAddress: member.safeWalletAddress,
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
  
  await deploySafe(safe4337Pack, chainid || 11155111);
  
  // Calculate contribution and validate ERC20 allowance
  const contributionTotal = Number(member.salaryContribution) + Number(member.organizationContribution);
  if (contributionTotal < 0.01) {
    console.log('Member contribution too low', member.safeWalletAddress);
    throw new Error('Contribution too low');
  }
  
  const memberContribution = parseUnits(contributionTotal.toString(), 6);
  await validateCurrentERC20Allowance(chainid || globalChainId, PARENT_SAFE, memberContribution, safe4337Pack);
  

  const nonce = await safe4337Pack.protocolKit.getNonce();
  // Prepare portfolio allocation data
  console.log('Building portfolio for user', member.safeWalletAddress);
  const portfolio = selectedFund.portfolio;
  const activeItems = portfolio.filter(item => item.active);
  const tokenAllocations = activeItems.map(item => item.weight);
  const tokenAddresses = activeItems.map(item => getAddress(item.address));
  const tokenPoolFees = activeItems.map(item => 
    item.sourceFees[USDC_ADDRESS] ? item.sourceFees[USDC_ADDRESS] : item.poolFee
  );

  // Create spot execution transaction data
  const unencodedData = {
    abi: XUCREINDEXFUNDS_ABI.abi,
    functionName: 'spotExecution',
    args: [
      PARENT_SAFE,
      tokenAddresses,
      tokenAllocations,
      tokenPoolFees,
      getAddress(USDC_ADDRESS),
      memberContribution
    ],
  };
  
  const rawSpotExecutionData = encodeFunctionData(unencodedData);
  const spotExecutionTransaction = [{
    to: getAddress(contractAddressMap[chainid || globalChainId]),
    data: rawSpotExecutionData,
    value: '0',
  }] as Safe4337CreateTransactionProps['transactions'];

  // Connect to controlling safe and create transaction
  const controllingSafe = await safe4337Pack.protocolKit.connect({
    provider: rpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });
  
  console.log('Creating spot execution transaction');
  const trans = await controllingSafe.createTransaction({
    transactions: [...spotExecutionTransaction], 
    options: {nonce}
  });

  // Sign transaction with controlling safe
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
  
  console.log('Proposing spot execution transaction via API Kit');
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
  
  console.log('Executing spot execution transaction');
  const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction);
  console.log('Spot execution operation hash:', userOperation.hash);
  
  if (!userOperation.transactionResponse) throw new Error('Transaction not found');
  // @ts-ignore
  const receipt = await userOperation.transactionResponse?.wait();
  console.log('Spot execution transaction receipt:', receipt);
  
  return userOperation.hash;
}


