'use client'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './globals.css';
import Header from './header';
import { Box, CssBaseline } from '@mui/material';

import CTA from '@/components/ui/cta';
import { Suspense } from 'react';
import { ThemeSwitcherProvider } from '@/hooks/useThemeSwitcher';
import { LanguageContextProvider } from '@/hooks/useLanguage';
import Footer from './footer';
import { MixpanelProvider } from '@/hooks/useMixpanel';
//import { TokenListProvider } from '@/hooks/useTokenList';

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
            <Suspense >
              <CssBaseline enableColorScheme />
              <Header />
              {children}
              <CTA type={'main'} />
              <Footer />
            </Suspense>
          </LanguageContextProvider>
        </ThemeSwitcherProvider>
      </MixpanelProvider>
    </Box>
  );
}

