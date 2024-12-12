'use server';
import Safe, { ContractNetworksConfig, CreateTransactionProps, ExternalSigner, PredictedSafeProps, SafeAccountConfig, SafeDeploymentConfig, SigningMethod } from '@safe-global/protocol-kit';
import {
  EthSafeOperation,
  Safe4337InitOptions,
  Safe4337Pack
} from '@safe-global/relay-kit'
import {
  createSafeClient,
  safeOperations,
  BundlerOptions
} from '@safe-global/sdk-starter-kit'

import { isDev } from './constants';
import { polygon, sepolia } from 'viem/chains'
import { ByteArray, Client, defineChain, encodeFunctionData, getAddress, parseUnits } from 'viem';
import { mainnetTrustedSetupPath } from 'viem/node'
import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient,  } from "permissionless"
import { createPublicClient, getContract, http, parseEther } from "viem"
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
import ERC20_ABI from '../public/erc20.json'; // Ensure you have the ERC20 ABI JSON file
import XUCREINDEXFUNDS_ABI from '../public/XucreETF.json'; // Ensure you have the ERC20 ABI JSON file
import DEMO_PORTFOLIO from '../public/demoPortfolio.json'; // Ensure you have the ERC20 ABI JSON file
import { writeContract } from 'viem/actions';
import { distributeWeights, encodeStringToBigInt } from './helpers';
import { IndexFund, Invoice, InvoiceMember } from './types';
import { createFailureLog, getUserDetails } from './db';

const buildbear = defineChain({
  id: 19819,
  name: 'Test Sandbox',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.buildbear.io/vicious-goose-bfec7fbe'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://explorer.buildbear.io/vicious-goose-bfec7fbe/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160,
    },
  },
  testnet: true,
})

const chainIdToChain = {
  11155111 : sepolia,
  137: polygon,
  19819: buildbear,
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

export interface TransferSignerOwnershipOptions {
  rpcUrl: string;
  chainid: number;
  safeWallet: string;
  newOwner: string;
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
  }
  const allowance = await getCurrentERC20Allowance(chainid || 137, safeAddress);
  if (allowance < BigInt(MAX_UINT256)) {
    await createERC20Approval(chainid || 137, rpcUrl, safe4337Pack);
  } 

  
  console.log('safeAddress', safeAddress);
  
  return safeAddress;
}

export async function createAccountV2(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl, singleOwner, chainid, id } = options;
  console.log('createSafe',owner, threshold, rpcUrl);
  const safeAccountConfig = singleOwner || owner === '' ? {
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
  }

  const allowance = await getCurrentERC20Allowance(chainid || 137, safeAddress);
  if (allowance < BigInt(MAX_UINT256)) {
    await createERC20ApprovalV2(chainid || 137, rpcUrl, safe4337Pack);
  } 
  
  console.log('safeAddress', safeAddress);
  
  return safeAddress;
}

export async function transferSignerOwnership(options: TransferSignerOwnershipOptions): Promise<void> {
  const { rpcUrl, chainid, safeWallet } = options;
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
    newOwnerAddress: CORP_SIGNER_SAFE as `0x${string}`,
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
  console.log('transfer successful');
  return;
}

export async function createAccountSelfSign(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl } = options;
  console.log('createAccountSelfSign',owner, threshold, rpcUrl);
  const safeAccountConfig: SafeAccountConfig = options.singleOwner ? {
    owners: [CORP_PUBLIC_ADDRESS as `0x${string}`],
    threshold: 1,
  } :{
    owners: [owner, CORP_PUBLIC_ADDRESS as `0x${string}`],
    threshold: 1,
  };

  const predictedSafe: PredictedSafeProps = {
    safeAccountConfig
    // More optional properties
  }

  console.log('do it again');
  // const protocolKit = await Safe.init({
  //   provider: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
  //   signer: process.env.DEVACCOUNTKEY,
  //   predictedSafe,
  //   contractNetworks: {
  //     [buildbear.id]: {
  //       multiSendAddress: '0xca11bde05977b3631167028862be2a173976ca11',
  //       multiSendCallOnlyAddress: '0xca11bde05977b3631167028862be2a173976ca11',
  //       safeSingletonAddress, safeProxyFactoryAddress, fallbackHandlerAddress, signMessageLibAddress,
  //     }
  //   } as ContractNetworksConfig
  // })
 
  //const safeAddress = await protocolKit.getAddress()
  // const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction()

  // const client = await protocolKit.getSafeProvider().getExternalSigner()

  // const transactionHash = await client.sendTransaction({
  //   to: deploymentTransaction.to,
  //   value: BigInt(deploymentTransaction.value),
  //   data: deploymentTransaction.data as `0x${string}`,
  //   account: CORP_ACCOUNT,
  //   chain: buildbear,
  //   kzg: undefined
  // });
  

  return 'safeAddress';
}

