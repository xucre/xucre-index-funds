import { cookieStorage, createStorage } from '@wagmi/core'
import { ChainMetadata } from '@/context/types';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, celo, base,bsc, type AppKitNetwork } from '@reown/appkit/networks'
import { defineChain, http } from 'viem';

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

//if (!projectId) throw new Error('Project ID is not defined')

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

const hardhat = defineChain({
  id: 31337,
  name: 'hardhat',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://basescan.org/',
    },
  },
  testnet: false,
})



export function getChainMetadata(chainId: string): ChainMetadata {
  const reference = chainId.split(":")[1];
  const metadata = undefined;// = SolanaMetadata[reference];
  if (typeof metadata === "undefined") {
    throw new Error(`No chain metadata found for chainId: ${chainId}`);
  }
  return metadata;
}

export const networks = [mainnet, ethereumDev, polygon2, celo, base,bsc,hardhat, customChain] as [AppKitNetwork, ...AppKitNetwork[]]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [base.id]: http(), 
    [mainnet.id]: http(),
    [polygon2.id]: http(),
    [celo.id]: http(),
    [bsc.id]: http(),
    [ethereumDev.id]: http(),
    [hardhat.id]: http(),
  },
})

export const config = wagmiAdapter.wagmiConfig
