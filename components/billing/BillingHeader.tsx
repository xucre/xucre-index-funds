'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Button, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
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
  return (
    <Stack direction={'row'} justifyContent={'space-around'} alignItems={'center'} my={4}>
      {<Typography color={theme.palette.mode === 'dark' ? 'white' : 'gray'} variant={'h5'}>{(languageData[language].Menu.billing as string).toLowerCase()}</Typography>}
      <></>
      <Button variant="contained" color="primary" onClick={() => { router.push(portalSession.url) }}>{languageData[language].Billing.manage_subscription}</Button>
    </Stack>
  );
};
