'use server';
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts"
import { createPaymasterClient } from "viem/account-abstraction";
import { SafeAccountConfig, SafeSigner } from '@safe-global/protocol-kit';
import {
  createSafeClient,
  safeOperations,
  BundlerOptions
} from '@safe-global/sdk-starter-kit'
import {
  Safe4337InitOptions,
  Safe4337Pack,
  SponsoredPaymasterOption
} from '@safe-global/relay-kit'

import { Transaction, } from '@safe-global/types-kit';
import { ethers } from 'ethers';
import { JsonRpcProvider, getDefaultProvider, BaseProvider } from '@ethersproject/providers';
import SafeFactory from '@safe-global/protocol-kit'
import { Hex, createPublicClient, getContract, http, createClient } from "viem"
import { generatePrivateKey, privateKeyToAccount, parseAccount, LocalAccount } from "viem/accounts"
import { sepolia, baseSepolia } from "viem/chains"
import { createPimlicoClient } from "permissionless/clients/pimlico"
import {  createBundlerClient, entryPoint07Address } from "viem/account-abstraction"

const RPC_URL = 'https://mainnet.infura.io/v3/your-infura-key';
const CORP_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_DEVACCOUNTADDRESS;
//const corpAccount = parseAccount(CORP_PUBLIC_ADDRESS) as LocalAccount;

export interface CreateAccountOptions {
  //ownerPrivateKey: string;
  rpcUrl: string;
  owner: string;
  threshold: number;
  //signer: SafeSigner;
}

export async function createAccount(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl } = options;

  const safeAccountConfig: SafeAccountConfig = {
    owners: [owner, CORP_PUBLIC_ADDRESS],
    threshold: 1,
  };

  const paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
  const bundlerUrl = `https://api.pimlico.io/v1/sepolia/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
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
  
  const userOperationHash = await safe4337Pack.executeTransaction({
      executable: signedSafeOperation
  })

  return safeAddress;
}

export async function sendTransaction(transaction: Transaction, signer: SafeSigner ): Promise<void> {
  // const safeAccount = await toSafeSmartAccount({
  //   client: publicClient,
  //   owners: [corpAccount],
  //   entryPoint: {
  //     address: entryPoint07Address,
  //     version: "0.7"
  //   }, // global entrypoint
  //   version: "1.4.1",
  // })

  const safeClient = await createSafeClient({
    provider: RPC_URL,
    signer,
    safeAddress: '0x...'
  })
  const paymaster = createPaymasterClient({
    transport: http(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMELCO_API_KEY}`)
  })
  const bundlerOptions: BundlerOptions = {
    bundlerUrl: `https://api.pimlico.io/v1/sepolia/rpc?apikey=${process.env.PIMLICO_API_KEY}`
  }
  
  const paymasterOptions : SponsoredPaymasterOption = {
    isSponsored: true,
    paymasterUrl: `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMLICO_API_KEY}`
  }
  const safeClientWithSafeOperation = await safeClient.extend(
    safeOperations(bundlerOptions, paymasterOptions)
  )
}
