'use client'
import { SignOutButton, UserProfile } from "@clerk/nextjs";
import { Box, useTheme } from "@mui/material"
import LinkIcon from '@mui/icons-material/Link';
import { Suspense } from "react";
import { dark } from "@clerk/themes";
import WalletManagement from "@/components/settings/WalletManagement";

// components/LoadingIndicator.tsx
export default function Settings() {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';

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
            {/* <UserProfile.Page label="Logout" labelIcon={<LinkIcon fontSize="small" />} url="logout">
              <SignOutButton />
            </UserProfile.Page> */}

          </UserProfile>
        }
      </Box>
    </Suspense>
  );
};