'use client';
import { useEthersSigner, walletClientToSigner } from '@/hooks/useEthersSigner';
import { LiFiWidget, ThemeConfig, useWallet } from '@lifi/widget';
import { useWalletInfo, useWeb3Modal } from '@web3modal/wagmi/react'
import { Box, CssBaseline, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import AccountButton from '@/components/accountButton';
import WalletNotConnected from '@/components/walletNotConnected';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';

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
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <main>
      {mounted && walletInfo && typeof window !== 'undefined' && (
        <LiFiWidget
          config={{
            languages: {
              default: process.env.NEXT_PUBLIC_TEST_ENV ? 'en' : 'es'
            },
            containerStyle: {
              border: `1px solid transparent`,
              borderRadius: '16px',
              overflow: 'hidden',
              maxHeight: '90vh'
            },
            fee: 0.00,
            tokens: {
              featured: [
                {
                  address: '0x924442a46eac25646b520da8d78218ae8ff437c2',
                  symbol: 'XUCRE',
                  decimals: 18,
                  chainId: 137,
                  name: 'Xucre',
                  logoURI: 'https://xucre-public.s3.sa-east-1.amazonaws.com/icon-green.png',
                },
              ],
            }
          }}
          theme={themeConfig}
          integrator={'xucre-wallet'}
          variant={matches ? 'expandable' : 'default'}
          subvariant='split'
          walletManagement={{
            signer: signer,
            connect: async () => {
              if (client) {
                return walletClientToSigner(client);
              } else {
                throw Error(`${languageData[language].Toast.error_pair}`);
              }
            },
            disconnect: async () => {
              disconnect();
            },
          }}
          hiddenUI={['walletMenu']}
        />
      )}
      {!walletInfo &&
        <WalletNotConnected />
      }
    </main>
  );
}
