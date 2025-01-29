'use server';
import Safe, { buildContractSignature, buildSignatureBytes, ContractNetworksConfig, CreateTransactionProps, ExternalClient, ExternalSigner, PredictedSafeProps, SafeAccountConfig, SafeDeploymentConfig, SigningMethod } from '@safe-global/protocol-kit';
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
import ERC20_ABI from '../public/erc20.json'; // Ensure you have the ERC20 ABI JSON file
import XUCREINDEXFUNDS_ABI from '../public/XucreETF.json'; // Ensure you have the ERC20 ABI JSON file
import DEMO_PORTFOLIO from '../public/demoPortfolio.json'; // Ensure you have the ERC20 ABI JSON file
import { writeContract } from 'viem/actions';
import { distributeWeights, encodeStringToBigInt } from './helpers';
import { IndexFund, Invoice, InvoiceMember } from './types';
import { createFailureLog, getUserDetails } from './db';
import SafeApiKit, { AddSafeDelegateProps } from '@safe-global/api-kit';

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
  
  const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
  console.log('IsSafeDeployed', isSafeDeployed)
  if (!isSafeDeployed) {
    const client = await safe4337Pack.protocolKit.getSafeProvider().getExternalSigner()
    const pubClient = publicClient(chainid || 11155111);
    if (!client) return '';
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
    await createERC20ApprovalV2(chainid || globalChainId, rpcUrl, safeAddress);
  } 
  
  console.log('safeAddress', safeAddress);
  
  return safeAddress;
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

  // const secondTransaction = await safe4337Pack.createTransaction(secondTransactionData);
  // console.log('sending safe transaction created');
  // const identifiedSafeOperation = await safe4337Pack.getEstimateFee({
  //   safeOperation: secondTransaction
  // })

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
    SigningMethod.SAFE_SIGNATURE,
    PARENT_SAFE // Parent Safe address
  )
  const signatureSafe = await buildContractSignature(
    Array.from(signedTransaction.signatures.values()),
    CORP_SIGNER_SAFE as `0x${string}`,
  )
  //console.log('sending safe transaction gas estimated');
  // const signature = signedTransaction.getSignature(CORP_PUBLIC_ADDRESS as `0x${string}`);
  // if (!signature) {
  //   console.log(signedTransaction.signatures);
  //   console.log('signature not found');
  //   return '';
  // }
  //await identifiedSafeOperation.addSignature(signatureSafe);
  console.log('getting transaction hash');
  //console.log('signing safe transaction');
  //const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
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
  // const signatureConfirmation = await apiKit.confirmTransaction(
  //   safeTransactionHash,
  //   buildSignatureBytes([signatureSafe])
  // )

  //const userOperation = await apiKit.getTransaction(safeTxHash)
  
  console.log('sending safe transaction signed');
  
  const userOperation = await safe4337Pack.protocolKit.executeTransaction(proposedTransaction)
  console.log('userOperationHash', userOperation.hash);
  
  //let isOperationComplete = false;
  if (!userOperation.transactionResponse) throw new Error('Transaction not found');
  // @ts-ignore
  const receipt = await userOperation.transactionResponse?.wait();
  console.log('receipt', receipt);
  // console.log('disbursement of source to users successful');
  // const submittedTransactions = await options.invoice.members.map(async (member) => {
  //   try {
  //     await createUserSpotExecution(member, rpcUrl, chainid || 11155111);
  //   } catch (err) {console.log('error executing spot for memeber', member.safeWalletAddress)}
  //   return;
  // })
  // console.log('disbursement complete');
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
  const amount = parseUnits(member.salaryContribution.toString(), 6);

  if (member.salaryContribution < .01) return null;

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
    await createUserSpotExecution(member, rpcUrl, chainid, fundMap);
  } catch (err2) {
    console.log('error executing spot for member', member.safeWalletAddress);
    await createFailureLog(member.organization.id, invoiceId, member.id, 'error executing spot for member');
  }
}

