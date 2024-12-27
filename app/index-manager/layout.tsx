'use client'
import IndexManagerList from "@/components/admin/IndexManagerList";
import DashboardNews from "@/components/dashboard/DashboardNews";
import { useClerkUser } from "@/hooks/useClerkUser";
import { getDashboardBorderColor } from "@/service/helpers";
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
  const { user } = useClerkUser();
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