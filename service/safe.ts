'use server';
import Safe, { ContractNetworksConfig, PredictedSafeProps, SafeAccountConfig } from '@safe-global/protocol-kit';
import {
  Safe4337InitOptions,
  Safe4337Pack
} from '@safe-global/relay-kit'
import { isDev } from './constants';
import { polygon } from 'viem/chains'
import { ByteArray, defineChain } from 'viem';
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'
import { privateKeyToAccount } from 'viem/accounts';
//const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)

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

const CORP_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_DEVACCOUNTADDRESS;
//const corpAccount = parseAccount(CORP_PUBLIC_ADDRESS) as LocalAccount;
const CORP_ACCOUNT = privateKeyToAccount(process.env.DEVACCOUNTKEY as `0x${string}`);

export interface CreateAccountOptions {
  //ownerPrivateKey: string;
  rpcUrl: string;
  owner: string;
  threshold: number;
  singleOwner?: boolean;
  chainid?: number;
  //signer: SafeSigner;
}

export async function createAccount(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl } = options;
  console.log('createSafe',owner, threshold, rpcUrl);
  const safeAccountConfig: SafeAccountConfig = options.singleOwner ? {
    owners: [CORP_PUBLIC_ADDRESS],
    threshold: 1,
  } :{
    owners: [owner, CORP_PUBLIC_ADDRESS],
    threshold: 1,
  };

  const paymasterUrl = `https://api.pimlico.io/v2/${options.chainid ? options.chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
  const bundlerUrl = `https://api.pimlico.io/v2/${options.chainid ? options.chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
  //console.log(paymasterUrl, safeAccountConfig);
  const packData = {
      provider: rpcUrl,
      signer : process.env.DEVACCOUNTKEY,
      bundlerUrl: bundlerUrl,
      options: safeAccountConfig,
      paymasterOptions: {
          isSponsored: true,
          paymasterUrl: paymasterUrl,
      }
  } as Safe4337InitOptions;
  const safe4337Pack = await Safe4337Pack.init(packData);
  const safeAddress = await safe4337Pack.protocolKit.getAddress();
  const noOpTransaction = {
      to: safeAddress,
      value: '0',
      data: '0x', 
  };
  
  const safeOperation = await safe4337Pack.createTransaction({ transactions: [noOpTransaction] })
  
  const signedSafeOperation = await safe4337Pack.signSafeOperation(safeOperation)
  

  return safeAddress;
}

export async function createAccountSelfSign(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl } = options;
  console.log('createAccountSelfSign',owner, threshold, rpcUrl);
  const safeAccountConfig: SafeAccountConfig = options.singleOwner ? {
    owners: [CORP_PUBLIC_ADDRESS],
    threshold: 1,
  } :{
    owners: [owner, CORP_PUBLIC_ADDRESS],
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