export async function createUserSpotExecutionReversed(userId: string, safeWalletAddress: string, rpcUrl: string, chainid: number, amount: string, decimals: number, poolFee: number) {
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
  const pubClient = publicClient(chainid || 11155111);
  if (!client) {
    console.log('client not found');
    return;
  }
  const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
  console.log('IsUserSafeDeployed', isSafeDeployed);
  
  const memberContribution = parseUnits(amount, decimals);
  await validateCurrentERC20Allowance(chainid || globalChainId, safeAddress, memberContribution, safe4337Pack);

  console.log('building portfolio for user', safeWalletAddress);
  // const portfolio = selectedFund.portfolio;
  // const activeItems = portfolio.filter((item) => item.active);
  // const tokenAllocations = portfolio.map((item) => item.weight);
  // //const tokenAllocations = distributeWeights(activeItems);
  // const tokenAddresses = activeItems.map((item) => getAddress(item.address));
  // const tokenPoolFees = activeItems.map((item) => item.sourceFees[USDT_ADDRESS] ? item.sourceFees[USDT_ADDRESS] : item.poolFee);
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
      getAddress(USDT_ADDRESS),
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

  const userDisbursementTransactionData = {
    transactions: [
      userDisbursementTransactions
    ]
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
  const memberDetails = await getUserDetails(member.id);
  //console.log(memberDetails);
  if (memberDetails === null) return;
  const selectedFund = fundMap[memberDetails.riskTolerance] || DEMO_PORTFOLIO;
  //console.log('building portfolio for user', member.safeWalletAddress);
  //console.log(memberDetails.riskTolerance, selectedFund);
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
  await validateCurrentERC20Allowance(chainid || globalChainId, safeAddress, memberContribution, safe4337Pack);
  if (member.salaryContribution < .01) {
    console.log('member salary contribution too low', member.safeWalletAddress);
    return;
  }
  console.log('building portfolio for user', member.safeWalletAddress);
  const portfolio = selectedFund.portfolio;
  const activeItems = portfolio.filter((item) => item.active);
  const tokenAllocations = portfolio.map((item) => item.weight);
  //const tokenAllocations = distributeWeights(activeItems);
  const tokenAddresses = activeItems.map((item) => getAddress(item.address));
  const tokenPoolFees = activeItems.map((item) => item.sourceFees[USDT_ADDRESS] ? item.sourceFees[USDT_ADDRESS] : item.poolFee);

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
    to: getAddress(contractAddressMap[chainid || globalChainId]),
    data: rawDisbursmentData,
    value: '0',
  }

  console.log('userDisbursementTransactions', userDisbursementTransactions.to);

  const userDisbursementTransactionData = {
    transactions: [
      userDisbursementTransactions
    ]
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

async function createUserSpotExecutionV2(member: InvoiceMember, rpcUrl: string, chainid: number, fundMap: {[key: string]: IndexFund}) {
  const memberDetails = await getUserDetails(member.id);
  if (memberDetails === null) return;
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
    to: getAddress(contractAddressMap[chainid || globalChainId]),
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

async function validateCurrentERC20Allowance (chainid: number, safeAddress: string, memberContribution: bigint, safe4337Pack: Safe4337Pack) {
  const _allowance = await getCurrentERC20Allowance(chainid, safeAddress);
  //console.log(_allowance, memberContribution, _allowance < memberContribution);
  if (_allowance < memberContribution) {
    await createERC20Approval(chainid, process.env.NEXT_PUBLIC_SAFE_RPC_URL as string, safe4337Pack);
  }
}

async function getCurrentERC20Allowance (chainid: number, safeAddress: string) {
  const pubCli = publicClient(chainid);
  
  const _allowance = await pubCli.readContract({
    address: getAddress(USDT_ADDRESS),
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [safeAddress, contractAddressMap[chainid || globalChainId]]
  })
  return _allowance as bigint;

}

async function createERC20Approval (chainid: number, rpcUrl: string, safe4337Pack: Safe4337Pack) {
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

  let isOperationSuccess = false;
  while (!isOperationSuccess) {
    console.log('checking allowance for success');
    const userOperationResult = await safe4337Pack.getUserOperationReceipt(userOperationHash);
    isOperationSuccess = userOperationResult !== null;
  } 

}

async function createERC20ApprovalV2 (chainid: number, rpcUrl: string, safeAddress: string) {
  const safeAccountConfig = {
    safeAddress: CORP_SIGNER_SAFE as `0x${string}`,
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

  const rawApprovalData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [contractAddressMap[chainid || globalChainId], MAX_UINT256],
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
  const signer = createWalletClient({
    account: CORP_ACCOUNT,
    chain: chainIdToChain[chainid],
    transport: http(),
  });
  const apiKit = new SafeApiKit({ chainId: BigInt(chainid || globalChainId)})
  const conf = {
    safeAddress: safeWallet
  }
  
  const delegates = await apiKit.getSafeDelegates(conf);
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
    transport: http(),
  });
  const _chainid = BigInt(chainid || globalChainId);
  console.log('chainid', _chainid);
  const apiKit = new SafeApiKit({ chainId: _chainid})
  const conf: AddSafeDelegateProps = {
    safeAddress: safeWallet, // Optional
    delegateAddress: proposer,
    delegatorAddress: CORP_PUBLIC_ADDRESS as `0x${string}`,
    label: name,
    signer,
  }
  // try {
    await apiKit.addSafeDelegate(conf)
    // .catch((err) => {
    //   console.log('error adding proposer', err.success, err.message, conf.safeAddress, conf.delegateAddress, conf.delegatorAddress, conf.label, signer.account.address);
    //   return {success: false, message: err.message};
    // });
  // } catch (err) {
  //   console.log('error adding proposer', JSON.stringify(err), conf.safeAddress, conf.delegateAddress, conf.delegatorAddress, conf.label, signer.account.address);
  //   return {success: false, message: JSON.stringify(err)};
  // }
  //await apiKit.addSafeDelegate(conf);
  return {
    success: true,
    message: ''
  };
}
