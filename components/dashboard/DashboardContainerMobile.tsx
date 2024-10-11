'use client'
import { useLanguage } from "@/hooks/useLanguage";
import React, { useEffect } from 'react';
import { Box, Divider, Link, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
//import AccountButton from "./accountButton";
import AccountButton from '@/components/accountButton';
import DashboardNews from "./DashboardNews";
import { getDashboardBorderColor } from "@/service/helpers";
//import { TokenBalancesList, useGoldRush } from "@covalenthq/goldrush-kit";
import { useWalletData } from "@/hooks/useWalletData";
import truncateEthAddress from "truncate-eth-address";
import dayjs from 'dayjs'

//import '../../public/tailwind-output.css'
// components/LoadingIndicator.tsx

const WalletBlock = ({ address }: { address: string }) => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  return (
    <Stack direction={'column'} sx={{ border: 'solid 1px', borderColor: borderColor }} spacing={2} p={2} maxWidth={'25%'}>
      <Typography variant={'h6'} textAlign={'center'}>Your Wallet</Typography>
      <a href={`https://app.safe.global/home?safe=matic:${address}`} color="inherit" target={'_blank'} >
        <Stack direction={'row'} alignItems={'center'} width={'100%'} display={'flex'} justifyContent={'center'} spacing={2}>
          <Box bgcolor={'#12ff80'} display={'flex'} borderRadius={4} justifyContent={'center'} alignItems={'center'}>
            <img src='/safe-logo.png' width={50} height={50} />
          </Box>
          {/*<AccountButton showBalance={false} />*/}

          <Box bgcolor={theme.palette.mode === 'dark' ? 'gray' : 'lightgray'} borderRadius={4} py={1} px={2}><Typography variant={'body1'}>{truncateEthAddress(address)}</Typography></Box>
        </Stack>
      </a>
      <Divider sx={{ borderColor: borderColor, borderWidth: 1.5 }} />
      <DashboardNews />
    </Stack>
  )
}

export default function DashboardContainerDesktop({ address }: { address: string }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const borderColor = getDashboardBorderColor(theme);
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  //const { updateThemeHandler } = useGoldRush();
  const _address = '0x358eB621894B55805CE16225b2504523d421d3A6';
  const { transactions, history, balance } = useWalletData({ address: _address });
  useEffect(() => {
    if (transactions.length > 0) {
      console.log(transactions);
    }
  }, [transactions])

  useEffect(() => {
    if (history) {
      console.log(history);
    }
  }, [history])
  const _transactions = transactions.length > 5 ? transactions.slice(0, 5) : transactions;
  return (
    <Stack direction={'row'} spacing={8} justifyContent={'space-between'} px={5}>
      <Stack direction={'column'} spacing={2} flexGrow={2}>
        <Box sx={{ border: 'solid 1px', borderColor: borderColor }} p={4}>
          <Typography variant={'h3'} textAlign={'center'}>Balance: ${balance.toFixed(2)} <span style={{ color: '#00B21F' }}>+24%</span></Typography>
        </Box>

        <Box sx={{ border: 'solid 1px', borderColor: borderColor }} p={2}>
          <Typography variant={'h6'} fontWeight={'bold'}>History</Typography>
          <Stack direction={'column'} spacing={2} justifyContent={'center'} alignItems={'center'}>
            {_transactions.map((tx, index) => {
              return (
                <Stack direction={'column'} key={index} spacing={1} width={'100%'} textAlign={'center'}>
                  <Typography>A tx was made on {dayjs(tx.block_signed_at).format('MM/DD/YYYY')}</Typography>
                  <Divider sx={{ borderColor: borderColor, borderWidth: 1.5, width: '30%', ml: 'auto !important', mr: 'auto !important', display: 'block' }} />
                </Stack>
              )
            })}
          </Stack>
        </Box>
        {/*
        
        import { GoldRushProvider } from '@covalenthq/goldrush-kit'
        import '@covalenthq/goldrush-kit/styles.css'
        <TokenBalancesList
          chain_names={[
            "matic-mainnet",
            "eth-sepolia",
          ]}
          hide_small_balances
          address={address}
        />*/}
      </Stack>
      <WalletBlock address={_address} />
    </Stack>
  );
};
