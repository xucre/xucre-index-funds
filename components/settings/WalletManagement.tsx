'use client'
import React from 'react';
import AccountButton from '../accountButton';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';

const WalletManagement: React.FC = () => {
  const {language} = useLanguage();
  return (
    <Box>
      <Stack direction={'column'} spacing={2} mb={2} >
        <Typography variant={'h5'}>{languageData[language].Profile.wallet_management}</Typography>
        <Divider />
        <AccountButton />
      </Stack>
    </Box>
  );
};

export default WalletManagement;