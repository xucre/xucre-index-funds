'use client'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "@knocklabs/react/dist/index.css";

import './globals.css';
import Header from './header';
import { Box, CssBaseline, Stack } from '@mui/material';

import CTA from '@/components/ui/cta';
import { ThemeSwitcherProvider } from '@/hooks/useThemeSwitcher';
import { LanguageContextProvider } from '@/hooks/useLanguage';
import Footer from './footer';
import { MixpanelProvider } from '@/hooks/useMixpanel';
import AppMenu from '@/components/ui/AppMenu';
import { SignedIn } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import {
  KnockProvider,
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
} from "@knocklabs/react";
import { useClerkUser } from '@/hooks/useClerkUser';
import PrivacyFooterPopup from '@/components/support/PrivacyFooterPopup';

export default function Wrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const {user} = useClerkUser();
  const pathname = usePathname();
  const hasUser = user !== null;
  const hideLoginButton = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/verify-email' || pathname === '/privacy' || ( !hasUser && pathname.includes('/fund'))
  
  return (
    <Box>
      
          <MixpanelProvider>
            <ThemeSwitcherProvider>
                  <CssBaseline enableColorScheme />
                  <Stack direction={'column'} justifyContent={'space-between'} minHeight={'100dvh'}>
                    <Stack direction={'column'} justifyContent={'flex-start'}>
                      <Header />
                      <Stack direction={'column'} justifyContent={'start'}>
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
                    </Stack>
                    <Stack direction={'column'}> 
                      { <Footer /> }
                      <PrivacyFooterPopup />
                    </Stack>
                  </Stack>
            </ThemeSwitcherProvider>
          </MixpanelProvider>
    </Box>
  );
}

