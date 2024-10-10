'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { playStoreAddress } from "@/service/constants";
import { Avatar, Box, CircularProgress, Fab, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
//import AccountButton from "./accountButton";
import languageData from '@/metadata/translations'
import AccountButton from "@/components/accountButton";
// components/LoadingIndicator.tsx
export default function WalletNotConnected() {
  const theme = useTheme();
  const { language } = useLanguage();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <Stack justifyContent={'center'} alignItems={'center'} my={10}>
      {/*<Typography color={theme.palette.mode === 'dark' ? 'white' : 'gray'} my={3}>{languageData[language].ui.address_not_found}</Typography>*/}
      {
        <AccountButton />
      }
    </Stack>
  );
};
