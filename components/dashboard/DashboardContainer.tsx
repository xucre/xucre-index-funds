'use client'
import { useLanguage } from "@/hooks/useLanguage";
import React, { useEffect } from 'react';
import { Alert, Box, Chip, Divider, Link, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import { getDashboardBorderColor } from "@/service/helpers";
import { useWalletData } from "@/hooks/useWalletData";
import truncateEthAddress from "truncate-eth-address";
import dayjs from 'dayjs'
import DashboardTransaction from "./DashboardTransaction";
import BalanceBlock from "./DashboardBalanceBlock";
import DashboardTransactionList from "./DashboardTransactionList";

export default function DashboardContainer({ address }: { address: string }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const borderColor = getDashboardBorderColor(theme);
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const _address = '0x358eB621894B55805CE16225b2504523d421d3A6';
  const { transactions, history, balance, change } = useWalletData({ address: _address });
  return (
    <Stack direction={'column'} spacing={2}>
      <BalanceBlock balance={balance} change={change} address={_address} />

      <DashboardTransactionList address={_address} transactions={transactions} />
    </Stack>
  );
};

const WalletButton = ({ address }: { address: string }) => {
  const theme = useTheme();
  return (
    <a href={`https://app.safe.global/home?safe=matic:${address}`} color="inherit" target={'_blank'} >
      <Stack direction={'row'} alignItems={'center'} width={'100%'} display={'flex'} justifyContent={'center'} spacing={2}>
        <Box bgcolor={'#12ff80'} display={'flex'} borderRadius={4} justifyContent={'center'} alignItems={'center'}>
          <img src='/safe-logo.png' width={50} height={50} />
        </Box>

        <Box bgcolor={theme.palette.mode === 'dark' ? 'gray' : 'lightgray'} borderRadius={4} py={1} px={2}><Typography variant={'body1'}>{truncateEthAddress(address)}</Typography></Box>
      </Stack>
    </a>
  )
}