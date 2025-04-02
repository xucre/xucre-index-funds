'use server';
import Safe, { buildContractSignature, buildSignatureBytes, ContractNetworksConfig, CreateTransactionProps, ExternalClient, ExternalSigner, PredictedSafeProps, SafeAccountConfig, SafeDeploymentConfig } from '@safe-global/protocol-kit';
import {
  EthSafeOperation,
  Safe4337CreateTransactionProps,
  Safe4337InitOptions,
  Safe4337Pack
} from '@safe-global/relay-kit'
import {
  createSafeClient,
  safeOperations,
  BundlerOptions
} from '@safe-global/sdk-starter-kit'
import { SafeSignature } from '@safe-global/types-kit'
import superagent from 'superagent';
import { globalChainId, isDev } from './constants';
import { polygon, sepolia } from 'viem/chains'
import { ByteArray, Chain, Client, ClientConfig, defineChain, EIP1193RequestFn, encodeFunctionData, getAddress, parseUnits, TransportConfig } from 'viem';
import { mainnetTrustedSetupPath } from 'viem/node'
import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient,  } from "permissionless"
import { createPublicClient, createWalletClient, getContract, http, parseEther } from "viem"
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import type { ToSafeSmartAccountParameters } from 'permissionless/accounts'
import {
	createBundlerClient,
	entryPoint07Address,
	UserOperation,
	type EntryPointVersion,
} from "viem/account-abstraction"
import { toSafeSmartAccount } from "permissionless/accounts"
//const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)
import ISWAPROUTER_ABI from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import ERC20_ABI from '../public/erc20.json'; // Ensure you have the ERC20 ABI JSON file
import XUCREINDEXFUNDS_ABI from '../public/XucreETF.json'; // Ensure you have the ERC20 ABI JSON file
import DEMO_PORTFOLIO from '../public/demoPortfolio.json'; // Ensure you have the ERC20 ABI JSON file
import { writeContract } from 'viem/actions';
import { distributeWeights, encodeStringToBigInt } from './helpers';
import { IndexFund, Invoice, InvoiceMember, Token2 } from './types';
import { createFailureLog, getUserDetails } from './db';
import SafeApiKit, { AddSafeDelegateProps } from '@safe-global/api-kit';
import { constructSingleTrade } from './uniswap/index';
import { UNIVERSAL_ROUTER_ADDRESS, UniversalRouterVersion } from './uniswap/constants';

const chainIdToChain = {
  11155111 : sepolia,
  137: polygon
};

const contractAddressMap = {
  1: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ETH,
  137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  8453: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE,
  31337 : '0xCBBe2A5c3A22BE749D5DDF24e9534f98951983e2'
};

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as string;
const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS as string;
const MAX_UINT256 = `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`;
const CORP_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_DEVACCOUNTADDRESS;
const CORP_SIGNER_SAFE = process.env.NEXT_PUBLIC_SIGNER_SAFE_ADDRESS_POLYGON;
//const corpAccount = parseAccount(CORP_PUBLIC_ADDRESS) as LocalAccount;
const CORP_ACCOUNT = privateKeyToAccount(process.env.DEVACCOUNTKEY as `0x${string}`);
const transport = (chainid) => {
  return http(`https://api.pimlico.io/v2/${chainid ? chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`)
}

const publicTransport = () => {
  return http(process.env.NEXT_PUBLIC_SAFE_RPC_URL)
}
const publicClient = (chainid : number) => {
  return createPublicClient({
    chain: chainIdToChain[chainid ? chainid : 11155111],
    transport: publicTransport(),
  })
}

const paymasterClient = (chainid : number) => {
  return createPimlicoClient({
    transport: transport(chainid),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  })
} 

const bundlerUrl = (chainid : number) => {
 return `https://api.pimlico.io/v2/${chainid ? chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
}

const paymasterUrl = (chainid : number) => {
  return `https://api.pimlico.io/v2/${chainid ? chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
}

export interface CreateAccountOptions {
  //ownerPrivateKey: string;
  rpcUrl: string;
  owner: string;
  threshold: number;
  singleOwner?: boolean;
  chainid?: number;
  id: string;
  //salt: string; might need to add salt as a persistent value
  //signer: SafeSigner;
}

