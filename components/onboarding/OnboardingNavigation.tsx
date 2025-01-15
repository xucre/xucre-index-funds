'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import TonalityIcon from '@mui/icons-material/Tonality';
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
import { globalChainId } from "@/service/constants";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";



export default function OnboardigNavigation({step, setStep} : {step: number, setStep: (number) => void}) {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language, languageData } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isConnected, address, chainId } = useAccount();
  const navigationList = [
    {
      label: languageData[language].Onboarding.menu_0,
    },
    {
      label: languageData[language].Onboarding.menu_1,
    },
    {
      label: languageData[language].Onboarding.menu_2,
    },
    {
      label: languageData[language].Onboarding.menu_3,
    },
    {
      label: languageData[language].Onboarding.menu_4,
    },
    {
      label: languageData[language].Onboarding.menu_5,
    }
  ]

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Default Page View');
    }
  }, [mixpanel])

  return (
      <List sx={{minWidth: '20rem', pt:2}} >
        {
          navigationList.map((item, index) => (
            <ListItemButton key={index} onClick={() => setStep(index)} >
              <ListItemIcon>
                  {index < step ? <CheckCircleIcon /> : index === step ? <TonalityIcon /> : <CircleOutlinedIcon />}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
              />
            </ListItemButton>
          ))
        }
      </List>

  );
};