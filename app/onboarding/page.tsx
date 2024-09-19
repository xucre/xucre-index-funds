'use client'
import HorizontalLinearStepper from "@/components/onboarding/horizontalStepper";
import Step1Component from "@/components/onboarding/step1";
import { getTextColor } from "@/service/helpers";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, CircularProgress, Grid, Stack, Typography, useTheme } from "@mui/material"
import { useSearchParams } from "next/navigation";
import router from "next/router";
import { Suspense, useEffect, useState } from "react";

// components/LoadingIndicator.tsx
export default function Onboarding() {
  const theme = useTheme();
  const params = useSearchParams();
  const _step = params.get('step');
  const { user } = useAuth0();
  const [step, setStep] = useState(_step ? parseInt(_step) : 1);

  useEffect(() => {
    console.log(user);
  }, [user])

  return (
    <Suspense>
      <Box height={'full'} width={'full'} m={5}>
        <HorizontalLinearStepper step={step} setStep={setStep} />
        {step === 1 &&
          <Step1Component />
        }
      </Box>
    </Suspense>
  );
};