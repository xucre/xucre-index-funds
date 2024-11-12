'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Button, Chip, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
//import AccountButton from "./accountButton";
import languageData from '@/metadata/translations'
import { useRouter } from "next/navigation";
import React from "react";
import Stripe from "stripe";
// components/LoadingIndicator.tsx
export default function BillingHeader({ portalSession }: { portalSession: Stripe.BillingPortal.Session }) {
  const theme = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  const createNewDisbursement = () => {
    router.push('/billing/new');
  };

  const openStripePortal = () => {
    router.push(portalSession.url)
  }

  return (
    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} my={4}>
      {<Typography color={theme.palette.mode === 'dark' ? 'white' : 'gray'} variant={'h5'}>{(languageData[language].Menu.billing as string).toLowerCase()}</Typography>}
      <Chip color={'primary'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={createNewDisbursement} label={'New Disbursement'} />
      <Chip color={'primary'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={openStripePortal} label={languageData[language].Billing.manage_subscription} />
    </Stack>
  );
};
