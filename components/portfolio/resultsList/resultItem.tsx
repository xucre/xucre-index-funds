'use client'
import React, { useEffect } from 'react';
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Token, Token2 } from '@/service/types';
import { queryPools } from '@/service/uniswap/index';
import { formatGwei } from 'viem'
import { Delete } from '@mui/icons-material';
import './resultItem.css';

const ResultItem = ({token, sourceToken, metadataMap, metadataByAddress, setFee}: {token: Token, sourceToken: Token, metadataMap: {[key: string]: Token}, metadataByAddress: {[key:string]:Token}, setFee: (address: string, fee: number) => void}) => {
  const [poolFee, setPoolFee] = React.useState(0);
  const [poolLiquidity, setPoolLiquidity] = React.useState(BigInt(0));
  const [hasPool, setHasPool] = React.useState(false);

  const setHasNoPool = () => {
    setHasPool(false);
    setPoolFee(0);
    setPoolLiquidity(BigInt(0));
  };

  const deletePool = () => {
    setHasNoPool();
    setFee(token.address, 0);
  };

  const sourceMetadata = metadataMap[sourceToken.id as string];
  const tokenMetadata = metadataMap[token.id as string] || metadataByAddress[token.address];

  useEffect(() => {
    const fetchPools = async () => {
      const poolParams = {
        sourceToken: { ...sourceMetadata, chainId: 137, symbol: sourceMetadata?.name } as Token2,
        targetToken: { ...tokenMetadata, chainId: 137, symbol: tokenMetadata?.name } as Token2,
        chainId: 137 as 1 | 137 | 8453 | 43114 | 42161 | 56 | 10,
      };
      const poolData = await queryPools(poolParams);
      if (poolData) {
        const _liquidity = BigInt(poolData.liquidity);
        if (_liquidity === BigInt(0)) {
          setHasNoPool();
        } else {
          setPoolFee(poolData.feeTier);
          setPoolLiquidity(_liquidity);
          setHasPool(true);
          setFee(token.address, poolData.feeTier);
        }
      } else {
        setHasNoPool();
      }
    };
    if (sourceToken && token && !hasPool) fetchPools();
  }, [token, sourceToken, sourceMetadata, tokenMetadata, setFee, hasPool]);

  if (!hasPool) return null;

  return (
    <Tooltip title={`${token.description || tokenMetadata.description} | Pool Fee: ${poolFee/1000}% | Liquidity: ${formatGwei(poolLiquidity)}`} placement="top">
      <Box display="flex" justifyContent="center" alignItems="center" width={'100%'} >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" width={'100%'}>
          <Avatar src={token.logo || tokenMetadata.logo} sx={{ width: 24, height: 24 }} />
          <Typography color='text.primary'>{token.name || tokenMetadata.name}</Typography>
          <IconButton onClick={deletePool}><Delete /></IconButton>
        </Stack>
      </Box>
    </Tooltip>
  );
};

export default React.memo(ResultItem, (prevProps, nextProps) => {
  return (
    prevProps.token.id === nextProps.token.id &&
    prevProps.sourceToken.id === nextProps.sourceToken.id 
  );
});

