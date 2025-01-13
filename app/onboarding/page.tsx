'use client'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
import AdditionalInfoContainer from "@/components/onboarding/AdditionalInfoContainer";
import CreateDelegateContainer from "@/components/onboarding/CreateDelegateContainer";
import CreateSafeContainer from "@/components/onboarding/CreateSafeContainer";
import EmptyDelegateOnSafe from "@/components/onboarding/EmptyDelegateOnSafe";
import EmptyProfileState from "@/components/onboarding/EmptyProfile";
import EmptySafeWallet from "@/components/onboarding/EmptySafeWallet";
import IncompleteOnboarding from "@/components/onboarding/IncompleteOnboarding";
import SignRiskDisclosure from "@/components/onboarding/SignRiskDisclosure";
import TransferEscrowWallet from "@/components/onboarding/TransferEscrowWallet";
import TransferSafeWallet from "@/components/onboarding/TransferSafeWallet";
import EditUserPortfolio from "@/components/settings/EditUserPortfolio";
import EditUserProfile from "@/components/settings/EditUserProfile";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { useClerkUser } from "@/hooks/useClerkUser";
import { useLanguage } from "@/hooks/useLanguage";
import { useSFDC } from "@/hooks/useSFDC";
import { globalChainId, isDev } from "@/service/constants";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { getDashboardBorderColor } from "@/service/helpers";
import { getSafeOwner, transferSignerOwnership, getSafeProposer } from "@/service/safe";
import { updateSafeWalletDetails } from "@/service/sfdc";
import { Box, Skeleton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";


const steps = ['Create Profile', 'Create Safe Wallet', 'Link Personal Wallet', 'Additional Information'];
export default function OnboardingPage() {
  const theme = useTheme();
  const {language, languageData} = useLanguage();
  const isSignedUp = false;
  const { sfdcUser, isLoaded, refresh, hasOnboarded, updateUser } = useSFDC();
  const { address, chainId, isConnected } = useAccount();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  //const signer = useWalletClient({ chainId })
  const router = useRouter();
  const { user, safeWallet, refreshSafeWallet: syncSafeWallet } = useClerkUser();
  const [needsToTransfer, setNeedsToTransfer] = useState(false);
  const [needsToSetProposer, setNeedsToSetProposer] = useState(false);
  const [hasCheckedProposer, setHasCheckedProposer] = useState(false);

  const [step, setStep] = useState(0);

  const handleCheckSafeProposer = async () => {
    if (!safeWallet) {
      console.log('has checked proposer but no safe wallet');
      setNeedsToSetProposer(true);
      setHasCheckedProposer(true);
      return;
    }
    console.log('checking safe proposer', safeWallet, user);
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
    setHasCheckedProposer(true);
  }

  useEffect(() => {
    if (safeWallet && user) {
      handleCheckSafeProposer();
    }
  }, [safeWallet, user])

  useEffect(() => {
    console.log('user has reloaded');
    if (user && user.id) {
      //syncSafeWallet();
      //setSafeAddress(user.id, '');
    }
  }, [user])

  useEffect(() => {
    if (step === 5) {
      updateUser({...sfdcUser, status: 'Active', onboardingStatus: 'complete'})
    }
  }, [step]);
  

  const disclosureSigned = sfdcUser && sfdcUser.riskDisclosureSigned;
  const profileFilled = isLoaded && sfdcUser && sfdcUser.status === 'Active';
  const openOnboarding = () => {
    router.push('/onboarding');
  }

  if (!hasCheckedProposer || !user) return (
    <Box width={'full'} px={5} py={4}>
      <Skeleton variant={'rounded'} width="100%" height={200} />
    </Box>
  )

  if (!disclosureSigned) return (
    <Box width={'full'} px={5} py={4}>
      <OpaqueCard><SignRiskDisclosure type={'card'} refresh={refresh}/></OpaqueCard>
    </Box>
  )
  return (
      <Box width={'full'} px={5} py={4}>
        <Typography variant={'h5'} pb={2}>{languageData[language].Onboarding.onboarding_title}</Typography>
        {step === 0 && false && 
          <>
            {/* <OpaqueCard><EmptySafeWallet id={user ? user.id : ''} refresh={syncSafeWallet} /></OpaqueCard> 
            <OpaqueCard><EmptyDelegateOnSafe id={safeWallet ? safeWallet : ''} refresh={syncSafeWallet} /></OpaqueCard>  */}
          </>
        }

        {step === 0 && 
          <OpaqueCard><EditUserProfile selectedTab={0} showOpaqueCard={false} setStep={setStep} saveType={'next'}/></OpaqueCard>
        }

        {step === 1 && 
          <OpaqueCard><EditUserProfile selectedTab={1} showOpaqueCard={false} showPrevious={true} setStep={setStep} saveType={'next'}/></OpaqueCard> 
        }

        {step === 2 && 
          <OpaqueCard><EditUserPortfolio direction={'row'} showOpaqueCard={false} showPrevious={true} setStep={setStep} saveType={'next'}/></OpaqueCard> 
        }

        {step === 3 && 
          <OpaqueCard><CreateSafeContainer id={user.id} setStep={setStep}/></OpaqueCard> 
        }

        {step === 4 && 
          <OpaqueCard><CreateDelegateContainer setStep={setStep} id={user.id} /></OpaqueCard> 
        }

        {step === 5 && 
          <OpaqueCard><AdditionalInfoContainer setStep={setStep} /></OpaqueCard> 
        }
      </Box>
  );
};