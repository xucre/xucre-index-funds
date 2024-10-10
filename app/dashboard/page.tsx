'use client'
import DashboardContainerDesktop from "@/components/dashboard/DashboardContainerDesktop";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyProfileState from "@/components/onboarding/EmptyProfile";
import EmptySafeWallet from "@/components/onboarding/EmptySafeWallet";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useSFDC } from "@/hooks/useSFDC";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { getTextColor } from "@/service/helpers";
import { createAccount } from "@/service/safe";
import { updateSafeWalletDetails } from "@/service/sfdc";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Box, CircularProgress, Stack, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount, useClient, useConnectorClient, useWalletClient } from "wagmi";
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
  const { user } = useUser();
  const [safeWallet, setSafeWallet] = useState<string | null>(null);

  const createSafeWallet = async () => {
    const safeAddress = await createAccount({
      rpcUrl: 'https://endpoints.omniatech.io/v1/eth/sepolia/public',
      owner: address,
      threshold: 1,
      //signer: '',
    });
    setSafeAddress(user.id, safeAddress);
    updateSafeWalletDetails(user.id, safeAddress);
    setSafeWallet(safeAddress);
  }

  const syncSafeWallet = async () => {
    const walletAddress = await getSafeAddress(user.id);
    if (walletAddress) {
      console.log('safe address', walletAddress)
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

  const profileFilled = isLoaded && sfdcUser && sfdcUser.status === 'Active';
  return (
    <Suspense>
      <Box width={'full'}>
        {!profileFilled &&
          <EmptyProfileState onCreateProfile={(() => { router.push('/dashboard/edit') })} />
        }

        {profileFilled &&
          <>
            <DashboardHeader />
            {!safeWallet &&
              <EmptySafeWallet onCreateSafe={createSafeWallet} />
            }
            {safeWallet &&
              <DashboardContainerDesktop address={safeWallet} />
            }
          </>
        }
      </Box>
    </Suspense>
  );
};