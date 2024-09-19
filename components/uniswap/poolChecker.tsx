import React, { useEffect, useState } from 'react';
import { TextField, Button, Typography, CircularProgress, Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Tick, computePoolAddress, Pool, TickMath } from '@uniswap/v3-sdk'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
//import { POOL_FACTORY_CONTRACT_ADDRESS } from './constants'
import { WETH9, Token as UniswapToken } from '@uniswap/sdk-core';
import truncateEthAddress from 'truncate-eth-address'
import { FeeAmount } from '@uniswap/v3-sdk';
import { readContract } from 'wagmi/actions';

import TokenAutocomplete from './autocomplete';
import { Token } from '@/hooks/useTokenList';
import { useAccount, useClient, usePublicClient, useWalletClient } from 'wagmi';
import { config } from '@/config';
import { formatUnits, getAddress, parseUnits } from 'viem';
import { normalizeDevChains } from '@/service/helpers';

export interface PoolData {
  id: string;
  sourceToken: Token;
  targetToken: Token;
  feeTier: number;
  liquidity: string;
}

const poolContractMap = {
  1: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  137: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
}

const feeTiers = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];
const UniswapPoolChecker = ({ registerPortfolioItem }: { registerPortfolioItem: (pool: PoolData) => void }) => {
  const [sourceToken, setSourceToken] = useState(null as Token | null);
  const [targetToken, setTargetToken] = useState(null as Token | null);
  const [fee, setFee] = useState(0);
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chainId } = useAccount();

  const queryPools = async () => {
    setPoolData(null);
    setLoading(true);
    try {
      const poolAddress = computePoolAddress({
        factoryAddress: poolContractMap[normalizeDevChains(chainId)],
        tokenA: new UniswapToken(chainId, sourceToken.address, sourceToken.decimals, sourceToken.name),
        tokenB: new UniswapToken(chainId, targetToken.address, targetToken.decimals, targetToken.name),
        fee: fee,
      })

      const liquidity = await readContract(config, {
        abi: IUniswapV3PoolABI.abi,
        address: getAddress(poolAddress),
        functionName: 'liquidity',
      });
      const data = {
        id: poolAddress,
        sourceToken: sourceToken,
        targetToken: targetToken,
        feeTier: fee,
        liquidity: BigInt(liquidity as bigint).toString()
      } as PoolData;
      setPoolData(data);

      setError(null);
      setLoading(false);
    } catch (err) {
      //console.log(err);
      setError('No liquidity found for this token pair.');
      setPoolData(null);
      setLoading(false);
    }

  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sourceToken && targetToken && fee !== 0) {
      queryPools();
    }
  };

  const addToPortfolio = () => {
    registerPortfolioItem(poolData);
  }

  useEffect(() => { setLoading(false) }, []);

  useEffect(() => {
    if (sourceToken && targetToken) {
      //queryPools();
    }

  }, [sourceToken, targetToken]);

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Typography variant="h5" align="center" gutterBottom>Index Builder</Typography>
      <form onSubmit={handleSubmit}>
        <TokenAutocomplete onSelect={(token) => setSourceToken(token)} />
        <TokenAutocomplete onSelect={(token) => setTargetToken(token)} />
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>Select Fee Tier</InputLabel>
          <Select
            label="Select Fee Tier"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
          >
            {feeTiers.map((feeAmount) => (
              <MenuItem key={feeAmount} value={feeAmount}>
                {feeAmount / 10000}%
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          disabled={loading || !sourceToken || !targetToken || fee === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Check Pool'}
        </Button>
      </form>

      {error && (
        <Typography color="error" align="center" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}
      {poolData && (
        <Box sx={{ marginTop: 2 }}>
          <Button fullWidth variant='outlined' onClick={addToPortfolio}>Add to Portfolio</Button>
          <Typography align="center">
            <strong>Pool found!</strong>
          </Typography>
          <Typography align="center">
            Pool Pair: {`${sourceToken.symbol || sourceToken.name} / ${targetToken.symbol || targetToken.name}`}
          </Typography>
          <Typography align="center">
            Pool ID: {truncateEthAddress(poolData.id)}
          </Typography>
          <Typography align="center">
            Pool Fee Tier: {(poolData.feeTier / 10000).toFixed(2)}%
          </Typography>
          <Typography align="center">
            Pool Liquidity: {poolData.liquidity}
          </Typography>

        </Box>
      )}
      {poolData === null && !loading && (
        <Typography align="center" sx={{ marginTop: 2 }}>
          No pool found for this token pair.
        </Typography>
      )}
    </Box>
  );
};

export default UniswapPoolChecker;
