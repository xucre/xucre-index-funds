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
import { SignIn } from "@clerk/clerk-react";
import {dark, shadesOfPurple} from '@clerk/themes';
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function SignInComponent() {
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
    <Box py={3} pb={8}>
      <Stack direction={'column'} spacing={4} alignItems={'center'} justifyContent={'center'}>
        <SignIn appearance={{
          baseTheme: theme.palette.mode === 'dark' ? dark : shadesOfPurple,
        }}/>
        
      </Stack>      
    </Box>
  );
};