export async function createAccount(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl, singleOwner, chainid, id } = options;
  console.log('createSafe',owner, threshold, rpcUrl);
  const safeAccountConfig = singleOwner || owner === '' ? {
    owners: [CORP_PUBLIC_ADDRESS as `0x${string}`],
    threshold: 1,
    saltNonce: encodeStringToBigInt(id).toString()
  } :{
    owners: [owner, CORP_PUBLIC_ADDRESS as `0x${string}`],
    threshold: 1,
    saltNonce: encodeStringToBigInt(id).toString()
  };

  const packData = {
      provider: rpcUrl,
      signer : process.env.DEVACCOUNTKEY,
      bundlerUrl: bundlerUrl(chainid || 11155111),
      options: safeAccountConfig,
      paymasterOptions: {
          isSponsored: true,
          paymasterUrl: paymasterUrl(chainid || 11155111),
      }
  } as Safe4337InitOptions;
  const safe4337Pack = await Safe4337Pack.init(packData);
  const safeAddress = await safe4337Pack.protocolKit.getAddress();
  
  executeSafeCreation({
    safeAddress,
    rpcUrl: rpcUrl,
    chainid: chainid || 11155111,
    safe4337Pack: safe4337Pack
  }).catch(error => {
    console.error('Error in executeSafeCreation:', error);
  });;  
  
  console.log('safeAddress', safeAddress);
  
  return safeAddress;
}

interface CreateSafeOptions {
  safeAddress: string;
  rpcUrl: string;
  chainid: number;
  safe4337Pack: Safe4337Pack;
}

async function executeSafeCreation(options: CreateSafeOptions) {
  const { safeAddress, rpcUrl, chainid, safe4337Pack } = options;
  const pubClient = publicClient(chainid || 11155111);

  const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
  console.log('IsSafeDeployed', isSafeDeployed, safeAddress)
  const client = await safe4337Pack.protocolKit.getSafeProvider().getExternalSigner()
  if (!client) return '';
  if (!isSafeDeployed) {
    const deploymentTransaction = await safe4337Pack.protocolKit.createSafeDeploymentTransaction()
    const transactionHash = await client.sendTransaction({
      to: deploymentTransaction.to,
      value: BigInt(deploymentTransaction.value),
      data: deploymentTransaction.data as `0x${string}`,
      account: CORP_ACCOUNT,
      chain: chainIdToChain[chainid ? chainid : 11155111],
      kzg: undefined
    });
    console.log('transactionHash', transactionHash);
    const deploymentReceipt = await pubClient.waitForTransactionReceipt( 
      { hash: transactionHash }
    )
    console.log('deploymentReceipt found');
  }
  const allowance = await getCurrentERC20Allowance(chainid || globalChainId, safeAddress);
  if (allowance < BigInt(MAX_UINT256)) {
    console.log('running allowance creation');
    await createERC20Approval(chainid || globalChainId, rpcUrl, safe4337Pack);
  } 

}

export interface TransferSignerOwnershipOptions {
  chainid: number;
  safeWallet: string;
}

export async function transferSignerOwnership(options: TransferSignerOwnershipOptions): Promise<void> {
  const { chainid, safeWallet } = options;
  const packData = {
    provider: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    signer : process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE,
    bundlerUrl: bundlerUrl(chainid || 11155111),
    options: {
      safeAddress: safeWallet
    },
    paymasterOptions: {
        isSponsored: true,
        paymasterUrl: paymasterUrl(chainid || 11155111),
    }
  } as Safe4337InitOptions;
  const safe4337Pack = await Safe4337Pack.init(packData);

  const transaction = await safe4337Pack.protocolKit.createSwapOwnerTx({
    oldOwnerAddress: CORP_PUBLIC_ADDRESS as `0x${string}`,
    newOwnerAddress: '' as `0x${string}`,
  })
  
  const _transaction ={
    to: safeWallet,
    data: transaction.data.data,
    value: '0',
  }
  const executable = await safe4337Pack.createTransaction({transactions: [_transaction]});
  const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
    safeOperation: executable
  })
  const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
  const userOperationHash = await safe4337Pack.executeTransaction({
    executable: signedSafeOperation
  })
  console.log('transfer successful', userOperationHash);
  return;
}

export interface CreateInvoiceOptions {
  //ownerPrivateKey: string;
  rpcUrl: string;
  owner: string;
  chainid?: number;
  id: string;
  invoice: Invoice;
  safeAddress?: string;
  //signer: SafeSigner;
}

