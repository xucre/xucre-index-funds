'use client'
import { Box, useTheme } from "@mui/material"
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// components/LoadingIndicator.tsx
export default function Onboarding() {
  const theme = useTheme();
  const params = useSearchParams();
  const _step = params.get('step');
  const [step, setStep] = useState(_step ? parseInt(_step) : 1);
  return (
    <Suspense>
      <Box height={'full'} width={'full'} m={5}>
      </Box>
    </Suspense>
  );
};