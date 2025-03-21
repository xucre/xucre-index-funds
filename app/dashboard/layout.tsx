'use client'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
import EmptyDelegateOnSafe from "@/components/onboarding/EmptyDelegateOnSafe";
import EmptyProfileState from "@/components/onboarding/EmptyProfile";
import EmptySafeWallet from "@/components/onboarding/EmptySafeWallet";
import IncompleteOnboarding from "@/components/onboarding/IncompleteOnboarding";
import SignRiskDisclosure from "@/components/onboarding/SignRiskDisclosure";
import TransferEscrowWallet from "@/components/onboarding/TransferEscrowWallet";
import TransferSafeWallet from "@/components/onboarding/TransferSafeWallet";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { useClerkUser } from "@/hooks/useClerkUser";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useSFDC } from "@/hooks/useSFDC";
import { Box, Skeleton, Stack, useMediaQuery, useTheme } from "@mui/material"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isSignedUp = false;
  const { sfdcUser, isLoaded, hasOnboarded, refresh } = useSFDC();
  const { isAdmin } = useIsAdmin();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  //const signer = useWalletClient({ chainId })
  const router = useRouter();

  const disclosureSigned = sfdcUser && sfdcUser.riskDisclosureSigned;
  const profileFilled = isLoaded && sfdcUser && sfdcUser.status === 'Active' && hasOnboarded;
  const openOnboarding = () => {
    router.push('/onboarding');
  }

  useEffect(() => {
    if (isAdmin) {
      router.push('/billing');
    }
  }, [isAdmin])

  if (!isLoaded) return (
    <Box width={'full'} px={5} py={4}>
      <Skeleton variant={'rounded'} width="100%" height={200} />
    </Box>
  )
  return (
    <Suspense>
      <Box width={'full'} px={5} py={4}>
        {!profileFilled &&
          <OpaqueCard><IncompleteOnboarding onNavigateToWallet={openOnboarding} /></OpaqueCard>
        }

        {!disclosureSigned && profileFilled && false && 
          <OpaqueCard><SignRiskDisclosure type={'modal'} refresh={refresh}/></OpaqueCard>
        } 

        {profileFilled && 
          <Stack direction={matches ? 'row' : 'column'} spacing={8} justifyContent={'space-between'} px={5}>
            <Stack direction={'column'} spacing={2} flexGrow={2}>
              <DashboardNavigation />
              {children}
            </Stack>
            <DashboardNews />
          </Stack>
        }
      </Box>
    </Suspense>
  );
};
export const dynamic = "force-dynamic"