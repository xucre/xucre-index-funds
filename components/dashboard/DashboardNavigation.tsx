'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Box, Chip, IconButton, Stack, Typography, useTheme } from "@mui/material"
import SettingsIcon from '@mui/icons-material/Settings';
//import AccountButton from "./accountButton";
import languageData from '@/metadata/translations'
//import { useRouter } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import React, { } from "react";
import { getTextColor } from "@/service/helpers";
import { toTitleCase } from '../../service/helpers';
import { useUser } from "@clerk/nextjs";
// components/LoadingIndicator.tsx
export default function DashboardNavigation() {
  const theme = useTheme();
  const router = useRouter();
  const textColor = getTextColor(theme);
  const { language } = useLanguage();
  const { user } = useUser();
  const pathname = usePathname();
  const isHome = pathname === '/dashboard';
  const isBalance = pathname === '/dashboard/balances';
  const isTransactions = pathname === '/dashboard/transactions';

  const handleNavigation = (endpoint) => {
    router.push(endpoint);
  }

  return (
    <Stack direction={'row'} justifyContent={'start'} alignItems={'center'} my={4} px={0} mb={2} spacing={2}>
      <Chip label={languageData[language].Dashboard.home} onClick={() => { handleNavigation('/dashboard') }} sx={{ bgcolor: isHome ? '#00872a' : '', fontSize: isHome ? 18 : 14, fontWeight: isHome ? 'bold' : '', py: 2, px: 1 }} />
      <Chip label={languageData[language].Dashboard.balances} onClick={() => { handleNavigation('/dashboard/balances') }} sx={{ bgcolor: isBalance ? '#00872a' : '', fontSize: isBalance ? 18 : 16, fontWeight: isBalance ? 'bold' : '', py: 2, px: 1 }} />
      <Chip label={languageData[language].Dashboard.transactions} onClick={() => { handleNavigation('/dashboard/transactions') }} sx={{ bgcolor: isTransactions ? '#00872a' : '', fontSize: isTransactions ? 18 : 16, fontWeight: isTransactions ? 'bold' : '', py: 2, px: 1 }} />
      {/*<Chip label="Deposit" variant="outlined" onClick={handleNavigation} />*/}
    </Stack>
  );
};