export async function createInvoiceTransaction(options: CreateInvoiceOptions): Promise<string> {
  const { owner, rpcUrl, chainid, id, safeAddress: _safeAddress } = options;
  const safeAccountConfig = _safeAddress ? { safeAddress: _safeAddress}: owner === '' ? {
    owners: [CORP_PUBLIC_ADDRESS as `0x${string}`],
    threshold: 1,
    saltNonce: encodeStringToBigInt(id).toString()
  } :{
    owners: [owner, CORP_PUBLIC_ADDRESS as `0x${string}`],
    threshold: 1,
    saltNonce: encodeStringToBigInt(id).toString()
  };

  const packData = {
      provider: rpcUrl,
      signer : process.env.DEVACCOUNTKEY,
      bundlerUrl: bundlerUrl(chainid || 11155111),
      options: safeAccountConfig,
      paymasterOptions: {
          isSponsored: true,
          paymasterUrl: paymasterUrl(chainid || 11155111),
      }
  } as Safe4337InitOptions;
  const safe4337Pack = await Safe4337Pack.init(packData);
  const safeAddress = await safe4337Pack.protocolKit.getAddress();
  
  const client = await safe4337Pack.protocolKit.getSafeProvider().getExternalSigner()
  const pubClient = publicClient(chainid || 11155111);
  if (!client) return '';
  
  const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
  console.log('IsSafeDeployed', isSafeDeployed)
  if (!isSafeDeployed) {
    const deploymentTransaction = await safe4337Pack.protocolKit.createSafeDeploymentTransaction()
    const transactionHash = await client.sendTransaction({
      to: deploymentTransaction.to,
      value: BigInt(deploymentTransaction.value),
      data: deploymentTransaction.data as `0x${string}`,
      account: CORP_ACCOUNT,
      chain: chainIdToChain[chainid ? chainid : 11155111],
      kzg: undefined
    });
    console.log('transactionHash', transactionHash);
    const deploymentReceipt = await pubClient.waitForTransactionReceipt( 
      { hash: transactionHash }
    )
    console.log('deploymentReceipt found');
    const rawApprovalData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contractAddressMap[chainid || globalChainId], MAX_UINT256],
    });
    const secondTransactionData = {
      transactions: [
        {
          to: getAddress(USDT_ADDRESS),
          data: rawApprovalData,
          value: '0',
        }
      ]
    } as CreateTransactionProps;
    const secondTransaction = await safe4337Pack.createTransaction({
      transactions: secondTransactionData.transactions,
    });
    const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
      safeOperation: secondTransaction
    })
    const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
    const userOperationHash = await safe4337Pack.executeTransaction({
      executable: signedSafeOperation
    })
    console.log('userOperationHash', userOperationHash);
  }

  const invoiceTransactions = options.invoice.members.reduce((acc, member) => {
    const result = createUserSourceTransfer(member);
    if (result === null) return acc;
    return [...acc, result];
  }, [] as Safe4337CreateTransactionProps['transactions']);
  const secondTransactionData = {
    transactions: [
      ...invoiceTransactions
    ]
  } as CreateTransactionProps;
  const secondTransaction = await safe4337Pack.createTransaction({
    transactions: secondTransactionData.transactions,
  });
  const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
    safeOperation: secondTransaction
  })
  const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
  const userOperationHash = await safe4337Pack.executeTransaction({
    executable: signedSafeOperation
  })
  console.log('userOperationHash', userOperationHash);
  
  let isOperationSuccess = false;
  while (!isOperationSuccess) {
    const userOperationResult = await safe4337Pack.getUserOperationReceipt(userOperationHash);
    isOperationSuccess = userOperationResult !== null && userOperationResult.success;
  }  
  console.log('disbursement of source to users successful');
  return safeAddress;
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
  
  const client = await safe4337Pack.protocolKit.getSafeProvider().getExternalSigner()
  const pubClient = publicClient(chainid || 11155111);
  if (!client) return '';
  
  const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
  console.log('IsSafeDeployed', isSafeDeployed)
  if (!isSafeDeployed) {
    const deploymentTransaction = await safe4337Pack.protocolKit.createSafeDeploymentTransaction()
    const transactionHash = await client.sendTransaction({
      to: deploymentTransaction.to,
      value: BigInt(deploymentTransaction.value),
      data: deploymentTransaction.data as `0x${string}`,
      account: CORP_ACCOUNT,
      chain: chainIdToChain[chainid ? chainid : 11155111],
      kzg: undefined
    });
    console.log('transactionHash', transactionHash);
    const deploymentReceipt = await pubClient.waitForTransactionReceipt( 
      { hash: transactionHash }
    )
    console.log('deploymentReceipt found');
    const rawApprovalData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contractAddressMap[chainid || globalChainId], MAX_UINT256],
    });
    const secondTransactionData = {
      transactions: [
        {
          to: getAddress(USDT_ADDRESS),
          data: rawApprovalData,
          value: '0',
        }
      ]
    } as CreateTransactionProps;
    const secondTransaction = await safe4337Pack.createTransaction({
      transactions: secondTransactionData.transactions,
    });
    const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
      safeOperation: secondTransaction
    })
    const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
    const userOperationHash = await safe4337Pack.executeTransaction({
      executable: signedSafeOperation
    })
    console.log('userOperationHash', userOperationHash);
  }

  const invoiceTransactions = options.invoice.members.reduce((acc, member) => {
    const result = createUserSourceTransfer(member);
    if (result === null) return acc;
    return [...acc, result];
  }, [] as Safe4337CreateTransactionProps['transactions']);
  
  console.log('controlling safe transaction signed');
  const secondTransactionData = {
    transactions: [...invoiceTransactions]
  } as Safe4337CreateTransactionProps;

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

