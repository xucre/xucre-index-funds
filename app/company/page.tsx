'use client'
import { useClerkOrganization } from "@/hooks/useClerkOrganization";
import { useOrganizationWallet } from "@/hooks/useOrganizationWallet";
import { Box, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import OpaqueCard from "@/components/ui/OpaqueCard";
import OrganizationDashboardContainer from "@/components/dashboard/OrganizationDashboardContainer";

// Organization Dashboard Page
export default function OrganizationDashboard() {
  const theme = useTheme();
  const { address, chainId } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { organization, isLoaded } = useClerkOrganization();
  const { escrowAddress, selfAddress, loading, refresh } = useOrganizationWallet();

  useEffect(() => {
    if (organization && organization.id) {
      refresh();
      setMounted(true);
    }
  }, [organization]);

  // If organization wallet is not yet loaded, show a loading message
  if (!mounted || loading || !isLoaded) {
    return (
      <OpaqueCard>
        <Typography variant="h6">Loading organization wallet...</Typography>
      </OpaqueCard>
    );
  }

  // If no organization wallet exists, show a message
  

  // Choose which wallet to display (escrow is preferred if available)
  const walletToDisplay = selfAddress;
  return (
    <OrganizationDashboardContainer address={walletToDisplay as string} />
  );
};

export const dynamic = "force-dynamic"