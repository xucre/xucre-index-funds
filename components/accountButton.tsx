'use client'
import React, {useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useAppKit } from '@reown/appkit/react'
import { Button } from '@mui/material';
import { useAccount } from 'wagmi';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import truncateEthAddress from 'truncate-eth-address';

const AccountButton = ({ showBalance = true }) => {
  const {language} = useLanguage();
  const [showButton, setShowButton] = useState(false);
  const { isConnected, address } = useAccount();
  const { open, close } = useAppKit();

  useMemo(() => {
    if (showButton) {
      //open();
    } else {
      //close();
    }
  }, [showButton, open, close]);

  const handleClick= () => {
    //setShowButton(!showButton);
    open();
  }
  return (
    <Box>
      {/* <w3m-button balance={showBalance ? 'show' : 'hide'} /> */}
      {isConnected ? 
        <Button variant={'contained'} color={'primary'} onClick={handleClick} sx={{borderRadius:2}}>{`${truncateEthAddress(address as string)}`}</Button> :
        <Button variant={'contained'} color={'primary'} onClick={handleClick} sx={{borderRadius: 25}}>{languageData[language].Settings.connect_wallet}</Button>
      }
      
    </Box>
  )
}

export default AccountButton;

