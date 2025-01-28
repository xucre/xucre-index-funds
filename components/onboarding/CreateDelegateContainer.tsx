'use client'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Skeleton, LinearProgress, Chip, Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import AccountButton from '../accountButton';
import { addProposer, AddProposerOptions, createAccount, CreateAccountOptions, getSafeProposer } from '@/service/safe';
import { updateSafeWalletDetails } from '@/service/sfdc';
import { setSafeAddress } from '@/service/db';
import { useRouter } from 'next/navigation';
import { globalChainId } from '@/service/constants';
import { useClerkUser } from '@/hooks/useClerkUser';

const CreateDelegateContainer = ({ id, setStep = (number) => {}}: {id: string, setStep? : (number) => void}) => {
  const {language} = useLanguage();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { user, safeWallet, refreshSafeWallet: syncSafeWallet, loading: clerkUserLoading } = useClerkUser();
  const router = useRouter();

  const [needsToSetProposer, setNeedsToSetProposer] = useState(false);
  // const needsToSetProposer = true;
  const [hasCheckedProposer, setHasCheckedProposer] = useState(false);


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
      setHasCheckedProposer(true);
  }

  useEffect(() => {
    if (safeWallet && user) {
      handleCheckSafeProposer();
    }
  }, [safeWallet])

  useEffect(() => {
    if (clerkUserLoading === false && user && !safeWallet) {
      //createSafeWallet();
    }
  }, [safeWallet, user, clerkUserLoading])

  const saveWallet = async () => {
      if (!safeWallet || !isConnected) return;
      setLoading(true);
      const safePayload = {
        chainid: globalChainId,
        safeWallet: safeWallet,
        proposer: address,
        name: user ? user.fullName : 'Xucre Client',
      } as AddProposerOptions;
      await addProposer(safePayload);
      setLoading(false);
      handleCheckSafeProposer();
  }
  
  const goBack = () => {
    setStep((prev) => prev - 1);
  }

  const handleNext = () => {
    setStep((prev) => prev + 1);
  }

  if (!hasCheckedProposer || !user) return (
    <Box width={'full'} px={5} py={4}>
      {/* <Skeleton variant={'rounded'} width="100%" height={200} /> */}
    </Box>
  )
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      height="100%"
      p={4}
    >
      {!loading && 
        <>
          <AccountCircleIcon color="action" fontSize="large" />
          {needsToSetProposer && 
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {languageData[language].Onboarding.empty_delegate}
            </Typography> 
          }
          <Typography variant="body1" color="textSecondary">
            {needsToSetProposer ? languageData[language].Onboarding.empty_delegate_description : languageData[language].Onboarding.empty_delegate_description_complete}
          </Typography>
          { isConnected && needsToSetProposer && 
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={saveWallet}
            >
              {languageData[language].Onboarding.empty_delegate_button}
            </Button>  
          } 
          {
            !isConnected &&
            <AccountButton />
          }
          <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} width={'100%'} >
            {
              <Chip 
                label={languageData[language].ui.previous}
                onClick={goBack} 
                color={'primary'}
                sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
              />
            }
            
            <Chip 
              label={languageData[language].ui.next}
              onClick={handleNext} 
              disabled={needsToSetProposer}
              color={'primary'}
              sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
            />
          </Stack>
        </>
      }
      
      {loading &&
        <>
          <LinearProgress />
          <Typography variant="body1" color="textSecondary">
            {languageData[language].Onboarding.linking_safe_title}
          </Typography>
        </>
      }
      
    </Box>
  );
};

export default CreateDelegateContainer;
