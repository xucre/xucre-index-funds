'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Box, IconButton, Stack, Typography, useTheme } from "@mui/material"
import SettingsIcon from '@mui/icons-material/Settings';
//import AccountButton from "./accountButton";
import languageData from '@/metadata/translations'
import { useRouter } from "next/navigation";
import React, { } from "react";
import { getTextColor } from "@/service/helpers";
import { toTitleCase } from '../../service/helpers';
import { useUser } from "@clerk/nextjs";
// components/LoadingIndicator.tsx
export default function DashboardHeader() {
  const theme = useTheme();
  const router = useRouter();
  const textColor = getTextColor(theme);
  const { language } = useLanguage();
  const { user } = useUser();

  return (
    <Box>
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} my={4} px={5} mb={2}>
        {<Typography color={textColor} variant={'h5'}>{`${(languageData[language].ui.welcome_message_1 as string)}`}<b>{`${user.firstName}`}</b>{`${(languageData[language].ui.welcome_message_2 as string)}`}</Typography>}
        <></>
        <IconButton sx={{ color: textColor }} onClick={() => { router.push('/edit') }}>
          <SettingsIcon />
        </IconButton>
      </Stack>


    </Box>

  );
};
