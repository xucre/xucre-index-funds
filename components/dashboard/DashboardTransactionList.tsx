'use client'
import { useLanguage } from "@/hooks/useLanguage";
import React, { useEffect, useState } from 'react';
import { Alert, Box, CardContent, CardHeader, Chip, Divider, Link, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import AccountButton from '@/components/accountButton';
import languageData from '@/metadata/translations'
import { getDashboardBorderColor } from "@/service/helpers";
import { CovalentTransactionV3, useWalletData } from "@/hooks/useWalletData";
import truncateEthAddress from "truncate-eth-address";
import dayjs from 'dayjs'
import DashboardTransaction from "./DashboardTransaction";
import OpaqueCard from "../ui/OpaqueCard";
import { getTextColor } from "@/service/theme";
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)
dayjs.extend(isoWeek);


type TransactionGroup = {
  weekStart: string;
  transactions: CovalentTransactionV3[];
};

const groupTransactionsByWeek = (transactions: CovalentTransactionV3[]): TransactionGroup[] => {
  const groupedTransactions: { [key: string]: CovalentTransactionV3[] } = {};

  transactions.forEach((transaction) => {
    const weekStart = dayjs(transaction.block_signed_at).startOf('isoWeek').format('YYYY-MM-DD');
    if (!groupedTransactions[weekStart]) {
      groupedTransactions[weekStart] = [];
    }
    groupedTransactions[weekStart].push(transaction);
  });
  return Object.keys(groupedTransactions).map((weekStart) => ({
    weekStart,
    transactions: groupedTransactions[weekStart],
  } as TransactionGroup));
};



export default function DashboardTransactionList({ address, truncate = true, transactions = [] }: { address: string, truncate?: boolean, transactions?: CovalentTransactionV3[] }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const borderColor = getDashboardBorderColor(theme);
  const textColor = getTextColor(theme);
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const _address = '0x358eB621894B55805CE16225b2504523d421d3A6';
  const _transactions = transactions && truncate ? transactions.length > 5 ? transactions.slice(0, 5) : transactions : transactions;
  const [groupedTransactions, setGroupedTransactions] = useState<TransactionGroup[]>([]);
  
  useEffect(() => {
    if (_transactions.length > 0) {
      setGroupedTransactions(groupTransactionsByWeek(_transactions));
    }
  }, [transactions])
  
  return (
    <OpaqueCard>
      <CardHeader sx={{ pb: 1, mb: 0, pt: 0 }} title={<Typography fontSize={18} fontWeight={'normal'} color="text.secondary">{languageData[language].Dashboard.transactions}</Typography>} />
      <CardContent sx={{ py: 0 }} >
        <Stack direction={'column'} spacing={1} justifyContent={'center'} alignItems={'flex-start'}>
          {groupedTransactions.map((tx, index) => {
            return (
              <Box key={index} width={'100%'}>
                <Typography fontSize={14} fontWeight={'normal'} color="text.secondary" >{dayjs(tx.weekStart).fromNow()}</Typography>
                {tx.transactions.map((transaction, index2) => {
                  return (
                    <DashboardTransaction key={index2} transaction={transaction} address={address} />
                  )
                })}
              </Box>

            )
          })}
          {groupedTransactions.length === 0 && <Typography fontSize={14} fontWeight={'normal'} color="text.secondary" >{languageData[language].Dashboard.no_transactions}</Typography>}
        </Stack>
      </CardContent>
    </OpaqueCard>
  );
};