export interface InvoiceTransactionOptions {
  safeAddress: string;
  tokenAddress: string;
  recipientAddress: string;
  amount: string;
  rpcUrl: string;
  chainid: number;
  contractNetworks?: ContractNetworksConfig;
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

export interface TokenWithdrawalToWalletOptions {
  to: string;
  tokenAddress: string;
  amount: number;
  decimals: number;
  from: string;
  chainId: number;
}

export async function executeTokenWithdrawalToWallet({to, tokenAddress, amount, decimals, from, chainId}: TokenWithdrawalToWalletOptions) {
    const recipientAddress = getAddress(to);
    const _amount = parseUnits(amount.toString(), decimals);
  
    const rawTransferData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipientAddress, _amount],
    });
    const transaction = {
      to: getAddress(tokenAddress),
      data: rawTransferData,
      value: '0'
    };
    console.log(from);
    const packData = {
        provider: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
        signer : process.env.DEVACCOUNTKEY,
        bundlerUrl: bundlerUrl(chainId || 11155111),
        options: {
          safeAddress: from,
        },
        paymasterOptions: {
            isSponsored: true,
            paymasterUrl: paymasterUrl(chainId || 11155111),
        }
    } as Safe4337InitOptions;
    const safe4337Pack = await Safe4337Pack.init(packData);
    const safeAddress = await safe4337Pack.protocolKit.getAddress();
    const client = await safe4337Pack.protocolKit.getSafeProvider().getExternalSigner()
    if (!client) return '';
    const transactionData = {
      transactions: [transaction]
    } as Safe4337CreateTransactionProps;
    const safeTransaction = await safe4337Pack.createTransaction(transactionData);
    const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
      safeOperation: safeTransaction
    })
    const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
    const userOperationHash = await safe4337Pack.executeTransaction({
      executable: signedSafeOperation
    })
    console.log('userOperationHash for withdrawal ', userOperationHash);
    
  
}

export async function executeUserSpotExecution (member: InvoiceMember, rpcUrl: string, chainid: number, invoiceId: string, fundMap: {[key: string]: IndexFund}) {
  try {
    console.log(member);
    return await createUserSpotExecution(member, rpcUrl, chainid, fundMap);
  } catch (err2) {
    console.log('error executing spot for member', member.safeWalletAddress);
    console.log(err2);
    await createFailureLog(member.organization.id, invoiceId, member.id, 'error executing spot for member');
    return;
  }
}

