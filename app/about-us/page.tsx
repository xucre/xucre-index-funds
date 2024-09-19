'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Box, Stack, Typography, Accordion, AccordionSummary, Divider, List, ListItem, useTheme, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('FAQ Page View');
    }
  }, [mixpanel])


  return (
    <Box p={4} pb={10}>
      <Stack justifyContent={'start'} alignItems={'center'} spacing={2}>
        <Typography variant={'h6'} color={textColor}>{languageData[language].FAQPage.title}</Typography>
        <Typography variant={'body1'} color={textColor}>{languageData[language].FAQPage.header1}</Typography>
        <List>
          {languageData[language].FAQPage.headerList1.map((item, index) => {
            return <ListItem key={index} color={textColor}>{item}</ListItem>
          })}
        </List>
        <Typography variant={'body1'} color={textColor}>{languageData[language].FAQPage.headerSecondary}</Typography>
        <Divider sx={{ my: 3 }} color={textColor} />
        <Typography variant={'h6'} color={textColor}>{languageData[language].FAQPage.title2}</Typography>
        {
          languageData[language].FAQPage.qAndA.map((item, index) => {
            return <Accordion key={item.question}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >{item.question}</AccordionSummary>
              <AccordionDetails>{item.answer}</AccordionDetails>
            </Accordion>
          })
        }
        <Typography variant={'body1'} color={textColor}>{languageData[language].FAQPage.closing}</Typography>
      </Stack>

    </Box>
  );
};