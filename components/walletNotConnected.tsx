'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
//import AccountButton from "./accountButton";
import AccountButton from "@/components/accountButton";
import languageData, { Language } from '@/metadata/translations';
// components/LoadingIndicator.tsx
export default function WalletNotConnected() {
  const theme = useTheme();
  const { language } = useLanguage();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <Stack justifyContent={'center'} alignItems={'center'} my={10}>
      {/*<Typography color={theme.palette.mode === 'dark' ? 'white' : 'gray'} my={3}>{languageData[language].ui.address_not_found}</Typography>*/}
      {
        // <AccountButton />
      }

      <Stack  direction={'row'} justifyContent={'center'} alignItems={'center'} spacing={2}>
        <Typography >{languageData[language].Onboarding.wallet_not_connected}</Typography>
      </Stack>
    </Stack>
  );
};
