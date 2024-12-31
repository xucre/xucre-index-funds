'use client'
import FundHeader from "@/components/fund/FundHeader";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function FundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Suspense>
      <Box width={'full'} px={5} py={4}>
        <Stack direction={'column'} spacing={2} flexGrow={2}>
            <FundHeader />
            {children}
        </Stack>           
      </Box>
    </Suspense>
  );
};