export async function executeTokenWithdrawalToSource(userId: string, safeWalletAddress: string, rpcUrl: string, chainid: number, amount: number, decimals: number, poolFee: number, tokenAddress: string) {
  const memberDetails = await getUserDetails(userId);
  //console.log(memberDetails);
  if (memberDetails === null) return;
  //console.log('building portfolio for user', member.safeWalletAddress);
  //console.log(memberDetails.riskTolerance, selectedFund);
  const safeAccountConfig = {
    safeAddress: safeWalletAddress,
  };

  const packData = {
      provider: rpcUrl,
      signer : process.env.DEVACCOUNTKEY,
      bundlerUrl: bundlerUrl(chainid || 11155111),
      options: safeAccountConfig,
      paymasterOptions: {
          isSponsored: true,
          paymasterUrl: paymasterUrl(chainid || 11155111),
      }
  } as Safe4337InitOptions;
  
  const safe4337Pack = await Safe4337Pack.init(packData);
  const safeAddress = await safe4337Pack.protocolKit.getAddress();
  
  const client = await safe4337Pack.protocolKit.getSafeProvider().getExternalSigner()
  if (!client) {
    console.log('client not found');
    return;
  }
  const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
  console.log('IsUserSafeDeployed', isSafeDeployed);
  
  const memberContribution = parseUnits(amount.toString(), decimals);
  await validateCurrentERC20Allowance(chainid || globalChainId, safeAddress, memberContribution, safe4337Pack, getAddress(tokenAddress));

  console.log('building portfolio for user', safeWalletAddress);
  const tokenAllocations =[10000];
  const tokenAddresses = [getAddress(USDT_ADDRESS)];
  const tokenPoolFees = [poolFee];
  const unencodedData = {
    abi: XUCREINDEXFUNDS_ABI.abi,
    functionName: 'spotExecution',
    args: [
      safeAddress,
      tokenAddresses,
      tokenAllocations,
      tokenPoolFees,
      getAddress(tokenAddress),
      memberContribution
    ],
  }
  
  //console.log('unencodedData', unencodedData);
  const rawDisbursmentData = encodeFunctionData(unencodedData);
  //console.log('rawDisbursmentData', rawDisbursmentData);
  const userDisbursementTransactions = {
    to: getAddress(contractAddressMap[chainid || globalChainId]),
    data: rawDisbursmentData,
    value: '0',
  }

  console.log('userDisbursementTransactions', userDisbursementTransactions.to);

  const safeNoOnce = await safe4337Pack.protocolKit.getNonce();
  console.log('noonce for safe', safeNoOnce);

  const userDisbursementTransactionData = {
    transactions: [
      userDisbursementTransactions
    ],
    options: {
      nonce: safeNoOnce
    }
  } as CreateTransactionProps;
  console.log('UserDisbursementTransactionData');
  let secondTransaction;
  //try { 
    secondTransaction = await safe4337Pack.createTransaction({
      transactions: userDisbursementTransactionData.transactions
    });
  // } catch (err) {
  //   console.log(err);
  //   throw err;
  // }

  console.log('secondTransaction complete');
  const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
    safeOperation: secondTransaction
  })
  console.log('identifiedSafeOperation complete');
  const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
  console.log('signedSafeOperation complete');
  const userOperationHash = await safe4337Pack.executeTransaction({
    executable: signedSafeOperation
  })
  console.log('userOperationHash', userOperationHash);
  
  let isOperationSuccess = false;
  while (!isOperationSuccess) {
    const userOperationResult = await safe4337Pack.getUserOperationReceipt(userOperationHash);
    isOperationSuccess = userOperationResult !== null && userOperationResult.success;
  } 
  
  return ''//finalHash;
}

