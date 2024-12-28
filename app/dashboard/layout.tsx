'use client'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
import EmptyDelegateOnSafe from "@/components/onboarding/EmptyDelegateOnSafe";
import EmptyProfileState from "@/components/onboarding/EmptyProfile";
import EmptySafeWallet from "@/components/onboarding/EmptySafeWallet";
import SignRiskDisclosure from "@/components/onboarding/SignRiskDisclosure";
import TransferEscrowWallet from "@/components/onboarding/TransferEscrowWallet";
import TransferSafeWallet from "@/components/onboarding/TransferSafeWallet";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { useClerkUser } from "@/hooks/useClerkUser";
import { useSFDC } from "@/hooks/useSFDC";
import { globalChainId, isDev } from "@/service/constants";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { getDashboardBorderColor } from "@/service/helpers";
import { getSafeOwner, transferSignerOwnership, getSafeProposer } from "@/service/safe";
import { updateSafeWalletDetails } from "@/service/sfdc";
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
  const { sfdcUser, isLoaded, refresh } = useSFDC();
  const { address, chainId, isConnected } = useAccount();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  //const signer = useWalletClient({ chainId })
  const router = useRouter();
  const { user } = useClerkUser();
  const [safeWallet, setSafeWallet] = useState<string | null>(null);
  const [needsToTransfer, setNeedsToTransfer] = useState(false);
  const [needsToSetProposer, setNeedsToSetProposer] = useState(false);

  const syncSafeWallet = async () => {
    if (!user) return;
    //setSafeWallet(null);
    const walletAddress = await getSafeAddress(user.id);
    if (walletAddress) {
      setSafeWallet(walletAddress);
    } else {
      setSafeWallet(null);
    }
  }

  const handleCheckSafeOwnership = async () => {
    if (!safeWallet) return;
    const owners = await getSafeOwner(globalChainId, safeWallet);
    const hasCorrectOwner = owners.includes(process.env.NEXT_PUBLIC_SIGNER_SAFE_ADDRESS_POLYGON as string);
    if (!hasCorrectOwner) {
      setNeedsToTransfer(true);
      //createEscrowAddress();
    }
  }

  const handleCheckSafeProposer = async () => {
    if (!safeWallet) return;
    const params = {
      chainid: globalChainId,
      safeWallet: safeWallet
    }
    const delegates = await getSafeProposer(params);
    if (delegates.count === 0) {
      setNeedsToSetProposer(true);
    } else {
      setNeedsToSetProposer(false);
    }
    // const hasCorrectProposer = proposer === address;
    // if (!hasCorrectProposer) {
    //   setNeedsToSetProposer(true);
    // }
  }

  const handeTransferOwnership = async () => {
    if (!safeWallet) return;
    await transferSignerOwnership({
      chainid: globalChainId,
      safeWallet: safeWallet
    });
    setNeedsToTransfer(false);
  }

  useEffect(() => {
    console.log('user has reloaded');
    if (user && user.id) {
      syncSafeWallet();
      //setSafeAddress(user.id, '');
    }
  }, [user])


  useEffect(() => {
    if (safeWallet && user) {
      handleCheckSafeProposer();
    }
  }, [safeWallet])

  const disclosureSigned = sfdcUser && sfdcUser.riskDisclosureSigned;
  const profileFilled = isLoaded && sfdcUser && sfdcUser.status === 'Active';
  
  return (
    <Suspense>
      <Box width={'full'} px={5} py={4}>
        {!profileFilled &&
          <OpaqueCard><EmptyProfileState onCreateProfile={(() => { router.push('/settings/portfolio') })} /></OpaqueCard>
        }

        {!disclosureSigned && profileFilled &&
          <OpaqueCard><SignRiskDisclosure refresh={refresh}/></OpaqueCard>
        }

        {profileFilled && disclosureSigned && 
          <>
            <DashboardHeader />
            {!safeWallet ?
                <OpaqueCard><EmptySafeWallet id={user ? user.id : ''} refresh={syncSafeWallet} /></OpaqueCard> : 
              needsToSetProposer ?
                <OpaqueCard><EmptyDelegateOnSafe id={safeWallet ? safeWallet : ''} refresh={syncSafeWallet} /></OpaqueCard> :
                <>
                  <Stack direction={matches ? 'row' : 'column'} spacing={8} justifyContent={'space-between'} px={5}>
                    <Stack direction={'column'} spacing={2} flexGrow={2}>
                      <DashboardNavigation />
                      {children}
                    </Stack>
                    <DashboardNews />
                  </Stack>
                </>
            }
          </>
        }
      </Box>
    </Suspense>
  );
};