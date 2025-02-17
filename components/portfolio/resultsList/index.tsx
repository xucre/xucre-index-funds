'use client'
import React, { useState, useEffect } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Avatar, ButtonBase, Divider, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { SourceList, Token } from '@/service/types';
import ResultItem from './resultItem';
import { Refresh } from '@mui/icons-material';
import { BuyButton} from '@/components/portfolio/buyButton';
import { parseUnits } from 'viem';
import { polygonCoins } from '@/data';

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

const ResultsList = ({source, refresh}: {source: SourceList | null, refresh: () => void}) => {
  const [sourceToken, setSourceToken] = useState<Token>();
  const [amount, setAmount] = useState<number>(0);
  const [feeList, setFeeList] = useState<{[key: string]: number}>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleTokens, setVisibleTokens] = useState<Token[]>([]);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFeeChange = (address: string, fee: number) => {
    setFeeList(prev => ({ ...prev, [address]: fee }));
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setAmount(Number(event.target.value));
    } catch (error) {
      console.error("Invalid input: ", error);
    }
  };

  const coins = polygonCoins.reduce((acc, coin) => {
    acc[coin.id ? coin.id : 'unknown'] = {...coin};
    return acc;
  }, {} as {[key: string]: Token});

  const coinsByAddress = polygonCoins.reduce((acc, coin) => {
    acc[coin.address] = {...coin};
    return acc;
  }, {} as {[key: string]: Token});

  useEffect(() => {
    console.log('source opened');
    setVisibleTokens([])
    if (source && source.tokens) {
      //setVisibleTokens(source.tokens.slice(0, 5));
      let count = 0;
      const _tokens = [...source.tokens] as Token[];
      const intervalId = setInterval(() => {
        console.log('visible length', visibleTokens.length);  
        if (visibleTokens.length !== _tokens.length) {
          const _count = _tokens.length > count + 5 ? count + 5 : _tokens.length; 
          const sliceList = _tokens.slice(count, _count);
          //console.log(sliceList)
          setVisibleTokens((prev) => [...prev, ...sliceList]);
          count = _count;
        } else {
          console.log(visibleTokens)
          clearInterval(intervalId);
        }
      }, 5000);
      return () => clearInterval(intervalId);
    } else {
      //setVisibleTokens([]);
    }
  }, []);

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
        <IconButton aria-label="refreh" onClick={refresh}>
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
        {source && sourceToken && visibleTokens.map((token, index) => {
          return (
            <ResultItem key={token.address} token={token} metadataMap={coins} metadataByAddress={coinsByAddress} sourceToken={sourceToken} setFee={handleFeeChange} />
          )
        })}
      </Stack>
      <Stack direction="column" spacing={2} justifyContent="center" alignItems="center">
        {sourceToken && Object.keys(feeList).length > 0 && source && 
          <TextField id="amount" fullWidth label="Amount"type={'number'} value={amount} onChange={handleAmountChange} />
        }
        {sourceToken && Object.keys(feeList).length > 0 && source && 
          <BuyButton sourceToken={sourceToken}  tokenList={source.tokens} amount={parseUnits(amount.toString(), sourceToken.decimals)} fees={feeList} />
        }
      </Stack>
    </Stack>
  )
};

export default ResultsList;



