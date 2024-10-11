'use client'
import { useLanguage } from "@/hooks/useLanguage";
import React, { useEffect } from 'react';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
//import AccountButton from "./accountButton";
import AccountButton from '@/components/accountButton';
import DashboardNews from "./DashboardNews";
import { getDashboardBorderColor } from "@/service/helpers";
import { TokenBalancesList, useGoldRush } from "@covalenthq/goldrush-kit";
import { useWalletData } from "@/hooks/useWalletData";

//import '../../public/tailwind-output.css'
// components/LoadingIndicator.tsx

const WalletBlock = () => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  return (
    <Stack direction={'column'} sx={{ border: 'solid 1px', borderColor: borderColor }} spacing={2} p={2} maxWidth={'25%'}>
      <Typography variant={'h6'} textAlign={'center'}>Your Wallet</Typography>
      <Box alignItems={'center'} width={'100%'} display={'flex'} justifyContent={'center'}>
        <Box bgcolor={'#12ff80'} display={'flex'} borderRadius={4} justifyContent={'center'} alignItems={'center'}>
          <img src='/safe-logo.png' width={50} height={50} />
        </Box>
        <AccountButton showBalance={false} />
      </Box>
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
  const { updateThemeHandler } = useGoldRush();

  const { transactions } = useWalletData({ address: '0x358eB621894B55805CE16225b2504523d421d3A6' });
  useEffect(() => {
    if (transactions.length > 0) {
      console.log(transactions);
    }
  }, [transactions])

  return (
    <Stack direction={'row'} spacing={8} justifyContent={'space-between'} px={5}>
      <Stack direction={'column'} spacing={2} flexGrow={2}>
        {/*<Box sx={{ border: 'solid 1px', borderColor: borderColor }} p={4}>
          <Typography variant={'h3'} textAlign={'center'}>Balance: $2402.00 <span style={{ color: '#00B21F' }}>+24%</span></Typography>
        </Box>

        <Box sx={{ border: 'solid 1px', borderColor: borderColor }} p={2}>
          <Typography variant={'h6'} fontWeight={'bold'}>History</Typography>
          <Stack direction={'column'} spacing={2} justifyContent={'center'} alignItems={'center'}>
            <Typography>A contribution of $1000.00 was made on 2021-10-01</Typography>
            <Divider sx={{ borderColor: borderColor, borderWidth: 1.5, width: '30%' }} />
            <Typography>A contribution of $1000.00 was made on 2021-10-01</Typography>
            <Divider sx={{ borderColor: borderColor, borderWidth: 1.5, width: '30%' }} />
          </Stack>
        </Box>*/}
        {<TokenBalancesList
          chain_names={[
            "matic-mainnet",
            "eth-sepolia",
          ]}
          hide_small_balances
          address={address}
        />}
      </Stack>
      <WalletBlock />
    </Stack>
  );
};
