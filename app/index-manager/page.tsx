'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Typography, useTheme } from "@mui/material";
import { Box, Stack, Button } from "@mui/material"
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import languageData, { Language } from '@/metadata/translations';
import { setFundDetails } from "@/service/db";
import { v4 as uuidv4 } from 'uuid';
import { IndexFund } from "@/service/types";
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

  const createNewFund = async () => {
    const newFundId = uuidv4();
    const placeholderFund: IndexFund = {
        id: newFundId,
        name: { 0: 'New Fund', 1: '', 2: '' },
        cardSubtitle: { 0: 'New Fund', 1: '', 2: '' },
        description: { 0: 'New Fund', 1: '', 2: '' },
        image: '',
        imageSmall: '',
        color: '',
        chainId: 0,
        custom: undefined,
        sourceToken: undefined,
        portfolio: []
    };
    await setFundDetails(137, newFundId, placeholderFund);
  };

  return (
    <Box pb={4}>
      <Stack justifyContent={'center'} alignItems={'center'}>
        <EmptyFundDetailState onCreateData={createNewFund} />
      </Stack>

    </Box>
  );
};