async function createUserSpotExecution(member: InvoiceMember, rpcUrl: string, chainid: number, fundMap: {[key: string]: IndexFund}) {
  //const memberDetails = await getUserDetails(member.id);
  //console.log(memberDetails);
  //if (memberDetails === null) return;
  const selectedFund = fundMap[member.riskTolerance] || fundMap['Moderate'];
  //console.log('building portfolio for user', member.safeWalletAddress);
  //console.log(member.riskTolerance, selectedFund);
  const safeAccountConfig = {
    safeAddress: member.safeWalletAddress,
  };

  const packData = {
      provider: rpcUrl,
      signer : process.env.DEVACCOUNTKEY,
      bundlerUrl: bundlerUrl(chainid || 11155111),
      options: safeAccountConfig,
      paymasterOptions: {
          isSponsored: true,
          paymasterUrl: paymasterUrl(chainid || 11155111),
      }
  } as Safe4337InitOptions;
  
  const safe4337Pack = await Safe4337Pack.init(packData);
  const safeAddress = await safe4337Pack.protocolKit.getAddress();
  
  const client = await safe4337Pack.protocolKit.getSafeProvider().getExternalSigner()
  const pubClient = publicClient(chainid || 11155111);
  if (!client) {
    console.log('client not found');
    return;
  }
  const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
  console.log('IsUserSafeDeployed', isSafeDeployed);
  
  const contributionTotal = Number(member.salaryContribution) + Number(member.organizationContribution);
  const memberContribution = parseUnits(contributionTotal.toString(), 6);
  await validateCurrentERC20Allowance(chainid || globalChainId, safeAddress, memberContribution, safe4337Pack);
  if (contributionTotal < .01) {
    console.log('member salary contribution too low', member.safeWalletAddress);
    return;
  }
  const nonce = await safe4337Pack.protocolKit.getNonce();
  console.log('building portfolio for user', member.safeWalletAddress);
  const portfolio = selectedFund.portfolio;
  const activeItems = portfolio.filter((item) => item.active);
  const tokenAllocations = activeItems.map((item) => item.weight);
  //const tokenAllocations = distributeWeights(activeItems);
  const tokenAddresses = activeItems.map((item) => getAddress(item.address));
  const tokenPoolFees = activeItems.map((item) => item.sourceFees[USDT_ADDRESS] ? item.sourceFees[USDT_ADDRESS] : item.poolFee);


  // 500000000
  // 296659812
  const unencodedData = {
    abi: XUCREINDEXFUNDS_ABI.abi,
    functionName: 'spotExecution',
    args: [
      safeAddress,
      tokenAddresses,
      tokenAllocations,
      tokenPoolFees,
      getAddress(USDT_ADDRESS),
      memberContribution
    ],
  }
  //console.log(unencodedData)
  //console.log('unencodedData', unencodedData);
  const rawDisbursmentData = encodeFunctionData(unencodedData);
  //console.log('rawDisbursmentData', rawDisbursmentData);
  const userDisbursementTransactions = {
    to: getAddress(contractAddressMap[chainid || globalChainId]),
    data: rawDisbursmentData,
    value: '0',
  }

  console.log('userDisbursementTransactions', userDisbursementTransactions.to);

  const userDisbursementTransactionData = {
    transactions: [
      userDisbursementTransactions
    ],
    options: {
      nonce: nonce
    }
  } as CreateTransactionProps;
  console.log('UserDisbursementTransactionData');
  let secondTransaction;
  //try { 
    secondTransaction = await safe4337Pack.createTransaction({
      transactions: userDisbursementTransactionData.transactions
    });
  // } catch (err) {
  //   console.log(err);
  //   throw err;
  // }

  console.log('secondTransaction complete');
  const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
    safeOperation: secondTransaction
  })
  console.log('identifiedSafeOperation complete');
  const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
  console.log('signedSafeOperation complete');
  const userOperationHash = await safe4337Pack.executeTransaction({
    executable: signedSafeOperation
  })
  console.log('userOperationHash', userOperationHash);
  
  let isOperationSuccess = false;
  while (!isOperationSuccess) {
    const userOperationResult = await safe4337Pack.getUserOperationReceipt(userOperationHash);
    isOperationSuccess = userOperationResult !== null && userOperationResult.success;
  } 
  const txResult = await safe4337Pack.getUserOperationByHash(userOperationHash);
  return txResult.transactionHash//finalHash;
}

async function validateCurrentERC20Allowance (chainid: number, safeAddress: string, memberContribution: bigint, safe4337Pack: Safe4337Pack, tokenAddress: string = getAddress(USDT_ADDRESS)) {
  const _allowance = await getCurrentERC20Allowance(chainid, safeAddress, tokenAddress);
  //console.log(_allowance, memberContribution, _allowance < memberContribution);
  if (_allowance < memberContribution) {
    await createERC20Approval(chainid, process.env.NEXT_PUBLIC_SAFE_RPC_URL as string, safe4337Pack, tokenAddress);
  }
}

async function getCurrentERC20Allowance (chainid: number, safeAddress: string, tokenAddress: string = getAddress(USDT_ADDRESS)) {
  // const pubCli = publicClient(chainid);
  
  // const _allowance = await pubCli.readContract({
  //   address: tokenAddress,
  //   abi: ERC20_ABI,
  //   functionName: 'allowance',
  //   args: [safeAddress, contractAddressMap[chainid || globalChainId]]
  // })
  // return _allowance as bigint;
  return getCurrentERC20AllowanceRaw(chainid, safeAddress, tokenAddress, contractAddressMap[chainid || globalChainId]);
}

async function getCurrentERC20AllowanceRaw(chainid: number, safeAddress: string, tokenAddress: string = getAddress(USDT_ADDRESS), contractAddress: string) {
  const pubCli = publicClient(chainid);
  
  const _allowance = await pubCli.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [safeAddress, contractAddress]
  })
  return _allowance as bigint;

}

