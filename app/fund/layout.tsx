'use client'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
import FundHeader from "@/components/fund/FundHeader";
import EmptyProfileState from "@/components/onboarding/EmptyProfile";
import EmptySafeWallet from "@/components/onboarding/EmptySafeWallet";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { useSFDC } from "@/hooks/useSFDC";
import { isDev } from "@/service/constants";
import { getSafeAddress, setSafeAddress } from "@/service/db";
import { getDashboardBorderColor } from "@/service/helpers";
import { createAccount, CreateAccountOptions, createAccountSelfSign } from "@/service/safe";
import { updateSafeWalletDetails } from "@/service/sfdc";
import { useUser } from "@clerk/nextjs";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material"
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function FundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Suspense>
      <Box width={'full'} px={5} py={4}>
        <Stack direction={'column'} spacing={2} flexGrow={2}>
            <FundHeader />
            {children}
        </Stack>           
      </Box>
    </Suspense>
  );
};