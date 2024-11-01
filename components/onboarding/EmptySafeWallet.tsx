'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';

const EmptySafeWallet = ({ onCreateSafe }) => {
  const {language} = useLanguage();
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
      <AccountCircleIcon color="action" fontSize="large" />
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        {languageData[language as Language].Onboarding.empty_safe}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {languageData[language as Language].Onboarding.empty_safe_description}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={onCreateSafe}
      >
        {languageData[language as Language].Onboarding.create_safe}
      </Button>
    </Box>
  );
};

export default EmptySafeWallet;