export interface CreateInvoiceOptions {
  //ownerPrivateKey: string;
  rpcUrl: string;
  owner: string;
  chainid?: number;
  id: string;
  invoice: Invoice;
  //signer: SafeSigner;
}

export async function createInvoiceTransaction(options: CreateInvoiceOptions): Promise<string> {
  const { owner, rpcUrl, chainid, id } = options;
  const safeAccountConfig = owner === '' ? {
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
      args: [contractAddressMap[chainid || 137], MAX_UINT256],
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

  const invoiceTransactions = options.invoice.members.map((member) => {
    return createUserSourceTransfer(member);
  })
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
  // const submittedTransactions = await options.invoice.members.map(async (member) => {
  //   try {
  //     await createUserSpotExecution(member, rpcUrl, chainid || 11155111);
  //   } catch (err) {console.log('error executing spot for memeber', member.safeWalletAddress)}
  //   return;
  // })
  // console.log('disbursement complete');
  return safeAddress;
}

export async function createInvoiceTransactionV2(options: CreateInvoiceOptions): Promise<string> {
  const { owner, rpcUrl, chainid, id } = options;
  const safeAccountConfig = owner === '' ? {
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
      safeAddress: CORP_SIGNER_SAFE,
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
      args: [contractAddressMap[chainid || 137], MAX_UINT256],
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

  const invoiceTransactions = options.invoice.members.map((member) => {
    return createUserSourceTransfer(member);
  })
  const secondTransactionData = {
    transactions: [
      ...invoiceTransactions
    ]
  } as CreateTransactionProps;

  const newConnect = await safe4337Pack.protocolKit.connect({
    provider: rpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });

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
  // const submittedTransactions = await options.invoice.members.map(async (member) => {
  //   try {
  //     await createUserSpotExecution(member, rpcUrl, chainid || 11155111);
  //   } catch (err) {console.log('error executing spot for memeber', member.safeWalletAddress)}
  //   return;
  // })
  // console.log('disbursement complete');
  return safeAddress;
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
  const amount = parseUnits(member.salaryContribution.toString(), 6);

  const rawTransferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [recipientAddress, amount],
  });
  return {
    to: getAddress(USDT_ADDRESS),
    data: rawTransferData,
    value: '0',
  };
}

export async function executeUserSpotExecution (member: InvoiceMember, rpcUrl: string, chainid: number, invoiceId: string, fundMap: {[key: string]: IndexFund}) {
  try {
    await createUserSpotExecution(member, rpcUrl, chainid, fundMap);
  } catch (err2) {
    console.log('error executing retry spot for member', member.safeWalletAddress);
    await createFailureLog(member.organization.id, invoiceId, member.id, 'error executing spot for member');
  }
}

async function createUserSpotExecution(member: InvoiceMember, rpcUrl: string, chainid: number, fundMap: {[key: string]: IndexFund}) {
  const memberDetails = await getUserDetails(member.id);
  const selectedFund = fundMap[memberDetails.riskTolerance] || DEMO_PORTFOLIO;
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
  
  const memberContribution = parseUnits(member.salaryContribution.toString(), 6);
  

  console.log('building portfolio for user', member.safeWalletAddress);
  const portfolio = selectedFund.portfolio;
  const tokenAllocations = distributeWeights(portfolio);
  const tokenAddresses = portfolio.map((item) => getAddress(item.address));
  const tokenPoolFees = portfolio.map((item) => item.sourceFees[USDT_ADDRESS] ? item.sourceFees[USDT_ADDRESS] : item.poolFee);

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
  //console.log('unencodedData', unencodedData);
  const rawDisbursmentData = encodeFunctionData(unencodedData);
  //console.log('rawDisbursmentData', rawDisbursmentData);
  const userDisbursementTransactions = {
    to: getAddress(contractAddressMap[chainid || 137]),
    data: rawDisbursmentData,
    value: '0',
  }

  const userDisbursementTransactionData = {
    transactions: [
      userDisbursementTransactions
    ]
  } as CreateTransactionProps;
  console.log('UserDisbursementTransactionData');
  const userDisbursementTransaction = await safe4337Pack.protocolKit.createTransaction({
    transactions: userDisbursementTransactionData.transactions,
  });   
  
  //console.log('UserDisbursementTransaction');
  // const userDisbursementSafeOperation = await safe4337Pack.getEstimateFee({
  //   safeOperation: userDisbursementTransaction
  // })
  console.log('UserDisbursementSafeOperation');
  const signedUserDisbursementSafeOperation = await safe4337Pack.protocolKit.signTransaction(userDisbursementTransaction)
  let finalHash = '';
  try {
    const userDisbursementOperationHash = await safe4337Pack.protocolKit.executeTransaction(signedUserDisbursementSafeOperation)
    console.log('UserDisbursementOperationHash', userDisbursementOperationHash.hash);
    finalHash = userDisbursementOperationHash.hash;
  } catch (err) {
    console.log('error executing spot for member', member.safeWalletAddress);
    console.log('retrying disbursement');
    const userDisbursementOperationHash = await safe4337Pack.protocolKit.executeTransaction(signedUserDisbursementSafeOperation)
    console.log('UserDisbursementOperationHash', userDisbursementOperationHash.hash);
    finalHash = userDisbursementOperationHash.hash;    
  }
  
  return finalHash;
}

