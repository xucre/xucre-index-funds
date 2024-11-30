'use client'
import IndexManagerList from "@/components/admin/IndexManagerList";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
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
import { Box, Divider, Stack, useMediaQuery, useTheme } from "@mui/material"
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
//import '@covalenthq/goldrush-kit/styles.css'

const NewsBlock = () => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <Stack direction={'column'} spacing={2} px={2} maxWidth={!matches ? '100%' : '35%'}>
      <DashboardNews />
    </Stack>
  )
}

// components/LoadingIndicator.tsx
export default function IndexManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isSignedUp = false;
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  //const signer = useWalletClient({ chainId })
  const router = useRouter();
  const params = useParams();
  const invoiceId = params['id'] as string;
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  return (
    <Suspense>
        <Stack direction={'column'} spacing={2} justifyContent={'space-between'} px={5} py={4} >
            <IndexManagerList />
            <Divider orientation={'horizontal'} flexItem />
            <Stack direction={'column'} spacing={2} flexGrow={2}>
              {/* <DashboardNavigation /> */}
              {children}
            </Stack>
        </Stack>          
    </Suspense>
  );
};