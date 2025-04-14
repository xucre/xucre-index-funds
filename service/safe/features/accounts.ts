'use server';
import { Safe4337InitOptions, Safe4337Pack } from "@safe-global/relay-kit";
import { globalChainId } from "../../constants";
import { encodeStringToBigInt } from "../../helpers";
import { CORP_PUBLIC_ADDRESS, bundlerUrl, paymasterUrl, publicClient, CORP_ACCOUNT, chainIdToChain, MAX_UINT256, CORP_SIGNER_SAFE } from "../helpers";
import { addProposer as _addProposer, AddProposerOptions as _AddProposerOptions, GetProposerOptions as _GetProposerOptions, getSafeProposer as _getSafeProposer } from "./proposers";
import { createERC20Approval, getCurrentERC20Allowance } from "./erc20";
import { createSafeClient } from "@safe-global/sdk-starter-kit";

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
  salt?: string; // added salt as a persistent value
}

export async function createAccount(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl, singleOwner, chainid, id, salt } = options; // include salt in destructuring
  console.log('createSafe', owner, threshold, rpcUrl);
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

export async function deploySafe(safe4337Pack: Safe4337Pack, chainid: number) {
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

  return;
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
  await deploySafe(safe4337Pack, chainid || 11155111);
  
  const allowance = await getCurrentERC20Allowance(chainid || globalChainId, safeAddress);
  if (allowance < BigInt(MAX_UINT256)) {
    console.log('running allowance creation');
    await createERC20Approval({
      safeAddress: safeAddress,
      rpcUrl: rpcUrl,
      chainid: chainid || globalChainId
    });
  } 
}

export interface AddOwnerOptions {
  chainid: number;
  safeWallet: string;
  proposer: string;
  name: string;
}

export interface AddSignerOwnershipOptions {
  chainid: number;
  safeWallet: string;
}

export async function addSignerOwnership(options: AddSignerOwnershipOptions): Promise<void> {
  const { chainid, safeWallet } = options;
  console.log('addSignerOwnership', chainid, safeWallet, CORP_PUBLIC_ADDRESS);
  const packData = {
    provider: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    signer : process.env.DEVACCOUNTKEY,
    //safeAddress: CORP_SIGNER_SAFE,
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
  const address = await safe4337Pack.protocolKit.getAddress();
  console.log('safe address', address);
  const transaction = await safe4337Pack.protocolKit.createAddOwnerTx({
    ownerAddress: CORP_SIGNER_SAFE as `0x${string}`,
    threshold: 1,
  })  
  // const transaction = await safe4337Pack.protocolKit.createSwapOwnerTx({
  //   oldOwnerAddress: CORP_PUBLIC_ADDRESS as `0x${string}`,
  //   newOwnerAddress: '' as `0x${string}`,
  // } as CreateTransactionProps)
  
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

export async function removeSignerOwnership(options: AddSignerOwnershipOptions): Promise<void> {
  const { chainid, safeWallet } = options;
  console.log('addSignerOwnership', chainid, safeWallet, CORP_PUBLIC_ADDRESS);
  const packData = {
    provider: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    signer : process.env.DEVACCOUNTKEY,
    //safeAddress: CORP_SIGNER_SAFE,
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
  const address = await safe4337Pack.protocolKit.getAddress();
  console.log('safe address', address);
  const transaction = await safe4337Pack.protocolKit.createRemoveOwnerTx({
    ownerAddress: CORP_PUBLIC_ADDRESS as `0x${string}`,
    threshold: 1,
  })
  // const transaction = await safe4337Pack.protocolKit.createSwapOwnerTx({
  //   oldOwnerAddress: CORP_PUBLIC_ADDRESS as `0x${string}`,
  //   newOwnerAddress: '' as `0x${string}`,
  // } as CreateTransactionProps)
  
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

export interface TransferSignerOwnershipOptions {
  chainid: number;
  safeWallet: string;
  
}

export async function transferSignerOwnership(options: TransferSignerOwnershipOptions): Promise<string> {
  const { chainid, safeWallet } = options;
  const packData = {
    provider: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    signer : process.env.DEVACCOUNTKEY,
    //safeAddress: CORP_SIGNER_SAFE,
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
  // await safe4337Pack.protocolKit.createAddOwnerTx({
  //   ownerAddress: CORP_PUBLIC_ADDRESS as `0x${string}`,
  //   threshold: 1,
  // })
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
  console.log('transfer successful', userOperationHash);
  return userOperationHash;
}