async function createUserSpotExecutionV2(member: InvoiceMember, rpcUrl: string, chainid: number, fundMap: {[key: string]: IndexFund}) {
  const memberDetails = await getUserDetails(member.id);
  const selectedFund = fundMap[memberDetails.riskTolerance] || DEMO_PORTFOLIO;
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
  
  const memberContribution = parseUnits(member.salaryContribution.toString(), 6);
  

  console.log('building portfolio for user', member.safeWalletAddress);
  const portfolio = selectedFund.portfolio;
  const tokenAllocations = distributeWeights(portfolio);
  const tokenAddresses = portfolio.map((item) => getAddress(item.address));
  const tokenPoolFees = portfolio.map((item) => item.sourceFees[USDT_ADDRESS] ? item.sourceFees[USDT_ADDRESS] : item.poolFee);

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
  //console.log('unencodedData', unencodedData);
  const rawDisbursmentData = encodeFunctionData(unencodedData);
  //console.log('rawDisbursmentData', rawDisbursmentData);
  const userDisbursementTransactions = {
    to: getAddress(contractAddressMap[chainid || 137]),
    data: rawDisbursmentData,
    value: '0',
  }

  const userDisbursementTransactionData = {
    transactions: [
      userDisbursementTransactions
    ]
  } as CreateTransactionProps;
  console.log('UserDisbursementTransactionData');
  const userDisbursementTransaction = await safe4337Pack.protocolKit.createTransaction({
    transactions: userDisbursementTransactionData.transactions,
  });   
  
  //console.log('UserDisbursementTransaction');
  // const userDisbursementSafeOperation = await safe4337Pack.getEstimateFee({
  //   safeOperation: userDisbursementTransaction
  // })
  console.log('UserDisbursementSafeOperation');
  const signedUserDisbursementSafeOperation = await safe4337Pack.protocolKit.signTransaction(userDisbursementTransaction)
  let finalHash = '';
  try {
    const userDisbursementOperationHash = await safe4337Pack.protocolKit.executeTransaction(signedUserDisbursementSafeOperation)
    console.log('UserDisbursementOperationHash', userDisbursementOperationHash.hash);
    finalHash = userDisbursementOperationHash.hash;
  } catch (err) {
    console.log('error executing spot for member', member.safeWalletAddress);
    console.log('retrying disbursement');
    const userDisbursementOperationHash = await safe4337Pack.protocolKit.executeTransaction(signedUserDisbursementSafeOperation)
    console.log('UserDisbursementOperationHash', userDisbursementOperationHash.hash);
    finalHash = userDisbursementOperationHash.hash;    
  }
  
  return finalHash;
}

async function getCurrentERC20Allowance (chainid: number, safeAddress: string) {
  const pubCli = publicClient(chainid);
  
  const _allowance = await pubCli.readContract({
    address: getAddress(USDT_ADDRESS),
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [safeAddress, contractAddressMap[chainid || 137]]
  })
  return _allowance as bigint;

}

async function createERC20Approval (chainid: number, rpcUrl: string, safe4337Pack: Safe4337Pack) {
  const rawApprovalData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [contractAddressMap[chainid || 137], MAX_UINT256],
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
}

async function createERC20ApprovalV2 (chainid: number, rpcUrl: string, safe4337Pack: Safe4337Pack) {
  const rawApprovalData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [contractAddressMap[chainid || 137], MAX_UINT256],
  });
  const transaction = {
    to: getAddress(USDT_ADDRESS),
    data: rawApprovalData,
    value: '0',
  };

  const controllingSafe = await safe4337Pack.protocolKit.connect({
    provider: rpcUrl,
    signer: process.env.DEVACCOUNTKEY,
    safeAddress: CORP_SIGNER_SAFE
  });

  const trans = await controllingSafe.createTransaction({transactions: [transaction], onlyCalls: true});

  const signedTransaction =  await controllingSafe.signTransaction(
    trans,
    SigningMethod.SAFE_SIGNATURE,
    CORP_SIGNER_SAFE // Parent Safe address
  )

  const secondTransactionData = {
    transactions: [
      {
        to: signedTransaction.data.to,
        data: signedTransaction.data.data,
        value: signedTransaction.data.value
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
}