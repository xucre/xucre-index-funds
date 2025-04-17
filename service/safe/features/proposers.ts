import { globalChainId } from "@/service/constants";
import SafeApiKit, { AddSafeDelegateProps } from "@safe-global/api-kit";
import { createWalletClient } from "viem";
import { CORP_ACCOUNT, chainIdToChain, publicTransport, CORP_PUBLIC_ADDRESS } from "../helpers";

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
    await apiKit.addSafeDelegate(conf);
  } catch (err) {
    console.log('error adding proposer', JSON.stringify(err), conf.safeAddress, conf.delegateAddress, conf.delegatorAddress, conf.label, signer.account.address);
    return {success: false, message: JSON.stringify(err)};
  }
  return {
    success: true,
    message: ''
  };
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