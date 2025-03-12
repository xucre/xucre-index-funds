'use client'
import { useLanguage } from "@/hooks/useLanguage";
import React from 'react';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import { getDashboardBorderColor } from "@/service/helpers";
import { useWalletData } from "@/hooks/useWalletData";
import truncateEthAddress from "truncate-eth-address";
import BalanceBlock from "./DashboardBalanceBlock";
import DashboardTransactionList from "./DashboardTransactionList";
import OpaqueCard from "../ui/OpaqueCard";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";

export default function OrganizationDashboardContainer({ address }: { address: string }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const borderColor = getDashboardBorderColor(theme);
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const { organization } = useClerkOrganization();
  const { transactions, history, balance, change, loaded, hasHistory } = useWalletData({ address });

  return (
    <Stack direction={'column'} spacing={2}>
      {/* <OpaqueCard> */}
        {/* <Typography variant="body2">
          {organization?.name} - {truncateEthAddress(address)}
        </Typography>
        <Divider sx={{ my: 2 }} /> */}
        
        {hasHistory && <BalanceBlock balance={balance} change={change} address={address} loaded={loaded} />}
        {!hasHistory && <BalanceBlock balance={0} change={0} address={address} loaded={loaded} />}
      {/* </OpaqueCard> */}

      {/* <OpaqueCard> */}
        {/* <Typography variant="h6">Organization Transactions</Typography>
        <Divider sx={{ my: 2 }} /> */}
        
        {<DashboardTransactionList address={address} transactions={transactions} />}
      {/* </OpaqueCard> */}
    </Stack>
  );
}