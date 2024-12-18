'use client'
import React, { useEffect, useState } from 'react';
import AccountButton from '../accountButton';
import { Box, Chip, Divider, Link, Stack, Typography, useTheme } from '@mui/material';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useSFDC } from '@/hooks/useSFDC';
import { useUser } from '@clerk/nextjs';
import { getSafeAddress } from '@/service/db';
import truncateEthAddress from 'truncate-eth-address';
import QRCode from 'qrcode'
const WalletQRCode = ({safeAddress}: {safeAddress: string}) => {
  
  const generateQRCode = async () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    await QRCode.toCanvas(canvas, safeAddress, { errorCorrectionLevel: 'H', scale: 5 });
    
  }
  
  useEffect(() => {
    if (safeAddress) {
      generateQRCode();
    }
  }, [safeAddress])

  return (
    <canvas id={'qr-code'}></canvas>
  )
};



export default WalletQRCode;