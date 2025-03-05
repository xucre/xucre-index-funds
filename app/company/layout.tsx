'use client'
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardNews from "@/components/dashboard/DashboardNews";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";
import { Box, Skeleton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useAccount } from "wagmi";

export default function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const { organization, isLoaded } = useClerkOrganization();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const router = useRouter();

  if (!isLoaded) return (
    <Box width={'full'} px={5} py={4}>
      <Skeleton variant={'rounded'} width="100%" height={200} />
    </Box>
  )
  
  if (!organization) {
    return (
      <Box width={'full'} px={5} py={4}>
        <OpaqueCard>
          <Typography variant="h6">Please select an organization to view the dashboard</Typography>
        </OpaqueCard>
      </Box>
    )
  }

  return (
    <Suspense>
      <Box width={'full'} px={5} py={4}>
        <OpaqueCard sx={{p: 2, mb: 4}}>
          <Typography variant="h5">{organization.name} Dashboard</Typography>
          <Typography variant="subtitle1">Organization-level wallet and portfolio information</Typography>
        </OpaqueCard>

        <Stack direction={matches ? 'row' : 'column'} spacing={8} justifyContent={'space-between'} px={5}>
          <Stack direction={'column'} spacing={2} flexGrow={2}>
            <DashboardNavigation />
            {children}
          </Stack>
          <DashboardNews />
        </Stack>
      </Box>
    </Suspense>
  );
};

export const dynamic = "force-dynamic"