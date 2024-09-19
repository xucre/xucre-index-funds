'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { useTheme } from "@mui/material";
import { Box, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import languageData from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function Default() {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isConnected, address, chainId } = useAccount();

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Default Page View');
    }
  }, [mixpanel])

  if (isLocked) {
    return <Campfire setIsLocked={setIsLocked} />;
  }

  if (!isConnected) return <WalletNotConnected />;
  //if (!isSubscribed) return <Campfire setIsLocked={() => { }} />;
  if (!chainValidation(chainId)) return <WalletNotConnected />;
  return (
    <Box pb={4}>
      <Stack justifyContent={'center'} alignItems={'center'}>
        {/*<Typography variant={'h6'} color={textColor}>{languageData[language].ui.index_fund_title}</Typography>*/}
      </Stack>

    </Box>
  );
};