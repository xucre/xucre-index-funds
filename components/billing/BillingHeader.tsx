'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Box, Button, Chip, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
//import AccountButton from "./accountButton";
import languageData from '@/metadata/translations'
import { useRouter } from "next/navigation";
import React from "react";
import Stripe from "stripe";

import { setOrganizationSafeAddress } from "@/service/db";
import { isDev } from "@/service/constants";
import { uid } from "uid-promise";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";
// components/LoadingIndicator.tsx
export default function BillingHeader({ portalSession, openPortal, hasSignedUp, isManualBilling }: { portalSession: Stripe.BillingPortal.Session | null, openPortal: Function, hasSignedUp: boolean, isManualBilling: boolean }) {
  const theme = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const { organization } = useClerkOrganization();
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

  const openStripePricing = () => {
    router.push('/pricing')
  }

  const clearSafewallet = async () => {
    if (!organization) return;
    await setOrganizationSafeAddress(organization.id, '', 'escrow');
    router.refresh()
  }

  return (
    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} my={4}>
      {<Typography color={theme.palette.mode === 'dark' ? 'white' : 'gray'} variant={'h5'}>{(languageData[language].Menu.billing as string)}</Typography>}
      <Chip color={'primary'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={createNewDisbursement} label={languageData[language].Billing.new_disbursement_button} />
      {false && <Chip color={'error'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={clearSafewallet} label={'Clear Escrow Wallet'} /> }
      {!isManualBilling && false ? 
        <>
          {hasSignedUp ?
            <Chip color={'primary'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={openStripePortal} label={languageData[language].Billing.manage_subscription} /> : 
            <Chip color={'primary'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={openStripePricing} label={languageData[language].Billing.manage_subscription} />
          }
        </> : <Box><Chip color={'primary'} disabled sx={{fontWeight: 'bold', px: 3, py: 1}} label={languageData[language].Billing.manual_subscription} /></Box>
      }
    </Stack>
  );
};
