'use client'
import DashboardBalanceList from "@/components/dashboard/DashboardBalanceList";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { useUser } from "@clerk/nextjs";
import { Box, useTheme } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function DashboardBalances() {
  const theme = useTheme();
  const isSignedUp = false;
  const { user } = useUser();
  const [safeWallet, setSafeWallet] = useState<string | null>(null);
  const syncSafeWallet = async () => {
    const walletAddress = await getSafeAddress(user.id);
    if (walletAddress) {
      setSafeWallet(walletAddress);
    } else {
      setSafeWallet(null);
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