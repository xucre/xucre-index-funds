'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import EmptyComponent from '@/components/ui/EmptyComponent';

const IncompleteOnboarding = ({ onNavigateToWallet }) => {
  const {language} = useLanguage();
  const { address, isConnected } = useAccount();
  return (
    <EmptyComponent executeCode={onNavigateToWallet} header={languageData[language].Onboarding.empty_onboarding} description={languageData[language].Onboarding.empty_onboarding_description} buttonText={languageData[language].Onboarding.empty_onboarding_button} />
  );
};

export default IncompleteOnboarding;
