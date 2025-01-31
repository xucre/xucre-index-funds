'use client'
import React, { useEffect, useState } from 'react';
import AccountButton from '../accountButton';
import { Box, Button, Chip, Divider, LinearProgress, Link, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useSFDC } from '@/hooks/useSFDC';
import truncateEthAddress from 'truncate-eth-address';
import WalletQRCode from './WalletQRCode';
import { globalChainId } from '@/service/constants';
import { useClerkUser } from '@/hooks/useClerkUser';
import { addProposer, AddProposerOptions, getSafeProposer } from '@/service/safe';
import { useAccount } from 'wagmi';
import { enqueueSnackbar } from 'notistack';

const WalletManagement: React.FC = () => {
  const {language} = useLanguage();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const {sfdcUser} = useSFDC();
  const { user, safeWallet, refreshSafeWallet: syncSafeWallet, loading: clerkUserLoading } = useClerkUser();
  const [needsToSetProposer, setNeedsToSetProposer] = useState(false);
  const [hasCheckedProposer, setHasCheckedProposer] = useState(false);
  //const needsToSetProposer = true;
  const saveWallet = async () => {
    if (!safeWallet || !isConnected) return;
    setLoading(true);
    const safePayload = {
      chainid: globalChainId,
      safeWallet: safeWallet,
      proposer: address,
      name: (sfdcUser && sfdcUser.firstName && sfdcUser.lastName) ? `${Array.from(sfdcUser.firstName)[0]}${Array.from(sfdcUser.lastName)[0]} - ${address}` : `Xucre Proposer - ${address}`,
    } as AddProposerOptions;
    const {success, message} = await addProposer(safePayload);
    if (success) {
      setLoading(false);
      enqueueSnackbar(`${languageData[language].ui.success}`, { variant: 'success', autoHideDuration: 5000 });
      handleCheckSafeProposer();
    } else {
      setLoading(false);
      enqueueSnackbar(`${languageData[language].ui.error}`, { variant: 'error', autoHideDuration: 5000 });
    }
    
  }


  useEffect(() => {
    if (safeWallet && user) {
      handleCheckSafeProposer();
    }
  }, [safeWallet])

  const handleCheckSafeProposer = async () => {
      if (!safeWallet) return;
      const params = {
        chainid: globalChainId,
        safeWallet: safeWallet
      }
      console.log('handleCheckSafeProposer', params);
      const delegates = await getSafeProposer(params);
      console.log('delegates', delegates);
      if (delegates.count === 0) {
        setNeedsToSetProposer(true);
      } else {
        setNeedsToSetProposer(false);
      }
      setHasCheckedProposer(true);
  }

  const hasSafe = safeWallet ? safeWallet.length > 0 : false;
  if (!hasCheckedProposer || !user) return (
    <Box width={'full'} px={5} py={4}>
      { <Skeleton variant={'rounded'} width="100%" height={200} /> }
    </Box>
  )

  if (needsToSetProposer) return (
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
  )
  return (
    <Box>
      <Stack direction={'column'} spacing={2} mb={2} >
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography variant={'h4'}>{languageData[language].Profile.wallet_management}</Typography>
          <AccountButton />
        </Stack>
        <Divider />
        {hasSafe && 
          <WalletButton address={safeWallet ? safeWallet : ''} />
        }
         
      </Stack>
    </Box>
  );
};

const WalletButton = ({ address }: { address: string }) => {
  const theme = useTheme();
  return (
    <Stack direction={'column'} spacing={2} justifyContent={'center'} alignItems={'center'}>
      <WalletQRCode safeAddress={address} />
      <a href={`https://app.safe.global/home?safe=matic:${address}`} color="inherit" target={'_blank'} >
        <Stack direction={'row'} alignItems={'center'} width={'100%'} display={'flex'} justifyContent={'center'} spacing={2}>
          <Box bgcolor={'#12ff80'} display={'flex'} borderRadius={4} justifyContent={'center'} alignItems={'center'}>
            <img src='/safe-logo.png' width={50} height={50} />
          </Box>

          <Box bgcolor={theme.palette.mode === 'dark' ? 'gray' : 'lightgray'} borderRadius={4} py={1} px={2}><Typography variant={'body1'}>{truncateEthAddress(address)}</Typography></Box>
        </Stack>
      </a>
    </Stack>
    
  )
}

export default WalletManagement;