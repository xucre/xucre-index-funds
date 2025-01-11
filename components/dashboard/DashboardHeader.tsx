'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Badge, Box, IconButton, Stack, Typography, useTheme, withStyles } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit';
//import AccountButton from "./accountButton";
import languageData from '@/metadata/translations'
import { useRouter } from "next/navigation";
import React, { } from "react";
import { getTextColor } from "@/service/helpers";
import { toTitleCase } from '../../service/helpers';
import { useSFDC } from "@/hooks/useSFDC";
// components/LoadingIndicator.tsx



export default function DashboardHeader() {
  const theme = useTheme();
  const router = useRouter();
  const textColor = getTextColor(theme);
  const { language } = useLanguage();
  const {sfdcUser, hasOnboarded} = useSFDC();
  const isNewUser = !hasOnboarded || !sfdcUser || !sfdcUser.firstName || sfdcUser.firstName === '' || !sfdcUser.riskTolerance || sfdcUser.riskTolerance === '';


  return (
    <Box>
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} my={4} px={5} mb={2}>
        {<Typography color={textColor} variant={'h5'}>{`${(languageData[language].ui.welcome_message_1 as string)}`}<b>{`${sfdcUser ? sfdcUser.firstName || 'Usuario' : 'Usuario'}`}</b>{`${(languageData[language].ui.welcome_message_2 as string)}`}</Typography>}
        <></>
        <IconButton sx={{ color: textColor }} onClick={() => { router.push('/settings/portfolio') }}>
          <Badge color="warning" variant="dot" invisible={!isNewUser}>
            <EditIcon sx={{transform: "scaleX(-1)"}}/>
          </Badge>
        </IconButton>
      </Stack>


    </Box>

  );
};
