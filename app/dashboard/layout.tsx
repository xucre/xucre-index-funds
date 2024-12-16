'use client'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
import EmptyProfileState from "@/components/onboarding/EmptyProfile";
import EmptySafeWallet from "@/components/onboarding/EmptySafeWallet";
import TransferEscrowWallet from "@/components/onboarding/TransferEscrowWallet";
import TransferSafeWallet from "@/components/onboarding/TransferSafeWallet";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { useSFDC } from "@/hooks/useSFDC";
import { isDev } from "@/service/constants";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { getDashboardBorderColor } from "@/service/helpers";
import { getSafeOwner, transferSignerOwnership } from "@/service/safe";
import { updateSafeWalletDetails } from "@/service/sfdc";
import { useUser } from "@clerk/nextjs";
import { Box, Skeleton, Stack, useMediaQuery, useTheme } from "@mui/material"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
//import '@covalenthq/goldrush-kit/styles.css'

const NewsBlock = () => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <Stack direction={'column'} spacing={2} px={2} maxWidth={!matches ? '100%' : '35%'}>
      <DashboardNews />
    </Stack>
  )
}

// components/LoadingIndicator.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isSignedUp = false;
  const { sfdcUser, isLoaded } = useSFDC();
  const { address, chainId } = useAccount();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  //const signer = useWalletClient({ chainId })
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [safeWallet, setSafeWallet] = useState<string | null>(null);
  const [needsToTransfer, setNeedsToTransfer] = useState(false);

  const syncSafeWallet = async () => {
    if (!user) return;
      const walletAddress = await getSafeAddress(user.id);
    if (walletAddress) {
      setSafeWallet(walletAddress);
    } else {
      setSafeWallet(null);
    }
  }

  const handleCheckSafeOwnership = async () => {
    if (!safeWallet) return;
    const owners = await getSafeOwner(137, safeWallet);
    console.log('safe owners', owners);
    const hasCorrectOwner = owners.includes(process.env.NEXT_PUBLIC_SIGNER_SAFE_ADDRESS_POLYGON as string);
    if (!hasCorrectOwner) {
      setNeedsToTransfer(true);
      //createEscrowAddress();
    }
  }

  const handeTransferOwnership = async () => {
    if (!safeWallet) return;
    await transferSignerOwnership({
      chainid: 137,
      safeWallet: safeWallet
    });
    setNeedsToTransfer(false);
  }


  useEffect(() => {
    if (user && user.id) {
      syncSafeWallet();
      //setSafeAddress(user.id, '');
    }
  }, [user])


  useEffect(() => {
    if (safeWallet && user) {
      handleCheckSafeOwnership();
    }
  }, [safeWallet])

  const profileFilled = isLoaded && sfdcUser && sfdcUser.status === 'Active';
  return (
    <Suspense>
      <Box width={'full'} px={5} py={4}>
        {!profileFilled &&
          <OpaqueCard><EmptyProfileState onCreateProfile={(() => { router.push('/settings/portfolio') })} /></OpaqueCard>
        }

        {profileFilled &&
          <>
            <DashboardHeader />
            {!safeWallet ?
              <OpaqueCard><EmptySafeWallet id={user ? user.id : ''} refresh={syncSafeWallet} /></OpaqueCard> : 
              needsToTransfer && false ?
                <OpaqueCard><TransferSafeWallet onTransferSafe={handeTransferOwnership} /></OpaqueCard> :
                <>
                  <Stack direction={matches ? 'row' : 'column'} spacing={8} justifyContent={'space-between'} px={5}>
                    <Stack direction={'column'} spacing={2} flexGrow={2}>
                      <DashboardNavigation />
                      {children}
                    </Stack>
                    <NewsBlock />
                  </Stack>
                </>
            }
          </>
        }
      </Box>
    </Suspense>
  );
};