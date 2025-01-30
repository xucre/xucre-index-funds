'use client';
import AccountButton from '@/components/accountButton';
import LanguageSelect from '@/components/ui/languageSelect';
import SettingsButton from '@/components/ui/settingsButton';
import SocialIcons from '@/components/ui/socialIcons';
import { useLanguage } from '@/hooks/useLanguage';
import { ThemeSwitcherElement } from '@/hooks/useThemeSwitcher';
import { AppBar, Box, Link, Toolbar, Typography } from '@mui/material';

import { usePathname, useSearchParams } from 'next/navigation';


export default function Footer() {
  const { language, languageData } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams()
  const color = searchParams.get('color');
  const Social = () => (
    <SocialIcons discordUrl={'https://discord.gg/F4gaehZ7'} emailUrl={'mailto:support@xucre.io'} twitterUrl={'https://x.com/WalletXucre'} githubUrl={null} instagramUrl={null} governanceUrl={null} websiteUrl={'https://linktr.ee/xucrewallet'} gitbookUrl={null} />
  );
  const isHome = pathname === '/';
  const hideWalletConnectButton = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/verify-email'
  
  return (
    <AppBar position={'relative'} color={'transparent'} sx={{ /*mt:4, top: 'auto', bottom: 0, display: { xs: 'block', md: 'block' },*/ boxShadow: 'none' }}>
      <Toolbar>
        {/* <SignedIn><SettingsButton /></SignedIn> */}
        {/* {!hideWalletConnectButton && false && 
          <SignedOut>
            <AccountButton />
          </SignedOut>
        } */}
        
        <ThemeSwitcherElement />
        <LanguageSelect type={'menu'} />
        <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          2025 Xucre Technologies, Inc. · 
          <Link href="/privacy" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {languageData[language].termsConditions.title}
          </Link>
          </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Social />
      </Toolbar>
    </AppBar>
  );
}

