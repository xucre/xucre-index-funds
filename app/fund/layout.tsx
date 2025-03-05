'use client'
import FundHeader from "@/components/fund/FundSelector";
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
      <Box px={5}>
         <Box mt={{ xs: 0 }} mx={2}>
            <FundHeader />
          </Box>
          {children}   
      </Box>
    </Suspense>
  );
};

export const dynamic = "force-dynamic"