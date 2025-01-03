'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
import { globalChainId } from "@/service/constants";
import PrivacyPolicy from "@/components/support/PrivacyPolicy";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function Privacy() {
  const mixpanel = useMixpanel();
  const theme = useTheme();

  return (
    <Box alignItems={'center'} display={'flex'} justifyContent={'center'} width={'full'} mx={5} my={1} pb={10}>
      <PrivacyPolicy />
    </Box>
  )
};