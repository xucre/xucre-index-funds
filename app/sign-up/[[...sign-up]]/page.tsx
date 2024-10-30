'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";

//import * as Clerk from '@clerk/elements/common'
//import * as SignUp from '@clerk/elements/sign-up'
import { SignUp } from "@clerk/clerk-react";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";
import { toTitleCase } from '../../../service/helpers';
import { dark, shadesOfPurple } from "@clerk/themes";

export default function SignUpPage() {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isConnected, address, chainId } = useAccount();

  useEffect(() => {
    if (mixpanel) {
      //mixpanel.track('Default Page View');
    }
  }, [mixpanel])

  return (
    <Suspense>
    <Box py={3} pb={8}>
      <Stack direction={'column'} spacing={4} alignItems={'center'} justifyContent={'center'}>
        {<SignUp appearance={{
          baseTheme: theme.palette.mode === 'dark' ? dark : shadesOfPurple,
        }} /> }
      </Stack>
    </Box>
    </Suspense>
  );
};