async function createERC20Approval (chainid: number, rpcUrl: string, safe4337Pack: Safe4337Pack, tokenAddress: string = getAddress(USDT_ADDRESS)) {
  const rawApprovalData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [contractAddressMap[chainid || globalChainId], MAX_UINT256],
  });
  const secondTransactionData = {
    transactions: [
      {
        to: tokenAddress,
        data: rawApprovalData,
        value: '0',
      }
    ]
  } as CreateTransactionProps;
  const secondTransaction = await safe4337Pack.createTransaction({
    transactions: secondTransactionData.transactions,
  });

  const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
    safeOperation: secondTransaction
  })
  const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
  const userOperationHash = await safe4337Pack.executeTransaction({
    executable: signedSafeOperation
  })

  let isOperationSuccess = false;
  while (!isOperationSuccess) {
    console.log('checking allowance for success');
    const userOperationResult = await safe4337Pack.getUserOperationReceipt(userOperationHash);
    isOperationSuccess = userOperationResult !== null;
    if (isOperationSuccess) {
      console.log('allowance success');
    }
  } 

}

export async function getSafeOwner (chainid: number, safeAddress: string) {
  const pubCli = publicClient(chainid);
  const safeClient = await createSafeClient({
    provider: pubCli,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: safeAddress
  })
  
  const owners = await safeClient.getOwners();
  return owners;
}

export interface GetProposerOptions {
  chainid: number;
  safeWallet: string;
}

export async function getSafeProposer (options: GetProposerOptions) {
  const { chainid, safeWallet } = options;
  // const signer = createWalletClient({
  //   account: CORP_ACCOUNT,
  //   chain: chainIdToChain[chainid],
  //   transport: http(),
  // });
  console.log('chainid', chainid);
  console.log('safeWallet', safeWallet);
  const config = { chainId: BigInt(chainid), txServiceUrl: 'https://safe-transaction-polygon.safe.global'};
  console.log(config);
  const apiKit = new SafeApiKit(config);
  console.log('apiKit created');
  const test = await apiKit.getServiceInfo()
  console.log('service info retrieved', test);
  const conf = {
    safeAddress: safeWallet
  }
  
  const delegates = await apiKit.getSafeDelegates(conf);
  console.log('delegates', delegates);
  return delegates;
}

export interface AddProposerOptions {
  chainid: number;
  safeWallet: string;
  proposer: string;
  name: string;
}

export async function addProposer(options: AddProposerOptions): Promise<{success: boolean, message: string}> {
  const { chainid, safeWallet, proposer, name } = options;
  const signer = createWalletClient({
    account: CORP_ACCOUNT,
    chain: chainIdToChain[chainid],
    transport: publicTransport(),
  });
  const _chainid = BigInt(chainid || globalChainId);
  console.log('chainid', _chainid);
  const apiKit = new SafeApiKit({ chainId: _chainid})
  const conf: AddSafeDelegateProps = {
    safeAddress: safeWallet, // Optional
    delegateAddress: proposer,
    delegatorAddress: CORP_PUBLIC_ADDRESS as `0x${string}`,
    label: name.length > 50 ? name.substring(0,49): name,
    signer,
  }
  
  try {
    // const data = await signDelegate(signer, conf.delegateAddress, _chainid);
    // const result = await superagent.post('https://safe-transaction-polygon.safe.global/api/v2/delegates/') // Replace with actual endpoint
    //   .set('Content-Type', 'application/json')
    //   .send({
    //     safe: safeWallet,
    //     delegate: conf.delegateAddress,
    //     signature: data,
    //     delegator: CORP_PUBLIC_ADDRESS as `0x${string}`,
    //     label: name,
    //   })
    //   console.log(result);
    await apiKit.addSafeDelegate(conf)
    // .catch((err) => {
    //   console.log('error adding proposer', err.success, err.message, conf.safeAddress, conf.delegateAddress, conf.delegatorAddress, conf.label, signer.account.address);
    //   return {success: false, message: err.message};
    // });
  } catch (err) {
    console.log('error adding proposer', JSON.stringify(err), conf.safeAddress, conf.delegateAddress, conf.delegatorAddress, conf.label, signer.account.address);
    return {success: false, message: JSON.stringify(err)};
  }
  //await apiKit.addSafeDelegate(conf);
  return {
    success: true,
    message: ''
  };
}

