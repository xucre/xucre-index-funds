import JSBI from 'jsbi'
import { computePoolAddress, Pool, TICK_SPACINGS } from '@uniswap/v3-sdk'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { Token as UniswapToken, TradeType, Percent, CurrencyAmount, Token, Currency } from '@uniswap/sdk-core';
import { FeeAmount } from '@uniswap/v3-sdk';
//import { readContract } from 'wagmi/actions';
import { PoolData, Token2 } from '@/service/types';
import { getAddress, createPublicClient, http } from "viem";
import { config } from '@/config';
import { polygon } from 'viem/chains'
import { MixedRouteTrade, MixedRouteSDK, Trade as RouterTrade, RouteV3 } from '@uniswap/router-sdk'
import { SwapRouter } from '@uniswap/universal-router-sdk'
import {FORK_BLOCK, UNIVERSAL_ROUTER_ADDRESS, UniversalRouterVersion} from './constants'
import {
    Trade as V3Trade,
    Route as V3Route,
    Pool as V3Pool,
    Position,
    FeeOptions,
    encodeSqrtRatioX96,
    nearestUsableTick,
    TickMath,
    NonfungiblePositionManager,
  } from '@uniswap/v3-sdk'


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
  
      const slotData = await client.readContract({
        abi: IUniswapV3PoolABI.abi,
        address: getAddress(poolAddress),
        functionName: 'slot0',
      }) as string[];
      console.log('slotData',slotData);
      const liquidityValue = BigInt(liquidity as bigint);
      //console.log('pool', poolAddress, 'token', targetToken,'liquidityValue', liquidityValue);
      if (liquidityValue > BigInt(0)) {
        const data = {
          id: poolAddress,
          sourceToken: sourceToken,
          targetToken: targetToken,
          feeTier: fee,
          liquidity: liquidityValue.toString(),
          sqrtPriceX96: slotData[0],
          tick: slotData[1]
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

export const constructSingleTrade = async({
  sourceToken,
  targetToken,
  amount,
  slippageTolerance,
  recipient,
  chainId,
}: {
  sourceToken: Token2;
  targetToken: Token2;
  amount: BigInt;
  slippageTolerance: number;
  recipient: string;
  chainId: 1 | 137 | 8453 | 43114 | 42161 | 56 | 10;
}) => {
  try {
    const source = new UniswapToken(chainId, sourceToken.address, sourceToken.decimals, sourceToken.name);
    const target = new UniswapToken(chainId, targetToken.address, targetToken.decimals, targetToken.name);
    const poolData = await queryPools({ sourceToken, targetToken, chainId });
    if (!poolData) return;
    const fork = FORK_BLOCK;

    const pair = await getPool(source, target, poolData.feeTier, poolData.liquidity, poolData.sqrtPriceX96 as string, Number(poolData.tick))
    const trade = await V3Trade.fromRoute(
        new V3Route([pair], source, target),
        CurrencyAmount.fromRawAmount(source, amount.toString()),
        TradeType.EXACT_INPUT
      )
    // Create a RouterTrade instance with the provided routes
    const routerTrade = new RouterTrade({
      v3Routes: [{
        routev3: trade.swaps[0].route,
        inputAmount: trade.inputAmount,
        outputAmount: trade.outputAmount,
      }],
      tradeType: TradeType.EXACT_INPUT
    });

    // Configure swap options with deadline
    const options = { 
      slippageTolerance: new Percent(Math.floor(slippageTolerance * 100), 10000), // Convert decimal to percent
      recipient,
      //deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
    };
    
    // Generate the calldata and value for the Universal Router
    const { calldata, value } = SwapRouter.swapCallParameters(routerTrade, options);
    
    // Return the necessary data to execute the trade
    return {
      calldata,
      value,
      to: UNIVERSAL_ROUTER_ADDRESS(UniversalRouterVersion.V2_0, chainId),
      routerTrade
    };
  } catch (error) {
    console.error("Error constructing trade:", error);
    throw new Error("Failed to construct trade with the provided parameters");
  }
}

export async function getPool(tokenA: Token, tokenB: Token, feeAmount: FeeAmount, liquidity: string, sqrtPriceX96: string, tick: number): Promise<Pool> {
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
    const poolAddress = Pool.getAddress(token0, token1, feeAmount)
    console.log('liquidity', liquidity);
    console.log('sqrtPriceX96', sqrtPriceX96);
    const _liquidity = JSBI.BigInt(liquidity.toString())
    const _sqrtPriceX96 = JSBI.BigInt(sqrtPriceX96.toString())
  
    return new Pool(token0, token1, feeAmount, _sqrtPriceX96, _liquidity, tick, [
      {
        index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: _liquidity,
        liquidityGross: _liquidity,
      },
      {
        index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: JSBI.multiply(_liquidity, JSBI.BigInt('-1')),
        liquidityGross: _liquidity,
      },
    ])
  }