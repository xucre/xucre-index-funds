import { computePoolAddress } from '@uniswap/v3-sdk'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { Token as UniswapToken } from '@uniswap/sdk-core';
import { FeeAmount } from '@uniswap/v3-sdk';
//import { readContract } from 'wagmi/actions';
import { PoolData, Token2 } from '@/service/types';
import { getAddress, createPublicClient, http } from "viem";
import { config } from '@/config';
import { polygon } from 'viem/chains'

const poolContractMap = {
  1: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  137: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  8453: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  43114 : '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
  42161: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  56: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
  10: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
}

const feeTiers = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];
const client = createPublicClient({
  chain: polygon,
  transport: http('https://polygon-mainnet.g.alchemy.com/v2/SzEx3foIrcjO4J7dZs0TLSbv5LjN6rBu')
});

export const queryPools = async ({
  sourceToken,
  targetToken,
  chainId,
} : {
  sourceToken: Token2;
  targetToken: Token2;
  chainId: 1 | 137 | 8453 | 43114 | 42161 | 56 | 10;
}) => {
  if (!sourceToken || !targetToken || !chainId) {
    console.log('Invalid parameters');
    return;
  }
  
  for (const fee of feeTiers) {
    try {
      const sourceAddress = sourceToken.address;
      const targetAddress = targetToken.address;

      const poolAddress = computePoolAddress({
        factoryAddress: poolContractMap[chainId],
        tokenA: new UniswapToken(chainId, sourceAddress, sourceToken.decimals, sourceToken.name),
        tokenB: new UniswapToken(chainId, targetAddress, targetToken.decimals, targetToken.name),
        fee: fee,
      });
      //console.log(poolAddress);
      const liquidity = await client.readContract({
        abi: IUniswapV3PoolABI.abi,
        address: getAddress(poolAddress),
        functionName: 'liquidity',
      });
  
      const liquidityValue = BigInt(liquidity as bigint);
      //console.log('pool', poolAddress, 'token', targetToken,'liquidityValue', liquidityValue);
      if (liquidityValue > BigInt(0)) {
        const data = {
          id: poolAddress,
          sourceToken: sourceToken,
          targetToken: targetToken,
          feeTier: fee,
          liquidity: liquidityValue.toString()
        } as PoolData;
        return data;
      }
    } catch (err) {
      if (err?.shortMessage !== 'The contract function "liquidity" returned no data ("0x").'){
        console.log(err?.shortMessage);
      }
      // Ignore error for fee tiers with no pool and try next tier
      continue;
    }
  }
  //throw new Error('No liquidity found for this token pair.');
};

