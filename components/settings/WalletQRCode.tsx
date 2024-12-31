'use client'
import React, { useEffect, useState } from 'react';
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