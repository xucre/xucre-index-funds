'use server';
import Safe, { ContractNetworksConfig, CreateTransactionProps, PredictedSafeProps, SafeAccountConfig, SafeDeploymentConfig } from '@safe-global/protocol-kit';
import {
  Safe4337InitOptions,
  Safe4337Pack
} from '@safe-global/relay-kit'
import { isDev } from './constants';
import { polygon, sepolia } from 'viem/chains'
import { ByteArray, defineChain, encodeFunctionData, getAddress } from 'viem';
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
import { writeContract } from 'viem/actions';
import { encodeStringToBigInt } from './helpers';

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
const MAX_UINT256 = `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`;
const CORP_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_DEVACCOUNTADDRESS;
//const corpAccount = parseAccount(CORP_PUBLIC_ADDRESS) as LocalAccount;
const CORP_ACCOUNT = privateKeyToAccount(process.env.DEVACCOUNTKEY as `0x${string}`);
const transport = (chainid) => {
  return http(`https://api.pimlico.io/v2/${chainid ? chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`)
}
const publicClient = (chainid : number) => {
  return createPublicClient({
    chain: chainIdToChain[chainid ? chainid : 11155111],
    transport: transport(chainid),
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
  //signer: SafeSigner;
}

export async function createAccount_new(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl, singleOwner, chainid } = options;
  console.log('createSafe',owner, threshold, rpcUrl);
  const safeAccountConfig: SafeAccountConfig = singleOwner || owner === '' ? {
    owners: [CORP_PUBLIC_ADDRESS as `0x${string}`],
    threshold: 1,
  } :{
    owners: [owner as `0x${string}`, CORP_PUBLIC_ADDRESS as `0x${string}`],
    threshold: 1,
  };


  const owners = singleOwner || owner === '' ? [CORP_ACCOUNT]:[{address: owner, type: 'local'}, CORP_ACCOUNT];
  const client = publicClient(chainid ? chainid : 11155111);
  const safeAccount = await toSafeSmartAccount({
    client: client,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    owners: [CORP_ACCOUNT],
    version: "1.4.1"
  })
  
  const _paymasterClient = paymasterClient(chainid || 11155111);
  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    chain: chainIdToChain[chainid ? chainid : 11155111],
    paymaster: _paymasterClient,
    bundlerTransport: transport(chainid),
    userOperation: {
      estimateFeesPerGas: async () => (await _paymasterClient.getUserOperationGasPrice()).fast,
    },
  })
  
  return safeAccount.address;
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

  
  console.log('safeAddress', safeAddress);
  const rawApprovalData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [contractAddressMap[chainid || 137], MAX_UINT256],
  });
  const secondTransactionData = {
    transactions: [
      {
        to: getAddress(USDC_ADDRESS),
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
  // const secondTransactionHash = await client.sendTransaction({
  //   to: getAddress(USDC_ADDRESS),
  //   value: '0',
  //   data: secondTransaction.data as `0x${string}`,
  //   account: CORP_ACCOUNT,
  //   chain: chainIdToChain[chainid ? chainid : 11155111],
  //   kzg: undefined
  // });
  // const secondTransactionHash = await client.sendTransaction({
  //   abi: ERC20_ABI,
  //   address: getAddress(USDC_ADDRESS),
  //   functionName: 'approve',
  //   chainid,
  //   args: [
  //     contractAddressMap[chainid || 137],
  //     MAX_UINT256,
  //   ],
  //   chain: chainIdToChain[chainid ? chainid : 11155111],
  //   account: safeAddress,
  //   signer: CORP_ACCOUNT
  // })
  console.log('userOperationHash', userOperationHash);
  return safeAddress;
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

export interface InvoiceTransactionOptions {
  safeAddress: string;
  tokenAddress: string;
  recipientAddress: string;
  amount: string;
  rpcUrl: string;
  chainid: number;
  contractNetworks?: ContractNetworksConfig;
}

// export async function createInvoiceTransaction(options: InvoiceTransactionOptions): Promise<string> {
//   const {
//     safeAddress,
//     tokenAddress,
//     recipientAddress,
//     amount,
//     rpcUrl,
//     chainid,
//     contractNetworks,
//   } = options;

//   const safeAccountConfig: SafeAccountConfig = {
//     owners: [CORP_PUBLIC_ADDRESS as `0x${string}`],
//     threshold: 1,
//   };

//   const packData = {
//       provider: rpcUrl,
//       signer : process.env.DEVACCOUNTKEY,
//       bundlerUrl: bundlerUrl(chainid || 11155111),
//       options: {
//         safeAddress
//       },
//       paymasterOptions: {
//           isSponsored: true,
//           paymasterUrl: paymasterUrl(chainid || 11155111),
//       }
//   } as Safe4337InitOptions;
//   const safe4337Pack = await Safe4337Pack.init(packData);
//   const smartAccountClient = createSmartAccountClient({
//     account: safe4337Pack.protocolKit,
//     chain: chainIdToChain[chainid || 11155111],
//     paymaster: paymasterClient,
//     bundlerTransport: http("https://api.pimlico.io/v2/sepolia/rpc?apikey=API_KEY"),
//     userOperation: {
//       estimateFeesPerGas: async () => (await paymasterClient.getUserOperationGasPrice()).fast,
//     },
//   })
//   // Encode ERC20 transfer data
//   const erc20Contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
//   const txData = erc20Contract.interface.encodeFunctionData('transfer', [
//     recipientAddress,
//     amount,
//   ]);

//   const safeTransactionData: SafeTransactionDataPartial = {
//     to: tokenAddress,
//     data: txData,
//     value: '0',
//   };

//   // Create the Safe transaction
//   const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });

//   // Propose the transaction (optional, if you're using a transaction service)
//   // await safeSdk.proposeTransaction({ safeTransaction });

//   // Sign the transaction
//   await safeSdk.signTransaction(safeTransaction);

//   // Execute the transaction
//   const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);

//   // Wait for the transaction to be mined
//   const receipt = await executeTxResponse.transactionResponse.wait();

//   return receipt.transactionHash;
// }