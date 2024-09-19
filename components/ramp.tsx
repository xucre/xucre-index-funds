'use client';
import { useEthersSigner, walletClientToSigner } from '@/hooks/useEthersSigner';
import { LiFiWidget, ThemeConfig, useWallet } from '@lifi/widget';
import { Box, CssBaseline, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { use, useEffect, useState } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import AccountButton from './accountButton';
import { GateFiDisplayModeEnum, GateFiLangEnum, GateFiSDK } from '@gatefi/js-sdk';
import { useSearchParams } from 'next/navigation';
import WalletNotConnected from './walletNotConnected';
import Unlimit from './unlimit';
import { useMixpanel } from '@/hooks/useMixpanel';

export default function Ramp() {
  const theme = useTheme();
  const mixpanel = useMixpanel();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const externalAddress = searchParams.get('address');
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const hasExternalAddress = externalAddress && externalAddress.length > 0;
  const finalAddress = hasExternalAddress ? externalAddress : address;
  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Ramp Page View');
    }
  }, [mixpanel]);
  if (!address && !isConnected && !hasExternalAddress) return <WalletNotConnected />;
  return (
    <main>
      {
        <Unlimit finalAddress={finalAddress} />
      }
    </main>
  );
}
