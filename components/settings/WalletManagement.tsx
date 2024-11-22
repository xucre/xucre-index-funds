'use client'
import React, { useEffect, useState } from 'react';
import AccountButton from '../accountButton';
import { Box, Chip, Divider, Link, Stack, Typography, useTheme } from '@mui/material';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useSFDC } from '@/hooks/useSFDC';
import { useUser } from '@clerk/nextjs';
import { getSafeAddress } from '@/service/db';
import truncateEthAddress from 'truncate-eth-address';

const WalletManagement: React.FC = () => {
  const {language} = useLanguage();
  const {user} = useUser();
  const [safe, setSafe] = useState('');
  const syncSafe = async () => {
    if (!user) return;
    const safe = await getSafeAddress(user.id)
    if (safe && safe.length > 0) {
      setSafe(safe);
    } else {
      setSafe('');
    }
  }
  useEffect(() => {
    if (user) {
      syncSafe();
    }
  }, [user])
  const hasSafe = safe.length > 0;
  return (
    <Box>
      <Stack direction={'column'} spacing={2} mb={2} >
        <Typography variant={'h5'}>{languageData[language].Profile.wallet_management}</Typography>
        <Divider />
        {hasSafe ? 
          <WalletButton address={safe} />: 
          <AccountButton />
        }
        
      </Stack>
    </Box>
  );
};

const WalletButton = ({ address }: { address: string }) => {
  const theme = useTheme();
  return (
    <a href={`https://app.safe.global/home?safe=matic:${address}`} color="inherit" target={'_blank'} >
      <Stack direction={'row'} alignItems={'center'} width={'100%'} display={'flex'} justifyContent={'center'} spacing={2}>
        <Box bgcolor={'#12ff80'} display={'flex'} borderRadius={4} justifyContent={'center'} alignItems={'center'}>
          <img src='/safe-logo.png' width={50} height={50} />
        </Box>

        <Box bgcolor={theme.palette.mode === 'dark' ? 'gray' : 'lightgray'} borderRadius={4} py={1} px={2}><Typography variant={'body1'}>{truncateEthAddress(address)}</Typography></Box>
      </Stack>
    </a>
  )
}

export default WalletManagement;