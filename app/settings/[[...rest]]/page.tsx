'use client'
import { SignOutButton, UserProfile } from "@clerk/nextjs";
import { Box, Divider, Stack, Typography, useTheme } from "@mui/material"
import LinkIcon from '@mui/icons-material/Link';
import { Suspense } from "react";
import { dark } from "@clerk/themes";
import WalletManagement from "@/components/settings/WalletManagement";
import { ThemeSwitcherElement } from "@/hooks/useThemeSwitcher";
import LanguageSelect from "@/components/ui/languageSelect";
import SocialIcons from "@/components/ui/socialIcons";
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';

// components/LoadingIndicator.tsx
export default function Settings() {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';
  const Social = () => (
    <SocialIcons discordUrl={'https://discord.gg/F4gaehZ7'} emailUrl={'mailto:support@xucre.io'} twitterUrl={'https://x.com/WalletXucre'} githubUrl={null} instagramUrl={null} governanceUrl={null} websiteUrl={'https://linktr.ee/xucrewallet'} gitbookUrl={null} />
  );
  return (
    <Suspense>
      <Box alignItems={'center'} display={'flex'} justifyContent={'center'} width={'full'} mx={5} my={1} pb={10}>
        {
          <UserProfile
            appearance={{ baseTheme: isDarkTheme ? dark : undefined, }}
          >
            <UserProfile.Page label="Web3" labelIcon={<LinkIcon fontSize="small" />} url="web3">
              <WalletManagement />
            </UserProfile.Page>
            <UserProfile.Page label="Display" labelIcon={<DisplaySettingsIcon fontSize="small" />} url="display">
              <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={2} width={'100%'} justifyContent={'space-between'} >
                  <Typography variant={'h6'}>Theme</Typography>
                  <ThemeSwitcherElement />
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} width={'100%'} justifyContent={'space-between'} >
                  <Typography variant={'h6'}>Language</Typography>
                  <LanguageSelect type={'menu'} />
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} width={'100%'} justifyContent={'space-between'} >
                  <Typography variant={'h6'}>Social</Typography>
                  <Social />
                </Stack>
              </Stack>
            </UserProfile.Page>
            {/* <UserProfile.Page label="Logout" labelIcon={<LinkIcon fontSize="small" />} url="logout">
              <SignOutButton />
            </UserProfile.Page> */}

          </UserProfile>
        }
      </Box>
    </Suspense>
  );
};