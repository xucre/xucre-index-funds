'use client'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './globals.css';
import Header from './header';
import { Box, CssBaseline, Stack } from '@mui/material';

import CTA from '@/components/ui/cta';
import { Suspense, useEffect } from 'react';
import { ThemeSwitcherProvider } from '@/hooks/useThemeSwitcher';
import { LanguageContextProvider } from '@/hooks/useLanguage';
import Footer from './footer';
import { MixpanelProvider } from '@/hooks/useMixpanel';
import AppMenu from '@/components/ui/AppMenu';
import { SignedIn } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
//import { TokenListProvider } from '@/hooks/useTokenList';

export default function Wrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideLoginButton = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/verify-email' || pathname.includes('/index-fund')
  
  useEffect(() => {
    console.log('Wrapper-hideLoginButton');
  }, [hideLoginButton]);
  return (
    <Box>
      <MixpanelProvider>
        <ThemeSwitcherProvider>
            <Suspense >
              <CssBaseline enableColorScheme />
              
                <Header />
                <Stack direction={'column'} justifyContent={'space-between'} minHeight={'full'}>
                  <Stack spacing={2} direction="row" width={'full'} alignItems={'top'}>
                    <SignedIn>
                      {!hideLoginButton && 
                        <Box minWidth={200}>
                          <AppMenu />
                        </Box>
                      }
                      
                    </SignedIn>
                    <Box flexGrow={1}>
                      {children}
                    </Box>
                  </Stack>              
                  {/* <CTA type={'main'} /> */}
                </Stack>

                {/* <Footer /> */}
            </Suspense>
        </ThemeSwitcherProvider>
      </MixpanelProvider>
    </Box>
  );
}