async function signDelegate(walletClient : {signTypedData: Function}, delegateAddress, chainId) {
  const domain = {
      name: 'Safe Transaction Service',
      version: '1.0',
      chainId: Number(chainId)
  };
  const types = {
      EIP712Domain: [
          {"name": "name", "type": "string"},
          {"name": "version", "type": "string"},
          {"name": "chainId", "type": "uint256"},
      ],
      Delegate: [
          { name: 'delegateAddress', type: 'address' },
          { name: 'totp', type: 'uint256' }
      ]
  };
  const totp = Math.floor(Date.now() / 1000 / 3600);
  return walletClient.signTypedData({
      domain,
      types,
      primaryType: 'Delegate',
      message: { delegateAddress, totp }
  });
}

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
  const pubClient = publicClient(chainid || globalChainId);
  
  // Check if safe is deployed
  const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
  if (!isSafeDeployed) {
    console.log('Safe wallet not deployed, cannot convert USDC to USDT');
    return '';
  }

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
    
    const approvalTransactionData = {
      transactions: [
        {
          to: getAddress(USDC_ADDRESS),
          data: rawApprovalData,
          value: '0',
        }
      ]
    } as CreateTransactionProps;

    const approvalTransaction = await safe4337Pack.createTransaction({
      transactions: approvalTransactionData.transactions,
    });

    const identifiedApprovalOperation = await safe4337Pack.getEstimateFee({
      safeOperation: approvalTransaction
    });
    
    const signedApprovalOperation = await safe4337Pack.signSafeOperation(identifiedApprovalOperation);
    const approvalOpHash = await safe4337Pack.executeTransaction({
      executable: signedApprovalOperation
    });
    
    console.log('USDC approval operation hash:', approvalOpHash);
    
    // Wait for approval to complete
    let isApprovalComplete = false;
    while (!isApprovalComplete) {
      const operationResult = await safe4337Pack.getUserOperationReceipt(approvalOpHash);
      isApprovalComplete = operationResult !== null && operationResult.success;
      if (!isApprovalComplete) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before checking again
      }
    }
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
  const swapTransactionData = {
    transactions: [
      {
        to: contractAddress,
        data: swapData,
        value: '0',
      }
    ]
  } as CreateTransactionProps;
  const USDC = {
    chainId: chainid || 11155111,
    address: getAddress(USDC_ADDRESS),
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  } as Token2;

  const USDT = {
    chainId: chainid || 11155111,
    address: getAddress(USDT_ADDRESS),
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
  } as Token2;

  // const swapData = await constructSingleTrade({
  //   chainId: (chainid ? chainid : globalChainId) as 1 | 10 | 56 | 137 | 8453 | 43114 | 42161,
  //   recipient: safeAddress,
  //   sourceToken: USDC,
  //   targetToken: USDT,
  //   amount: usdcBalance,
  //   slippageTolerance: 3000
  // });
  // const swapTransactionData = {
  //   transactions: [
  //     {
  //       to: swapData?.to,
  //       data: swapData?.calldata,
  //       value: swapData?.value || '0',
  //     }
  //   ]
  // } as CreateTransactionProps;
  //console.log('creating swap transaction', swapTransactionData);
  const swapTransaction = await safe4337Pack.createTransaction({
    transactions: swapTransactionData.transactions
  });
  console.log('swap transaction created');
  const identifiedSwapOperation = await safe4337Pack.getEstimateFee({
    safeOperation: swapTransaction
  });
  console.log('identified swap operation');
  const signedSwapOperation = await safe4337Pack.signSafeOperation(identifiedSwapOperation);
  const swapOpHash = await safe4337Pack.executeTransaction({
    executable: signedSwapOperation
  });
  
  console.log('USDC to USDT swap operation hash:', swapOpHash);
  
  // Wait for the operation to complete
  let isOperationSuccess = false;
  let maxAttempts = 10;
  let attempts = 0;
  
  while (!isOperationSuccess && attempts < maxAttempts) {
    attempts++;
    try {
      const userOperationResult = await safe4337Pack.getUserOperationReceipt(swapOpHash);
      isOperationSuccess = userOperationResult !== null && userOperationResult.success;
      if (isOperationSuccess) {
        console.log('USDC to USDT swap completed successfully');
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before checking again
      }
    } catch (error) {
      console.error('Error checking operation status:', error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Verify the new USDT balance
  if (isOperationSuccess) {
    const newUsdtBalance = await pubClient.readContract({
      address: getAddress(USDT_ADDRESS),
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [safeAddress]
    }) as bigint;
    
    console.log('New USDT balance after swap:', newUsdtBalance.toString());
  }
  
  return swapOpHash;
}