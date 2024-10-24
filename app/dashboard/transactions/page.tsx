'use client'
import DashboardTransactionList from "@/components/dashboard/DashboardTransactionList";
import { useWalletData } from "@/hooks/useWalletData";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { useUser } from "@clerk/nextjs";
import { Box, useTheme } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function DashboardTransactions() {
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

  const _address = '0x358eB621894B55805CE16225b2504523d421d3A6';
  const { transactions } = useWalletData({ address: _address });

  return (
    <DashboardTransactionList address={safeWallet} transactions={transactions} truncate={false} />
  );
};