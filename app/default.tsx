'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import { useLanguage } from "@/hooks/useLanguage";
import { chainValidation } from "@/service/helpers";
import { globalChainId } from "@/service/constants";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function Default() {
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isConnected, address, chainId } = useAccount();

  if (isLocked) {
    return <Campfire setIsLocked={setIsLocked} />;
  }
  return (
    <Box pb={4}>
      <Stack justifyContent={'center'} alignItems={'center'}>
        {/*<Typography variant={'h6'} color={textColor}>{languageData[language].ui.index_fund_title}</Typography>*/}
      </Stack>

    </Box>
  );
};