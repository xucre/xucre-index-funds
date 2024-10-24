'use client'
import React, { useEffect, useState } from 'react';
import { Button, Typography, CircularProgress, Box, FormControl, InputLabel, MenuItem, Select, Stack, Fab, Menu, IconButton } from '@mui/material';
import { computePoolAddress } from '@uniswap/v3-sdk'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { Token as UniswapToken } from '@uniswap/sdk-core';
import truncateEthAddress from 'truncate-eth-address'
import { FeeAmount } from '@uniswap/v3-sdk';
import { readContract } from 'wagmi/actions';

import BlockIcon from '@mui/icons-material/Block';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TokenAutocomplete from './autocomplete';
import { Token } from '@/hooks/useTokenList';
import { useAccount } from 'wagmi';
import { config } from '@/config';
import { getAddress, zeroAddress } from 'viem';
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
  137: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  8453: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  43114 : '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
  42161: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  56: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
  10: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
}

const nativeTokens = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  137: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  8453: '0x4200000000000000000000000000000000000006',
  43114 : '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  10: '0x4200000000000000000000000000000000000006'
}

const feeTiers = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];
const UniswapPoolChecker = ({ registerPortfolioItem }: { registerPortfolioItem: (pool: PoolData) => void }) => {
  const [sourceToken, setSourceToken] = useState(null as Token | null);
  const [targetToken, setTargetToken] = useState(null as Token | null);
  const [fee, setFee] = useState(0);
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { chainId } = useAccount();

  const queryPools = async () => {
    setPoolData(null);
    setLoading(true);
    try {
      const souceAddress = sourceToken.address === zeroAddress ? nativeTokens[chainId] : sourceToken.address;
      const targetAddress = targetToken.address === zeroAddress ? nativeTokens[chainId] : targetToken.address;

      const poolAddress = computePoolAddress({
        factoryAddress: poolContractMap[normalizeDevChains(chainId)],
        tokenA: new UniswapToken(chainId, souceAddress, sourceToken.decimals, sourceToken.name),
        tokenB: new UniswapToken(chainId, targetAddress, targetToken.decimals, targetToken.name),
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
      console.log(err);
      setError('No liquidity found for this token pair.');
      setPoolData(null);
      setLoading(false);
    }

  };

  /*const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submit', sourceToken, targetToken, fee);
    if (sourceToken && targetToken && fee !== 0) {
      queryPools();
    }
  };*/

  const addToPortfolio = () => {
    registerPortfolioItem(poolData);
  }

  const handleFabClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (feeAmount: number) => {
    setFee(feeAmount);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => { setLoading(false) }, []);

  const invalidPortfolioItem = loading || !sourceToken || !targetToken || fee === 0;

  useEffect(() => {
    if (!invalidPortfolioItem) {
      queryPools();
    }
  },[sourceToken, targetToken, fee]);
  return (
    <Box sx={{ paddingX: 2 }}>
      <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
        <TokenAutocomplete onSelect={(token) => setSourceToken(token)} />
        <Typography variant='h6'>/</Typography>
        <TokenAutocomplete onSelect={(token) => setTargetToken(token)} />
        <div>
          <Fab color={'default'} size="small" onClick={handleFabClick}>
            {fee ? `${fee / 10000}%` : <PercentIcon />}
          </Fab>
          <Menu
            id="fee-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {feeTiers.map((feeAmount) => (
              <MenuItem
                key={feeAmount}
                selected={feeAmount === fee}
                onClick={() => handleMenuItemClick(feeAmount)}
              >
                {feeAmount / 10000}%
              </MenuItem>
            ))}
          </Menu>
        </div>
        {error && <RemoveCircleIcon color='error' /> }
        {poolData && <CheckCircleIcon color='success' /> }
        {!error && !loading && !poolData && <BlockIcon color='disabled' /> }
        {loading && <CircularProgress /> }
        {poolData && <IconButton onClick={addToPortfolio} disabled={invalidPortfolioItem}> <AddCircleIcon /> </IconButton>}
      </Stack>        

      {/* {poolData && (
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
      )} */}
    </Box>
  );
};

export default UniswapPoolChecker;
