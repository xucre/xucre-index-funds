'use client';
import { useEthersSigner, walletClientToSigner } from '@/hooks/useEthersSigner';
import { useWalletInfo, useWeb3Modal } from '@web3modal/wagmi/react'
import { Box, CssBaseline, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import AccountButton from '@/components/accountButton';
import WalletNotConnected from '@/components/walletNotConnected';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const signer = useEthersSigner();
  const client = useWalletClient();
  const { language } = useLanguage();
  const { open, close } = useWeb3Modal()
  const { isConnected, address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { walletInfo } = useWalletInfo();
  const [mounted, setMounted] = useState(false);
  /*useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading]);*/

  return (
    <main>
      {!isConnected &&
        <WalletNotConnected />
      }
    </main>
  );
}
