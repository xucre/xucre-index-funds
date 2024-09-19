'use client';
import { ChainMetadata } from '@/context/types';
import { SolanaMetadata } from '@/service/chains/solana';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { defineChain } from 'viem';

import { type Chain } from 'viem'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, polygon, polygonMumbai, celo, Chain } from 'wagmi/chains'
import { createWeb3Modal, defaultSolanaConfig } from '@web3modal/solana/react'
import { solana, solanaTestnet, solanaDevnet } from '@web3modal/solana/chains'
// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Xucre Crypto Index Fund',
  description: 'dApp enabling users to invest in a diversified portfolio of cryptocurrencies',
  url: 'https://fund.xucre.net', // origin must match your domain & subdomain
  icons: ['https://swap.xucre.net/icon-green.png']
}

const customChain = defineChain({
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
  testnet: true,
})

const polygon2 = defineChain({
  id: 137,
  name: 'Polygon',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://polygon.llamarpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com/',
    },
  },
  testnet: false,
})

const ethereumDev = defineChain({
  id: 20208,
  name: 'Ethereum Dev',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.buildbear.io/pregnant-bedlam-1666118b'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BuidlBear',
      url: 'https://explorer.buildbear.io/pregnant-bedlam-1666118b/',
    },
  },
  testnet: false,
})



export function getChainMetadata(chainId: string): ChainMetadata {
  const reference = chainId.split(":")[1];
  const metadata = SolanaMetadata[reference];
  if (typeof metadata === "undefined") {
    throw new Error(`No chain metadata found for chainId: ${chainId}`);
  }
  return metadata;
}

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains: [mainnet, ethereumDev, polygon2, polygonMumbai, celo, customChain], // required
  projectId, // required
  metadata, // required
  ssr: false,
  storage: createStorage({
    storage: cookieStorage
  }),
})

// 0. Setup chains
const chains = [solana, solanaTestnet]

export const solanaConfig = defaultSolanaConfig({
  metadata,
  chains,
  projectId
})