'use client'
import DashboardTransactionList from "@/components/dashboard/DashboardTransactionList";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";
import { useOrganizationWallet } from "@/hooks/useOrganizationWallet";
import { useWalletData } from "@/hooks/useWalletData";
import { Box, useTheme } from "@mui/material";
import { useEffect } from "react";

export default function OrganizationTransactions() {
  const theme = useTheme();
  const { organization } = useClerkOrganization();
  const { escrowAddress, selfAddress, refresh } = useOrganizationWallet();

  useEffect(() => {
    if (organization && organization.id) {
      refresh();
    }
  }, [organization]);

  // Choose which wallet to display (escrow is preferred if available)
  const walletToDisplay = selfAddress;

  if (!walletToDisplay) return null;
  
  const { transactions } = useWalletData({ address: walletToDisplay });
  
  return (
    <DashboardTransactionList address={walletToDisplay} transactions={transactions} truncate={false} />
  );
};

export const dynamic = "force-dynamic"