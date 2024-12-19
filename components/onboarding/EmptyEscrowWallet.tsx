'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import EmptyComponent from '@/components/ui/EmptyComponent';

const EmptyEscrowWallet = ({ onCreateSafe }) => {
  const {language} = useLanguage();
  const { address, isConnected } = useAccount();
  return (
    <EmptyComponent executeCode={onCreateSafe} header={languageData[language].Onboarding.empty_escrow} description={languageData[language].Onboarding.empty_escrow_description} buttonText={languageData[language].Onboarding.create_escrow} />
  );
};

export default EmptyEscrowWallet;
