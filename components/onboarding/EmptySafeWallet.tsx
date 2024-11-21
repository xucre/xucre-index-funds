'use client'
import React, { useState } from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import AccountButton from '../accountButton';
import { createAccount, CreateAccountOptions } from '@/service/safe';
import { updateSafeWalletDetails } from '@/service/sfdc';
import { setSafeAddress } from '@/service/db';
import { useRouter } from 'next/navigation';

const EmptySafeWallet = ({ id }) => {
  const {language} = useLanguage();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const createSafeWallet = async () => {
    if (!id) return;
    setLoading(true);
    const safePayload = {
      rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
      owner: '',
      threshold: 1,
      id: id,
      chainid: 137
    } as CreateAccountOptions;
    console.log('createSafeWallet');
    const safeAddress = await createAccount(safePayload);
    setSafeAddress(id, safeAddress);
    updateSafeWalletDetails(id, safeAddress);
    setLoading(false);
    window.location.reload();
  }
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
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {languageData[language].Onboarding.empty_safe}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {languageData[language].Onboarding.empty_safe_description}
          </Typography>
          {
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={createSafeWallet}
            >
              {languageData[language].Onboarding.create_safe}
            </Button>  
          } 
          {
            false &&
            <AccountButton />
          }
        </>
      }
      
      {loading &&
        <Skeleton variant={'rounded'} width="100%" height={200} />
      }
      
    </Box>
  );
};

export default EmptySafeWallet;
