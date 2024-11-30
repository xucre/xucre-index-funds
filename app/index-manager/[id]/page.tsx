'use client'
import { useParams, useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Typography, useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
import IndexFundForm from "@/components/uniswap/indexFundForm";
import EmptyFundDetailState from "@/components/admin/EmptyFundDetailState";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function IndexFundBase() {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isConnected, address, chainId } = useAccount();
  const params = useParams();
  const invoiceId = params['id'] as string;
  if (!invoiceId) return <EmptyFundDetailState onCreateData={() => {}} />;
  return (
    <Box pb={4}>
        {<Typography variant={'h6'} color={textColor}>{'Fund Editor'}</Typography>}
        <IndexFundForm id={invoiceId}/>
    </Box>
  );
};