'use client'
import React, { useEffect } from 'react';
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Token, Token2, ValidatedPool } from '@/service/types';
import { queryPools } from '@/service/uniswap/index';
import { formatGwei } from 'viem'
import { Delete } from '@mui/icons-material';
import './resultItem.css';

const ResultItem2 = ({poolData, deletePool, poolIndex}: {poolData: ValidatedPool, poolIndex:number, deletePool: (key) => void}) => {
  const sourceToken = poolData.sourceToken;
  const token = poolData.targetToken;
  const pool = poolData.poolData;

  const deletePoolData = () => {
    deletePool(poolData.targetToken.address);
  }

  useEffect(() => {
    if (pool && BigInt(pool.liquidity) < BigInt(10000000000)) {
      console.log('deleting pool automatically', pool.targetToken.name, BigInt(pool.liquidity) < BigInt(10))
      deletePoolData();
    } else if (poolIndex > 25) {
      console.log('deleting pool automatically index', pool.targetToken.name, poolIndex > 25)
      deletePoolData();
    }
  }, [pool])

  return (
    <Tooltip title={`${token.description} | Pool Fee: ${pool.feeTier/1000}% | Liquidity: ${formatGwei(BigInt(pool.liquidity))}`} placement="top">
      <Box display="flex" justifyContent="center" alignItems="center" width={'100%'} >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" width={'100%'}>
          <Avatar src={token.logo} sx={{ width: 24, height: 24 }} />
          <Typography color='text.primary'>{token.name}</Typography>
          <IconButton onClick={deletePoolData}><Delete /></IconButton>
        </Stack>
      </Box>
    </Tooltip>
  );
};

export default React.memo(ResultItem2, (prevProps, nextProps) => {
  return (
    prevProps.poolData.sourceToken.id === nextProps.poolData.sourceToken.id &&
    prevProps.poolData.targetToken.id === nextProps.poolData.targetToken.id 
  );
});

