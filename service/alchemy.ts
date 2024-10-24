'use server';
import { Token } from '@/hooks/useTokenList';
import { Alchemy, Network } from 'alchemy-sdk';
import { getAddress, isAddress } from 'viem';

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