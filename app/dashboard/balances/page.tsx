'use client'
import DashboardBalanceList from "@/components/dashboard/DashboardBalanceList";
import { useClerkUser } from "@/hooks/useClerkUser";
import { Box, useTheme } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function DashboardBalances() {
  const theme = useTheme();
  const isSignedUp = false;
  const { user,safeWallet, refreshSafeWallet: syncSafeWallet } = useClerkUser();

  useEffect(() => {
    if (user && user.id) {
      syncSafeWallet();
    }
  }, [user])

  if (!safeWallet) return null;
  return (
    <DashboardBalanceList address={safeWallet} />
  );
};

export const dynamic = "force-dynamic"