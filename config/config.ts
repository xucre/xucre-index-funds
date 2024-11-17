import { defaultWagmiConfig } from "@web3modal/wagmi/react";
// import { SolanaMetadata } from '@/service/chains/solana';
import { defineChain } from 'viem';

import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, polygonMumbai, base, celo } from 'wagmi/chains'
// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Xucre Crypto Index Fund',
  description: 'dApp enabling users to invest in a diversified portfolio of cryptocurrencies',
  url: 'https://fund.xucre.net', // origin must match your domain & subdomain
  icons: ['https://swap.xucre.net/icon-green.png']
}
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

export function getConfig() {
  return defaultWagmiConfig({
    chains: [mainnet, polygonMumbai, celo, base, polygon2], // required
    projectId, // required
    metadata, // required
    ssr: true,
    storage: createStorage({
      storage: cookieStorage
    }),
  })
}