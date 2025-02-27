'use client'
import DashboardBalanceList from "@/components/dashboard/DashboardBalanceList";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";
import { useOrganizationWallet } from "@/hooks/useOrganizationWallet";
import { Box, useTheme } from "@mui/material"
import { useEffect } from "react";

export default function OrganizationBalances() {
  const theme = useTheme();
  const { organization } = useClerkOrganization();
  const { escrowAddress, selfAddress, refresh } = useOrganizationWallet();

  useEffect(() => {
    if (organization && organization.id) {
      refresh();
    }
  }, [organization]);

  // Choose which wallet to display (escrow is preferred if available)
  const walletToDisplay = escrowAddress || selfAddress;

  if (!walletToDisplay) return null;
  
  return (
    <DashboardBalanceList address={walletToDisplay} />
  );
};

export const dynamic = "force-dynamic"