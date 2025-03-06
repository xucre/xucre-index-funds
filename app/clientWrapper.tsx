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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';

export default function Wrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const {user} = useClerkUser();
  const pathname = usePathname();
  const hasUser = user !== null;
  const hideMenu = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/verify-email' || pathname === '/privacy' || pathname === '/onboarding' || pathname.includes('indexes')
  const hideHeaderAndFooter = pathname.includes('indexes')
  return (
    <Box>
       <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'es'}>
          <MixpanelProvider>
            <ThemeSwitcherProvider>
              <CssBaseline enableColorScheme />
              <Stack direction={'column'} justifyContent={'space-between'} minHeight={'100dvh'}>
                <Stack direction={'column'} justifyContent={'flex-start'}>
                  {!hideHeaderAndFooter && <Header />}
                  <Stack direction={'column'} justifyContent={'start'}>
                    <Stack spacing={2} direction="row" width={'full'} alignItems={'top'}>
                      <SignedIn>
                        {!hideMenu &&                         
                          <Box minWidth={200} sx={{ display: { md: 'block', xs: 'none' } }}>
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
                  {!hideHeaderAndFooter && <Footer /> }
                  <PrivacyFooterPopup />
                </Stack>
              </Stack>
            </ThemeSwitcherProvider>
          </MixpanelProvider>
        </LocalizationProvider>
    </Box>
  );
}

