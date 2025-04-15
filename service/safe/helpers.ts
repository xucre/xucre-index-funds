
import { polygon, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http } from "viem"
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import {
    entryPoint07Address,
} from "viem/account-abstraction"
//const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)


export const chainIdToChain = {
  11155111 : sepolia,
  137: polygon
};

export const contractAddressMap = {
  1: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ETH,
  137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  8453: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE,
  31337 : '0xCBBe2A5c3A22BE749D5DDF24e9534f98951983e2'
};

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as string;
export const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS as string;
export const MAX_UINT256 = `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`;
export const CORP_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_DEVACCOUNTADDRESS;
export const CORP_SIGNER_SAFE = process.env.NEXT_PUBLIC_SIGNER_SAFE_ADDRESS_POLYGON;
//const corpAccount = parseAccount(CORP_PUBLIC_ADDRESS) as LocalAccount;
export const CORP_ACCOUNT = privateKeyToAccount(process.env.DEVACCOUNTKEY as `0x${string}`);
export const transport = (chainid) => {
  return http(`https://api.pimlico.io/v2/${chainid ? chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`)
}

export const publicTransport = () => {
  return http(process.env.NEXT_PUBLIC_SAFE_RPC_URL)
}
export const publicClient = (chainid : number) => {
  return createPublicClient({
    chain: chainIdToChain[chainid ? chainid : 11155111],
    transport: publicTransport(),
  })
}

export const paymasterClient = (chainid : number) => {
  return createPimlicoClient({
    transport: transport(chainid),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  })
} 

export const bundlerUrl = (chainid : number) => {
 return `https://api.pimlico.io/v2/${chainid ? chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
}

export const paymasterUrl = (chainid : number) => {
  return `https://api.pimlico.io/v2/${chainid ? chainid : '11155111'}/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
}