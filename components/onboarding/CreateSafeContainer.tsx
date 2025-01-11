'use client'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Skeleton, LinearProgress, Chip, Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import AccountButton from '../accountButton';
import { createAccount, CreateAccountOptions } from '@/service/safe';
import { updateSafeWalletDetails } from '@/service/sfdc';
import { setSafeAddress } from '@/service/db';
import { useRouter } from 'next/navigation';
import { globalChainId } from '@/service/constants';
import { useClerkUser } from '@/hooks/useClerkUser';

const CreateSafeContainer = ({ id, setStep = (number) => {}}: {id: string, setStep? : (number) => void}) => {
  const {language} = useLanguage();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { user, safeWallet, refreshSafeWallet: syncSafeWallet, loading: clerkUserLoading } = useClerkUser();
  const router = useRouter();

  const safeCreated = safeWallet && safeWallet !== '';

  useEffect(() => {
    if (clerkUserLoading === false && user && !safeWallet) {
      createSafeWallet();
    }
  }, [safeWallet, user, clerkUserLoading])

  const createSafeWallet = async () => {
    if (!id) return;
    setLoading(true);
    const safePayload = {
      rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
      owner: '',
      threshold: 1,
      id: id,
      chainid: globalChainId
    } as CreateAccountOptions;
    const safeAddress = await createAccount(safePayload);
    setSafeAddress(id, safeAddress);
    updateSafeWalletDetails(id, safeAddress);
    setLoading(false);
    //callback();
  }

  const goBack = () => {
    setStep((prev) => prev - 1);
  }

  const handleNext = () => {
    setStep((prev) => prev + 1);
  }

  useEffect(() => {
    
  }, [safeWallet])
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
      {!loading && !clerkUserLoading && 
        <>
          <AccountCircleIcon color="action" fontSize="large" />
          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: safeCreated ? 3 : 1 }}>
            {safeCreated ? languageData[language].Onboarding.safe_created : languageData[language].Onboarding.empty_safe}
          </Typography>
          
          <Typography variant="body1" color="textSecondary">
            {!safeCreated ? languageData[language].Onboarding.empty_safe_description : `matic:${safeWallet}`}
          </Typography>
          

          {!safeCreated && 
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={createSafeWallet}
            >
              {languageData[language].Onboarding.create_safe}
            </Button>  
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
              disabled={!safeCreated}
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
            {languageData[language].Onboarding.creating_safe_title}
          </Typography>
        </>
      }
      
    </Box>
  );
};

export default CreateSafeContainer;
