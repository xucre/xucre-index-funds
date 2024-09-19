'use client';
import { useEthersSigner, walletClientToSigner } from '@/hooks/useEthersSigner';
import { LiFiWidget, ThemeConfig, useWallet } from '@lifi/widget';
import { Box, CssBaseline, Fab, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import AccountButton from './accountButton';

import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useSearchParams } from 'next/navigation';
import WalletNotConnected from './walletNotConnected';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useMixpanel } from '@/hooks/useMixpanel';

export default function Widget() {
  const searchParams = useSearchParams()
  const wallet = searchParams.get('wallet');
  const theme = useTheme();
  const mixpanel = useMixpanel();
  const signer = useEthersSigner();
  const client = useWalletClient();
  const { language } = useLanguage();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Swap Page View');
    }
  }, [mixpanel]);

  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const themeConfig = {
    palette: {
      mode: theme.palette.mode,
      text: theme.palette.text
    }
  } as ThemeConfig;

  const defaultLanguage = language === Language.EN ? 'en' : language === Language.ES ? 'es' : language === Language.PT ? 'pt' : 'es';
  return (
    <main>
      {isConnected && !matches && wallet && wallet === 'xucre' &&
        <Fab size={'small'} sx={{ position: 'fixed', left: 20, top: 20 }} onClick={() => { disconnect() }} aria-label="disconnect">
          <ExitToAppIcon />
        </Fab>
      }
      {mounted && isConnected && typeof window !== 'undefined' && (
        <LiFiWidget
          config={{
            languages: {
              default: defaultLanguage
            },
            containerStyle: {
              border: `1px solid transparent`,
              borderRadius: '16px',
              overflow: 'hidden',
              //maxHeight: '90vh'
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
      {!isConnected &&
        <WalletNotConnected />
      }
    </main>
  );
  return (<div>Widget</div>);
}
