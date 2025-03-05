'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { useTheme } from "@mui/material";
import { Box, Grid2 as Grid, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useIndexFunds } from "@/hooks/useIndexFunds";
import CustomCard from "@/components/ui/customCard";
import WalletNotConnected from "@/components/walletNotConnected";
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";
import { normalizeDevChains } from '../../service/helpers';
import { IndexFund } from "@/service/types";
import { setFundDetails } from "@/service/db";
import { useSFDC } from "@/hooks/useSFDC";
import FundHeader from "@/components/fund/FundSelector";

// components/LoadingIndicator.tsx
export default function IndexFunds() {

  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { sfdcUser, isLoaded } = useSFDC();


  useEffect(() => {
    if (sfdcUser && sfdcUser.riskTolerance) { // if selectedFund is not null      
      router.push(`/fund/${sfdcUser.riskTolerance}`);
    } else {
      router.push(`/fund/Moderate`);
    }
  }, [sfdcUser])


  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Index Fund Page View');
    }
  }, [mixpanel])

  return <></>;
};

export const dynamic = "force-dynamic"