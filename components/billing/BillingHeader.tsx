'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Button, Chip, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
//import AccountButton from "./accountButton";
import languageData from '@/metadata/translations'
import { useRouter } from "next/navigation";
import React from "react";
import Stripe from "stripe";
import { useOrganization } from "@clerk/nextjs";
import { setOrganizationSafeAddress } from "@/service/db";
import { isDev } from "@/service/constants";
import { uid } from "uid-promise";
// components/LoadingIndicator.tsx
export default function BillingHeader({ portalSession, openPortal }: { portalSession: Stripe.BillingPortal.Session | null, openPortal: Function }) {
  const theme = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const { organization } = useOrganization();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  const createNewDisbursement = async () => {
    const id = await uid(16);
    router.push(`/billing/${id}`);
  };

  const openStripePortal = () => {
    // if (!portalSession) return;
    // router.push(portalSession.url)
    openPortal();
  }

  const clearSafewallet = async () => {
    if (!organization) return;
    await setOrganizationSafeAddress(organization.id, '', 'escrow');
    router.refresh()
  }

  
  return (
    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} my={4}>
      {<Typography color={theme.palette.mode === 'dark' ? 'white' : 'gray'} variant={'h5'}>{(languageData[language].Menu.billing as string)}</Typography>}
      <Chip color={'primary'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={createNewDisbursement} label={'New Disbursement'} />
      {false && <Chip color={'error'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={clearSafewallet} label={'Clear Escrow Wallet'} /> }
      <Chip color={'primary'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={openStripePortal} label={languageData[language].Billing.manage_subscription} />
    </Stack>
  );
};
