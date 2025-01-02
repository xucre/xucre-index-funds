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
  const _address = '0x358eB621894B55805CE16225b2504523d421d3A1';
  const { transactions, history, balance, change, loaded, hasHistory } = useWalletData({ address: address });
  return (
    <Stack direction={'column'} spacing={2}>
      {hasHistory && <BalanceBlock balance={balance} change={change} address={address} loaded={loaded} />}
      {!hasHistory && <BalanceBlock balance={0} change={0} address={address} loaded={loaded} />}
     

      {<DashboardTransactionList address={address} transactions={transactions} /> }
    </Stack>
  );
};

