'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import AccountButton from '../accountButton';

const TransferEscrowWallet = ({ onTransferSafe }) => {
  const {language} = useLanguage();
  const { address, isConnected } = useAccount();
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
        {languageData[language].Onboarding.transfer_escrow}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {languageData[language].Onboarding.transfer_escrow_description}
      </Typography>
      {isConnected && 
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={onTransferSafe}
        >
          {languageData[language].Onboarding.transfer_escrow_button}
        </Button>  
      } 
      {
        !isConnected &&
        <AccountButton />
      }
      
    </Box>
  );
};

export default TransferEscrowWallet;
