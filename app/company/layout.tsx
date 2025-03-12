'use client'
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
import OrganizationDashboardNavigation from "@/components/dashboard/OrganizationDashboardNavigation";
import EmptyEscrowWallet from "@/components/onboarding/EmptyEscrowWallet";
import EmptySelfSafeWallet from "@/components/onboarding/EmptySelfSafeWallet";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";
import { useLanguage } from "@/hooks/useLanguage";
import { useOrganizationWallet } from "@/hooks/useOrganizationWallet";
import { Box, Skeleton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const {language, languageData} = useLanguage();
  const [mounted, setMounted] = useState(false);
  const { organization, isLoaded } = useClerkOrganization();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const router = useRouter();

  const { escrowAddress, selfAddress, loading, createSelfAddress, refresh } = useOrganizationWallet();
  const hasAccessToCorp = organization && organization.id && organization.publicMetadata['manualBilling'] === true;
  useEffect(() => {
    if (organization && organization.id) {
      refresh();
      setMounted(true);
    }
  }, [organization]);

  if (!isLoaded) return (
    <Box width={'full'} px={5} py={4}>
      <Skeleton variant={'rounded'} width="100%" height={200} />
    </Box>
  )

  if (!hasAccessToCorp) {
    return (
      <Box width={'full'} my={5} mx={4}>
        <OpaqueCard sx={{p: 4}}>
          <Typography variant="h6" textAlign={'center'}>{languageData[language].CompanyDashboard.no_corporate_dashboard_access}</Typography>
        </OpaqueCard>
      </Box>
    )
  }
  
  if (!organization) {
    return (
      <Box width={'full'} px={5} py={4} my={5} mx={4}>
        <OpaqueCard>
          <Typography variant="h6">{languageData[language].CompanyDashboard.no_organization_found}</Typography>
        </OpaqueCard>
      </Box>
    )
  }

  if (!selfAddress) {
      return (
        <Box width={'full'} px={5} py={4} my={5} mx={4}>
          <EmptySelfSafeWallet onCreateSafe={createSelfAddress} />
        </Box>        
      );
    }

  return (
    <Suspense>
      <Box width={'full'} px={5} py={4}>
        <Stack direction={matches ? 'row' : 'column'} spacing={8} justifyContent={'space-between'} px={5}>
          <Stack direction={'column'} spacing={2} flexGrow={2}>
            <OrganizationDashboardNavigation />
            {children}
          </Stack>
          <Box minWidth={'20vw'}></Box>
          {/* <DashboardNews /> */}
        </Stack>
      </Box>
    </Suspense>
  );
};

export const dynamic = "force-dynamic"