'use client'
import React, { useState, useEffect } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Avatar, ButtonBase, Divider, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { SourceList, Token, ValidatedPool } from '@/service/types';
import ResultItem from './resultItem2';
import { Refresh } from '@mui/icons-material';
import { BuyButton} from '@/components/portfolio/buyButton';
import { parseUnits } from 'viem';

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

const ResultsList = ({source, refresh}: {source: ValidatedPool[] | null, refresh: () => void}) => {
  const [sourceToken, setSourceToken] = useState<Token>();
  const [amount, setAmount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleTokens, setVisibleTokens] = useState<ValidatedPool[]>([]);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setAmount(Number(event.target.value));
    } catch (error) {
      console.error("Invalid input: ", error);
    }
  };
  const handleDeletePool = (key: string) => {
    setVisibleTokens(visibleTokens.filter(poolData => poolData.targetToken.address !== key));
  };

  const updateVisibleTokens = () => {
    if (sourceToken && source) {
      const tokens = source.filter((poolData, index, self) =>
        index === self.findIndex(p => p.targetToken.address === poolData.targetToken.address)
      ).filter(poolData => poolData.sourceToken.address !== sourceToken.address && poolData.targetToken.address !== undefined);
      setVisibleTokens(tokens.slice(0, 50));
    } else {
      setVisibleTokens([]);
    }
  };

  useEffect(() => {
    updateVisibleTokens();
  }, [sourceToken, source]);

  const targetTokens = visibleTokens.map(poolData => poolData.targetToken);
  const feeList = visibleTokens.reduce((acc, poolData) => {
    acc[poolData.targetToken.address] = poolData.poolData.feeTier;
    return acc;
  }, {} as {[key: string]: number});

  return (
    <Stack direction={'column'} spacing={2} >
      <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'}>
        <ButtonBase aria-label="Change funding source." id="basic-button" onClick={handleClick} sx={{}}>
          <Stack direction={'row'} spacing={2} sx={{}}>
            {sourceToken && sourceToken.logo && <Avatar src={sourceToken.logo} sx={{ width: 24, height: 24 }} />}
            <Typography color='text.primary'>{sourceToken ? sourceToken.name: 'Select Source Token'}</Typography>
            <ArrowDropDownIcon />
          </Stack>
        </ButtonBase>
        <IconButton aria-label="refreh" onClick={updateVisibleTokens}>
          <Refresh />
        </IconButton>
      </Stack>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {sourceTokens.map((token) => (
          <MenuItem key={token.address} onClick={() => { setSourceToken(token); handleClose(); }}>
            <Stack direction={'row'} spacing={2}>
              <Avatar src={token.logo} sx={{ width: 24, height: 24 }} />
              <Typography color='text.primary'>{token.name || 'N/A'}</Typography>
            </Stack>

          </MenuItem>
        ))}
      </Menu>
      
      <Divider sx={{my:3}} />

      <Stack direction={'column'} spacing={2} justifyContent={'center'} alignItems={'center'}>
        {source && sourceToken && visibleTokens.map((poolData, index) => {
          return (
            <ResultItem poolIndex={index} key={poolData.targetToken.address} poolData={poolData} deletePool={handleDeletePool} />
          )
        })}
      </Stack>
      <Stack direction="column" spacing={2} justifyContent="center" alignItems="center">
        {sourceToken && Object.keys(feeList).length > 0 && source && 
          <TextField id="amount" fullWidth label="Amount"type={'number'} value={amount} onChange={handleAmountChange} />
        }
        {sourceToken && Object.keys(feeList).length > 0 && source && 
          <BuyButton sourceToken={sourceToken}  tokenList={targetTokens} amount={parseUnits(amount.toString(), sourceToken.decimals)} fees={feeList} />
        }
      </Stack>
    </Stack>
  )
};

export default ResultsList;



