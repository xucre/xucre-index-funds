'use client'
import DashboardBalanceList from "@/components/dashboard/DashboardBalanceList";
import { useClerkUser } from "@/hooks/useClerkUser";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { Box, useTheme } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function DashboardBalances() {
  const theme = useTheme();
  const isSignedUp = false;
  const { user } = useClerkUser();
  const [safeWallet, setSafeWallet] = useState<string>('');
  const syncSafeWallet = async () => {
    if (!user) return;
    const walletAddress = await getSafeAddress(user.id);
    if (walletAddress) {
      setSafeWallet(walletAddress);
    } else {
      setSafeWallet('');
    }
  }

  useEffect(() => {
    if (user && user.id) {
      syncSafeWallet();
    }
  }, [user])

  return (
    <DashboardBalanceList address={safeWallet} />
  );
};

export const dynamic = "force-dynamic"