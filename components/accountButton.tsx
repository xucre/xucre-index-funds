'use client'
import React, { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useTheme } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';

const AccountButton = ({ }) => {
  const searchParams = useSearchParams();
  const wallet = searchParams.get('wallet');
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { open } = useWeb3Modal()
  const componentIsMounted = useRef(true);

  return (
    <Box>
      {<w3m-button balance='hide' />}
    </Box>
  )
}

export default AccountButton;

