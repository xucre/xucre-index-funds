'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import EmptyComponent from '@/components/ui/EmptyComponent';

const EmptyProfileState = ({ onCreateProfile }) => {
  const {language}= useLanguage();
  return (
    <EmptyComponent executeCode={onCreateProfile} header={languageData[language as Language].Onboarding.empty_profile} description={languageData[language as Language].Onboarding.empty_profile_description} buttonText={languageData[language as Language].Onboarding.create_profile} />
  );
};

export default EmptyProfileState;
