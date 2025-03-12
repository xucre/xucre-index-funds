'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import EmptyComponent from '@/components/ui/EmptyComponent';

const EmptySelfSafeWallet = ({ onCreateSafe }) => {
  const {language} = useLanguage();
  const { address, isConnected } = useAccount();
  return (
    <EmptyComponent executeCode={onCreateSafe} header={languageData[language].Onboarding.empty_corp_safe} description={languageData[language].Onboarding.empty_corp_safe_description} buttonText={languageData[language].Onboarding.create_corp_safe} />
  );
};

export default EmptySelfSafeWallet;
