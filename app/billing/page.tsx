'use client'
import BillingHeader from "@/components/billing/BillingHeader";
import StripePricingTable from "@/components/billing/StripePricingTable";
import HorizontalLinearStepper from "@/components/onboarding/horizontalStepper";
import Step1Component from "@/components/onboarding/step1";
import { useStripeBilling } from "@/hooks/useStripeBilling";
import { updateOrganizationLicenses } from "@/service/clerk";
import { getTextColor } from "@/service/helpers";
import { upsertOrganization } from "@/service/sfdc";
import { checkoutSuccess } from "@/service/stripe";
import { Box, CircularProgress, Grid, Stack, Typography, useTheme } from "@mui/material"
import { useSearchParams } from "next/navigation";
import router from "next/router";
import { Suspense, useEffect, useState } from "react";

// components/LoadingIndicator.tsx
export default function Billing() {
  const theme = useTheme();
  const params = useSearchParams();
  const { hasSignedUp, seatCount, organization, portalSession, reset } = useStripeBilling();
  const session = params.get('session');
  const [trigger, setTrigger] = useState(false);
  //const billingOnboarded = false;

  const handleCheckoutComplete = async (sessionId) => {
    await checkoutSuccess(sessionId);
    setTrigger(true);
    reset();
  }

  useEffect(() => {
    if (session && session.length > 0) {
      handleCheckoutComplete(session);
    }
  }, [session])

  useEffect(() => {
    if (trigger && hasSignedUp && organization) {
      upsertOrganization(organization.id, organization.name, seatCount);
      updateOrganizationLicenses(organization.id, seatCount);
      setTrigger(false);
    }
  }, [hasSignedUp, organization])

  const hasLoaded = organization !== null;

  return (
    <Suspense>
      {hasLoaded &&
        <Box m={5} pb={10}>
          {!hasSignedUp &&
            <StripePricingTable />
          }

          {hasSignedUp &&
            <BillingHeader portalSession={portalSession} />
          }
        </Box>
      }
    </Suspense>
  );
};