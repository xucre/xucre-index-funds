'use client'
import { useLanguage } from "@/hooks/useLanguage";
import React, { useEffect, useState } from 'react';
import { Alert, Box, CardContent, CardHeader, Chip, Divider, Link, List, Skeleton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import AccountButton from '@/components/accountButton';
import languageData from '@/metadata/translations'
import { coinIconNames, getDashboardBorderColor } from "@/service/helpers";
import { useWalletData } from "@/hooks/useWalletData";
import truncateEthAddress from "truncate-eth-address";
import dayjs from 'dayjs'
import DashboardTransaction from "./DashboardTransaction";
import OpaqueCard from "../ui/OpaqueCard";
import { getTextColor } from "@/service/theme";
import { fetchInfo, getTokenInfo } from "@/service/lambda";
import { getChainNameRainbowKit } from '../../service/helpers';
import { TokenDetails } from "@/service/types";
import DashboardBalanceItem from "./DashboardBalanceItem";
import { isAddressEqual } from "viem";
import Dashboard from '../../app/dashboard/page';

const BASEURL = 'https://xucre-public.s3.sa-east-1.amazonaws.com/';// + coinIconNames[token.chainId as keyof typeof coinIconNames].toLowerCase() + '.png'

export default function DashboardBalanceList({ address }: { address: string }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const borderColor = getDashboardBorderColor(theme);
  const textColor = getTextColor(theme);
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const _address = '0x358eB621894B55805CE16225b2504523d421d3A6';
  const { transactions, history, balance, change } = useWalletData({ address });
  const [tokenMap, setTokenMap] = useState(null as [string, TokenDetails] | null);
  const [loaded, setLoaded] = useState(false);

  const balances = history.data ? history.data.items : [];

  const syncTokenDetails = async () => {
    setLoaded(false);
    const tokenDetails = await Promise.all(balances.map(async (balance) => {
      const token = await getTokenInfo(137, balance.contract_address);
      if (isAddressEqual(balance.contract_address, '0x924442A46EAC25646b520Da8D78218Ae8FF437C2')) {
        return { ...token, logo: BASEURL + 'xucre.png' };
      }
      if (!token.logo && isAddressEqual(balance.contract_address, "0x0000000000000000000000000000000000001010")) {
        return { ...token, logo: BASEURL + coinIconNames[137] + '.png', defaultLogo: false };
      }
      if (!token.logo) {
        return { ...token, logo: BASEURL + coinIconNames[137] + '.png', defaultLogo: true };
      }
      return token;
    }));
    const _tokenMap = tokenDetails.reduce((acc, token, index) => {
      return { ...acc, [balances[index].contract_address]: token };
    }, {} as [string, TokenDetails]);
    setTokenMap(_tokenMap);
    setLoaded(true);
  }

  useEffect(() => {
    if (balances.length > 0) {
      syncTokenDetails()
    }
  }, [balances])
  return (
    <OpaqueCard>
      <CardHeader sx={{ py: 1, mb: 0 }} title={<Typography variant="body1" color="text.secondary">{languageData[language].Dashboard.balances}</Typography>} />
      <CardContent sx={{ py: 0 }} >
        <List>
          {tokenMap ? balances.map((balance, index) => {
            const metadata = tokenMap[balance.contract_address];
            return (
              <Box key={index} width={'100%'}>
                <DashboardBalanceItem key={index} details={balance} address={balance.contract_address} metadata={metadata} />
              </Box>
            )
          }) :
            <>
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            </>
          }
        </List>
      </CardContent>
    </OpaqueCard>
  );
};