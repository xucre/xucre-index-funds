'use client'
import { Box, CircularProgress, Grid, Stack, Typography } from "@mui/material"
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// components/LoadingIndicator.tsx
export default function SendPage() {

  const searchParams = useSearchParams()
  const address = searchParams.get('address');
  useEffect(() => {
    if (address) {
      window.location.assign(`xucre.expo.client://SendToken?address=${address}`);
    }
  }, [address])

  return (
    <Suspense>
      <Typography textAlign={'center'}>{address}</Typography>
    </Suspense>
  );
};