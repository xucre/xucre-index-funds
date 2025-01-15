'use client'
import React, { useState } from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import AccountButton from '../accountButton';
import { addProposer, AddProposerOptions, createAccount, CreateAccountOptions } from '@/service/safe';
import { updateSafeWalletDetails } from '@/service/sfdc';
import { setSafeAddress } from '@/service/db';
import { useRouter } from 'next/navigation';
import { globalChainId } from '@/service/constants';
import { useClerkUser } from '@/hooks/useClerkUser';

const EmptyDelegateOnSafe = ({ id, refresh }: {id: string, refresh: Function}) => {
  const {language} = useLanguage();
  const {user} = useClerkUser();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const saveWallet = async () => {
    if (!id) return;
    setLoading(true);
    const safePayload = {
      chainid: globalChainId,
      safeWallet: id,
      proposer: address,
      name: user ? user.fullName : 'Xucre Client',
    } as AddProposerOptions;
    await addProposer(safePayload);
    setLoading(false);
    refresh();
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
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {languageData[language].Onboarding.empty_delegate}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {languageData[language].Onboarding.empty_delegate_description}
          </Typography>
          { isConnected &&
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
        </>
      }
      
      {loading &&
        <Skeleton variant={'rounded'} width="100%" height={200} />
      }
      
    </Box>
  );
};

export default EmptyDelegateOnSafe;
