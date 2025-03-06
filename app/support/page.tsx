'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Box, Stack, Typography, Accordion, AccordionSummary, Divider, List, ListItem, useTheme, AccordionDetails, useMediaQuery } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from "react";
import languageData from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import OpaqueCard from "@/components/ui/OpaqueCard";
import SupportHeader from "@/components/support/SupportHeader";
import { useSFDC } from "@/hooks/useSFDC";
import CreateCase from "@/components/support/CreateCase";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import ChatInterface from "@/components/chat/ChatInterface";
import { AgentConfig } from "@/service/chat/types";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function AboutUs() {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const {sfdcUser} = useSFDC();
  const { language } = useLanguage();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const agentConfig = agentConfigs.find(agent => agent.name === 'Generalist');
  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('FAQ Page View');
    }
  }, [mixpanel])

  useEffect(() => {
      const fetchAgentConfigs = async () => {
        try {
          const res = await fetch('/api/agent-configs');
          if (!res.ok) throw new Error('Failed to fetch agent configs');
          const data = await res.json();
          setAgentConfigs(data);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchAgentConfigs();
    }, []);

  return (
    <Stack direction={ {md : 'row', xs: 'column'}} spacing={4} justifyContent={'space-evenly'} alignItems={{md: 'start', xs: 'center'}} px={5} pb={10}>
      <Box minWidth={{md:'35vw', sm: '85vw'}} flexGrow={2}>
        {<ChatInterface agent={agentConfig} size="md"/>}
      </Box>
      <Stack direction={'column'} spacing={2} mt={4} sx={{mt: '2rem !important'}} alignItems={'center'} justifyContent={'center'}>
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
    </Stack>
  );
};

export const dynamic = "force-dynamic"