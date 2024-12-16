'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { TextareaAutosize, useTheme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation, normalizeDevChains } from "@/service/helpers";
import UniswapPoolChecker from "@/components/uniswap/poolChecker";
import { useSnackbar } from "notistack";
import IndexFundForm from "@/components/uniswap/indexFundForm";
import { IndexFund } from "@/service/types";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function IndexBuilder() {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const { isConnected, address, chainId } = useAccount();

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Index Builder View');
    }
  }, [mixpanel])

  //if (!isConnected) return <WalletNotConnected />;
  //if (!isSubscribed) return <Campfire setIsLocked={() => { }} />;
  //if (!chainValidation(chainId)) return <WalletNotConnected />;
  
  return (
    <IndexFundForm id={null} />
  )

};