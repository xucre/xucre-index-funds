'use client'
import HorizontalLinearStepper from "@/components/onboarding/horizontalStepper";
import Step1Component from "@/components/onboarding/step1";
import { getTextColor } from "@/service/helpers";
import { OrganizationProfile, UserProfile, useUser } from "@clerk/nextjs";
import { Avatar, Box, CircularProgress, Grid, Stack, Typography, useTheme } from "@mui/material"
import LinkIcon from '@mui/icons-material/Link';
import { useSearchParams } from "next/navigation";
import router from "next/router";
import { Suspense, useEffect, useState } from "react";
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

          </UserProfile>
        }
      </Box>
    </Suspense>
  );
};