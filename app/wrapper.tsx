'use client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './globals.css';
import Header from './header';
import { Avatar, Box, CssBaseline, Fab, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { ContextProvider } from '@/context'
import { mode, primaryColor } from '@/service/theme';
import { playStoreAddress } from '@/service/constants';
import CTA from '@/components/ui/cta';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { ThemeSwitcherProvider } from '@/hooks/useThemeSwitcher';
import { ThemeConfig } from '@lifi/widget';
import { Language } from '@mui/icons-material';
import { LanguageContextProvider } from '@/hooks/useLanguage';
import Footer from './footer';
import { MixpanelProvider } from '@/hooks/useMixpanel';
//import { TokenListProvider } from '@/hooks/useTokenList';
import { useChainId } from 'wagmi';

/*const ChildWrapper = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId();

  return (
    useMemo(() => {
      <TokenListProvider chainId={chainId}>
        {children}
      </TokenListProvider>
    }, [chainId])
  );
};*/

export default function Wrapper({
  children
}: {
  children: React.ReactNode;
}) {

  const darkTheme = createTheme({
    palette: {
      //mode: 'dark',
      mode: color ? color === 'light' ? 'light' : 'dark' : 'dark',
      primary: {
        main: primaryColor,
      },
      warning: {
        main: '#ffffff'
      },
      info: {
        main: '#000000'
      }
    },
  });

  return (
    <Box>
      <MixpanelProvider>
        <ThemeSwitcherProvider>
          <LanguageContextProvider>
            <ContextProvider >
              <Suspense >
                <CssBaseline />
                <Header />
                {children}
                <CTA type={'main'} />
                <Footer />
              </Suspense>
            </ContextProvider>
          </LanguageContextProvider>
        </ThemeSwitcherProvider>
      </MixpanelProvider>
    </Box>
  );
}

