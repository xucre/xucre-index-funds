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
import { TokenDetails } from "@/service/types";
import DashboardBalanceItem from "./DashboardBalanceItem";
import { isAddressEqual } from "viem";
import Dashboard from '../../app/dashboard/page';
import { getTokenMetadata, setTokenMetadata } from "@/service/db";
import { globalChainId } from "@/service/constants";
import { useIndexedDB } from "@/hooks/useIndexedDB";

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
    const {getValue, putValue, isDBConnecting} = useIndexedDB();

  const balances = history.data ? history.data.items : [];

  const syncTokenDetails = async () => {
    setLoaded(false);
    const tokenDetails = await Promise.all(balances.map(async (balance) => {
      let token: TokenDetails;
      const tokenKey = `token_metadata:${globalChainId}:${balance.contract_address}`;
      const cachedTokenDetails = await getValue(`tokens`,tokenKey);
      if (cachedTokenDetails) {
        const tokenDetails = cachedTokenDetails.token as TokenDetails;
        return tokenDetails;
      }
      const token1 = await getTokenMetadata(globalChainId, balance.contract_address);
      if (token1) {
        token = token1 as TokenDetails;
      } else {
        token = await getTokenInfo(globalChainId, balance.contract_address);
        await setTokenMetadata(globalChainId, balance.contract_address, token as TokenDetails);
      }
      if (isAddressEqual(balance.contract_address, '0x924442A46EAC25646b520Da8D78218Ae8FF437C2')) {
        token = { ...token, logo: BASEURL + 'xucre.png' };
      }
      if (!token.logo && isAddressEqual(balance.contract_address, "0x0000000000000000000000000000000000001010")) {
        token = { ...token, logo: BASEURL + coinIconNames[globalChainId] + '.png', defaultLogo: false };
      }
      if (!token.logo) {
        token = { ...token, logo: BASEURL + coinIconNames[globalChainId] + '.png', defaultLogo: true };
      }
      await putValue(`tokens`, {id: tokenKey, token: token});
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
          {tokenMap ? balances.filter((val) => {
            const metadata = tokenMap[val.contract_address];
            if (metadata && !metadata.defaultLogo) {
              return true;
            }
            return false;
          }).map((balance, index) => {
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