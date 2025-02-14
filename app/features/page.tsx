'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Typography, useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import { useLanguage } from "@/hooks/useLanguage";
import { chainValidation } from "@/service/helpers";
import { globalChainId } from "@/service/constants";
import { useIsAdmin } from "@/hooks/useIsAdmin";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function Feature() {
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isSuperAdmin } = useIsAdmin();

  useEffect(() => {
    if (isSuperAdmin) {
      setIsLocked(false);
    }
  }, [isSuperAdmin]);

  if (isLocked) {
    return <Campfire setIsLocked={setIsLocked} />;
  }
  return (
    <Box pb={4}>
      <Stack justifyContent={'center'} alignItems={'center'}>
        {<Typography variant={'h6'} color={textColor}>{'In dev Features'}</Typography>}
      </Stack>

    </Box>
  );
};