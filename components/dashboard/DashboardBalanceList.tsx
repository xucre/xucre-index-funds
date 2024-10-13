'use client'
import { useLanguage } from "@/hooks/useLanguage";
import React, { useEffect } from 'react';
import { Alert, Box, CardContent, CardHeader, Chip, Divider, Link, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import AccountButton from '@/components/accountButton';
import languageData from '@/metadata/translations'
import { getDashboardBorderColor } from "@/service/helpers";
import { useWalletData } from "@/hooks/useWalletData";
import truncateEthAddress from "truncate-eth-address";
import dayjs from 'dayjs'
import DashboardTransaction from "./DashboardTransaction";
import OpaqueCard from "../ui/OpaqueCard";
import { getTextColor } from "@/service/theme";

export default function DashboardBalanceList({ address }: { address: string }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const borderColor = getDashboardBorderColor(theme);
  const textColor = getTextColor(theme);
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const _address = '0x358eB621894B55805CE16225b2504523d421d3A6';
  const { transactions, history, balance, change } = useWalletData({ address: _address });

  const balances = history.data ? history.data.items : [];

  console.log(balances);
  return (
    <OpaqueCard>
      <CardHeader sx={{ py: 1, mb: 0 }} title={<Typography variant="body1" color="text.secondary">Balances</Typography>} />
      <CardContent sx={{ py: 0 }} >

      </CardContent>
    </OpaqueCard>
  );
};