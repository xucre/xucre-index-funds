'use server';
import { Token } from '@/hooks/useTokenList';
import { Alchemy, Network } from 'alchemy-sdk';
import { getAddress, isAddress, createPublicClient, http, Address } from 'viem';
import abi from '@openzeppelin/contracts/build/contracts/ERC20.json';
import { isDev } from './constants';

// Map chainId to Alchemy Network
const getAlchemyNetwork = (chainId: number): Network => {
  switch (chainId) {
    case 1:
      return Network.ETH_MAINNET;
    case 56:
      return Network.BNB_MAINNET;
    case 42161:
      return Network.ARB_MAINNET;
    case 8453:
      return Network.BASE_MAINNET;
    case 43114:
      return Network.AVAX_MAINNET;
    case 137:
      return Network.MATIC_MAINNET;
    case 10:
      return Network.OPT_MAINNET;
    // Add other chain IDs as needed
    default:
      return Network.ETH_MAINNET;
  }
};

export const getTokenMetadata = async (address: string, chainId: number) => {
  const tokenAddress = getAddress(address);
  const alchemyNetwork = getAlchemyNetwork(chainId);
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;

  if (!alchemyApiKey) {
    console.error('Alchemy API key not set');
    return;
  }

  const alchemySettings = {
    apiKey: alchemyApiKey,
    network: alchemyNetwork,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  };

  const alchemy = new Alchemy(alchemySettings);
  console.log(alchemy.config.network, tokenAddress);
  const tokenMetadata = await alchemy.core.getTokenMetadata(tokenAddress);

  if (tokenMetadata) {
    return {
      address: tokenAddress,
      chainId: chainId,
      decimals: tokenMetadata.decimals ?? 18,
      name: tokenMetadata.name ?? 'Unknown Token',
      symbol: tokenMetadata.symbol ?? 'UNKNOWN',
      logo: tokenMetadata.logo ?? '',
    } as Token;
  } 
  return null;
}

export const getUSDCBalance = async (address: string) => {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  if (isDev) return getERC20Balance(
    address,
    process.env.NEXT_PUBLIC_USDC_ADDRESS as string,
    process.env.NEXT_PUBLIC_SAFE_RPC_URL as string
  )
  if (!alchemyApiKey) {
    console.error('Alchemy API key not set');
    return;
  }

  const alchemySettings = {
    apiKey: alchemyApiKey,
    network: Network.MATIC_MAINNET,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  };
  const alchemy = new Alchemy(alchemySettings);

  const tokenAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS; // USDC address on Polygon

  const balances = await alchemy.core.getTokenBalances(address, [tokenAddress as string]);

  if (balances && balances.tokenBalances && balances.tokenBalances.length > 0) {
    const tokenBalance = balances.tokenBalances[0];
    const balance = BigInt(tokenBalance.tokenBalance as string);
    const decimals = 6; // USDC has 6 decimals
    const balanceFormatted = Number(balance) / 10 ** decimals;
    return balanceFormatted;
  }

  return 0;
};

export const getERC20Balance = async (
  walletAddress: string,
  tokenAddress: string,
  rpcUrl: string
) => {
  try {
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    });
    const balance = await publicClient.readContract({
      address: tokenAddress as Address,
      abi: abi.abi,
      functionName: 'balanceOf',
      args: [walletAddress as Address],
    });
    const decimals = 6; // USDC has 6 decimals
    const balanceFormatted = Number(balance) / 10 ** decimals;
    return balanceFormatted;
  } catch (err) {
    // console.error(err);
    return 0;
  }
  
};


