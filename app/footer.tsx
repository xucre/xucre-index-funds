'use client';
import SocialIcons from '@/components/ui/socialIcons';
import { AppBar, Avatar, Box, CssBaseline, Fab, IconButton, Stack, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { useSearchParams } from 'next/navigation';


export default function Footer() {
  const searchParams = useSearchParams()
  const color = searchParams.get('color');
  const Social = () => (
    <SocialIcons discordUrl={'https://discord.gg/F4gaehZ7'} emailUrl={'mailto:support@xucre.io'} twitterUrl={'https://x.com/WalletXucre'} githubUrl={null} instagramUrl={null} governanceUrl={null} websiteUrl={'https://linktr.ee/xucrewallet'} gitbookUrl={null} />
  );
  return (
    <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0, display: { xs: 'none', md: 'block' } }}>
      <Toolbar>
        <></>
        <Box sx={{ flexGrow: 1 }} />
        <Social />
      </Toolbar>
    </AppBar>
  );
}

