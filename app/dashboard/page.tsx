'use client'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { useClerkUser } from "@/hooks/useClerkUser";
import { useSFDC } from "@/hooks/useSFDC";
import { updateSafeWalletDetails } from "@/service/sfdc";
import { Box, useTheme } from "@mui/material"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function Dashboard() {
  const theme = useTheme();
  const isSignedUp = false;
  const { sfdcUser, isLoaded } = useSFDC();
  const { address, chainId } = useAccount();
  //const signer = useWalletClient({ chainId })
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, safeWallet, refreshSafeWallet: syncSafeWallet } = useClerkUser();

  useEffect(() => {
    if (user && user.id) {
      syncSafeWallet();
    }
  }, [user])

  if (!safeWallet) return null;

  return (
    <DashboardContainer address={safeWallet} />
  );
};

export const dynamic = "force-dynamic"