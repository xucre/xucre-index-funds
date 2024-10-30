'use client';
import AccountButton from '@/components/accountButton';
import LanguageSelect from '@/components/ui/languageSelect';
import SettingsButton from '@/components/ui/settingsButton';
import SocialIcons from '@/components/ui/socialIcons';
import { ThemeSwitcherElement } from '@/hooks/useThemeSwitcher';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { AppBar, Box, Toolbar } from '@mui/material';

import { usePathname, useSearchParams } from 'next/navigation';


export default function Footer() {
  const pathname = usePathname();
  const searchParams = useSearchParams()
  const color = searchParams.get('color');
  const Social = () => (
    <SocialIcons discordUrl={'https://discord.gg/F4gaehZ7'} emailUrl={'mailto:support@xucre.io'} twitterUrl={'https://x.com/WalletXucre'} githubUrl={null} instagramUrl={null} governanceUrl={null} websiteUrl={'https://linktr.ee/xucrewallet'} gitbookUrl={null} />
  );
  const isHome = pathname === '/';
  const hideWalletConnectButton = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/verify-email'
  
  return (
    <AppBar position="fixed" color={'default'} sx={{ top: 'auto', bottom: 0, display: { xs: 'none', md: 'block' } }}>
      <Toolbar>
        <SignedIn><SettingsButton /></SignedIn>
        {!hideWalletConnectButton && 
          <SignedOut>
            <AccountButton />
          </SignedOut>
        }
        
        <ThemeSwitcherElement />
        <LanguageSelect type={'menu'} />
        <Box sx={{ flexGrow: 1 }} />
        <Social />
      </Toolbar>
    </AppBar>
  );
}

