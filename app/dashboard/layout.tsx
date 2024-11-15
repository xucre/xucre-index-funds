'use client'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
import EmptyProfileState from "@/components/onboarding/EmptyProfile";
import EmptySafeWallet from "@/components/onboarding/EmptySafeWallet";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { useSFDC } from "@/hooks/useSFDC";
import { isDev } from "@/service/constants";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { getDashboardBorderColor } from "@/service/helpers";
import { createAccount, CreateAccountOptions, createAccountSelfSign } from "@/service/safe";
import { updateSafeWalletDetails } from "@/service/sfdc";
import { useUser } from "@clerk/nextjs";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
//import '@covalenthq/goldrush-kit/styles.css'

const WalletBlock = () => {
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

  const createSafeWallet = async () => {
    
    const safePayload = isDev ? { 
      rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
      owner: address,
      threshold: 1
    } as CreateAccountOptions : {
      rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
      owner: address,
      threshold: 1,
      chainid: 137
    } as CreateAccountOptions;
    console.log('createSafeWallet', isDev);
    const safeAddress = await createAccount(safePayload);
    setSafeAddress(user.id, safeAddress);
    updateSafeWalletDetails(user.id, safeAddress);
    setSafeWallet(safeAddress);
  }

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
              <OpaqueCard><EmptySafeWallet onCreateSafe={createSafeWallet} /></OpaqueCard> :
              <>
                <Stack direction={matches ? 'row' : 'column'} spacing={8} justifyContent={'space-between'} px={5}>
                  <Stack direction={'column'} spacing={2} flexGrow={2}>
                    <DashboardNavigation />
                    {children}
                  </Stack>
                  <WalletBlock />
                </Stack>
              </>
            }
          </>
        }
      </Box>
    </Suspense>
  );
};