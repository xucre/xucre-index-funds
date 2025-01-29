'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Box, Stack, Typography, Accordion, AccordionSummary, Divider, List, ListItem, useTheme, AccordionDetails, useMediaQuery } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect } from "react";
import languageData from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import OpaqueCard from "@/components/ui/OpaqueCard";
import SupportHeader from "@/components/support/SupportHeader";
import { useSFDC } from "@/hooks/useSFDC";
import CreateCase from "@/components/support/CreateCase";
import { useIndexedDB } from "@/hooks/useIndexedDB";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function AboutUs() {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const {sfdcUser} = useSFDC();
  const { language } = useLanguage();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('FAQ Page View');
    }
  }, [mixpanel])

  return (
    <Stack direction={matches ? 'row' : 'column'} spacing={4} justifyContent={'space-between'} px={5} pb={10}>
      <Stack direction={'column'} spacing={2} flexGrow={1}>
        <SupportHeader />
        <Stack justifyContent={'start'} alignItems={'center'} spacing={2}>
          {
            languageData[language].FAQPage.qAndA.map((item, index) => {
              return <Accordion key={item.question} sx={{ width: '100%', borderRadius:10, boxShadow: 'none','::before': {display: 'none'} }} slotProps={{heading: {sx:{boxShadow: 'none', '::before': {display: 'none'}}}}} square={true}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >{item.question}</AccordionSummary>
                <AccordionDetails sx={{mb:2}}>{item.answer}</AccordionDetails>
              </Accordion>
            })
          }
        </Stack>
      </Stack>
      <Box width={matches ? '100%' : '100%'}  flexGrow={2}>
        {sfdcUser && <CreateCase userName={sfdcUser.firstName} userEmail={sfdcUser.userEmail} />}
      </Box>
    </Stack>
  );
};

export const dynamic = "force-dynamic"