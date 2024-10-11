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
// components/LoadingIndicator.tsx
export default function DashboardHeader() {
  const theme = useTheme();
  const router = useRouter();
  const textColor = getTextColor(theme);
  const { language } = useLanguage();


  return (
    <Box>
      <Stack direction={'row'} justifyContent={'space-around'} alignItems={'center'} my={4}>
        {<Typography color={textColor} variant={'h5'}>{toTitleCase(`Xucre Investments ${(languageData[language].Menu.dashboard as string)}`)}</Typography>}
        <></>
        <IconButton sx={{ color: textColor }} onClick={() => { router.push('/dashboard/edit') }}>
          <SettingsIcon />
        </IconButton>
      </Stack>


    </Box>

  );
};
