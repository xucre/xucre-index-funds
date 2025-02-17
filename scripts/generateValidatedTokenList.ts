import { transferSignerOwnership } from "@/service/safe";
import { getOrganizationMembers, getAllOrganizations } from "@/service/clerk";
import { getSafeAddress, getOrganizationSafeAddress, setInvoiceDetails } from "@/service/db";
import { Invoice, InvoiceStatuses, Pool, Token, Token2 } from "@/service/types";
import { polygonCoins } from '@/data';
import { uid } from "uid-promise";
import dayjs from "dayjs";
import { queryPools } from "@/service/uniswap";
import fs from 'fs/promises';

const sourceTokens: Token[] = [
    {
      id: 'polygon-bridged-usdt-polygon',
      name: "USDT",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      description: "Tether USD (USDT) is a stablecoin pegged to the US Dollar.",
      decimals: 6,
      logo: "https://xucre-public.s3.sa-east-1.amazonaws.com/tether.png",
      chainId: 137,
      symbol: "USDT"
    },
    {
      id: 'usd-coin',
      name: "USDC",
      address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
      description: "USD Coin (USDC) is a stablecoin backed by US dollars.",
      decimals: 6,
      logo: "https://xucre-public.s3.sa-east-1.amazonaws.com/usdc.png",
      chainId: 137,
      symbol: "USDC"
    }
];
const coins = polygonCoins.reduce((acc, coin) => {
    acc[coin.id ? coin.id : 'unknown'] = {...coin};
    return acc;
  }, {} as {[key: string]: Token});

const coinsByAddress = polygonCoins.reduce((acc, coin) => {
    acc[coin.address] = {...coin};
    return acc;
}, {} as {[key: string]: Token});


const fetchPools = async (source: Token, token: Token) => {
      const sourceMetadata = coins[source.id as string];
      const tokenMetadata = coins[token.id as string] || coinsByAddress[token.address];

      const poolParams = {
        sourceToken: {...sourceMetadata, chainId: 137, symbol: sourceMetadata?.name} as Token2,
        targetToken: {...tokenMetadata, chainId: 137, symbol: tokenMetadata?.name} as Token2,
        chainId: 137 as 1 | 137 | 8453 | 43114 | 42161 | 56 | 10,
      };
      //console.log('poolParams', poolParams);
      const poolData = await queryPools(poolParams);
      if (poolData) {
        console.log('poolData', poolData.targetToken.address,poolData.liquidity);
        const _liquidity = BigInt(poolData.liquidity);
        if (_liquidity === BigInt(0)) {
          return null;
        } else {
            return {
                sourceToken: sourceMetadata,
                targetToken: tokenMetadata,
                poolData: poolData,
                chainId: 137 
            }
        }
      }
      return null;
};

const main = async () => {
  let results: Pool[] = [];
  const tasks: { source: Token, coin: Token }[] = [];

  // Prepare all combinations of sourceTokens and polygonCoins
  for (const source of sourceTokens) {
    for (const coin of polygonCoins) {
      tasks.push({ source, coin });
    }
  }

  let index = 0;
  console.log(`Starting pool queries for ${tasks.length} token pairs...`);

  const intervalId = setInterval(() => {
    (async () => {
      if (index >= tasks.length) {
        clearInterval(intervalId);
        // All tasks processed, write results file
        await fs.writeFile('data/validatedPolygonPools.json', JSON.stringify(results, null, 2));
        console.log(`Validated token list saved with ${results.length} pool(s).`);
        return;
      }

      const chunk = tasks.slice(index, index + 5);
      console.log(`Processing batch ${index / 5 + 1}: ${chunk.length} queries...`);
      const chunkResults = await Promise.all(chunk.map(async ({ source, coin }) => {
        try {
          const pool = await fetchPools(source, coin);
          return pool;
        } catch (error) {
          console.error(`Error fetching pool for ${source.id} and ${coin.id}:`, error);
          return null;
        }
      }));

      for (const res of chunkResults) {
        if (res !== null) {
          results.push(res);
        }
      }

      index += 5;
    })();
  }, 5000);
};

main();

// Execute - node scripts/generateValidatedTokenList.ts --env-file .env.local

