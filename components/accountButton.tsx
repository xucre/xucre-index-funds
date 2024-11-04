'use client'
import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useAppKit } from '@reown/appkit/react'
import { Button } from '@mui/material';
import { useAccount } from 'wagmi';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';

const AccountButton = ({ showBalance = true }) => {
  const {language} = useLanguage();
  const [showButton, setShowButton] = useState(false);
  const { isConnected } = useAccount();
  const { open, close } = useAppKit();
  useEffect(() => {
    if (showButton) {
      open();
    } else {
      close();
    }
  }, [showButton]);
  return (
    <Box>
      {/* <w3m-button balance={showBalance ? 'show' : 'hide'} /> */}
      <Button variant={'contained'} color={'primary'} onClick={() => setShowButton(!showButton)} sx={{borderRadius: 25}}>{!isConnected? languageData[language].Settings.connect_wallet : languageData[language].Settings.view_wallet}</Button>
    </Box>
  )
}

export default AccountButton;

