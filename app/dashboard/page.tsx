'use client'
import { getTextColor } from "@/service/helpers";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, CircularProgress, Grid, Stack, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// components/LoadingIndicator.tsx
export default function Dashboard() {
  const theme = useTheme();
  const isSignedUp = false;
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth0();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && !isSignedUp) {
        router.replace('/onboarding?step=1')
      }
    }
  }, [isAuthenticated, isLoading, isSignedUp]);
  return (
    <Suspense>
      <Box height={'full'} width={'full'}>
        <Stack direction={'column'} justifyContent={'center'} alignItems={'center'}>
          <Typography variant={'h6'} color={getTextColor(theme)}>Muy Pronto</Typography>
        </Stack>
      </Box>
    </Suspense>
  );
};