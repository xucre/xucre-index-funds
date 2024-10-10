'use client'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './globals.css';
import { headers } from 'next/headers'
import { config } from '@/config';
import Header from './header';
import { Avatar, Box, CssBaseline, Fab, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { ContextProvider } from '@/context'
import { mode, primaryColor } from '@/service/theme';
import { playStoreAddress } from '@/service/constants';
import CTA from '@/components/ui/cta';
import { Suspense } from 'react';
import { ThemeSwitcherProvider } from '@/hooks/useThemeSwitcher';
import { LanguageContextProvider } from '@/hooks/useLanguage';
import Footer from './footer';
import { MixpanelProvider } from '@/hooks/useMixpanel';
//import { TokenListProvider } from '@/hooks/useTokenList';
import { cookieToInitialState, useChainId } from 'wagmi';

export default function Wrapper({
  children
}: {
  children: React.ReactNode;
}) {
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

