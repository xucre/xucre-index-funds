'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { playStoreAddress } from "@/service/constants";
import { Avatar, Box, CircularProgress, Fab, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import languageData from '@/metadata/translations';
import React from "react";

// components/LoadingIndicator.tsx
export default function CTA({ type }: { type: 'main' | 'sidebar' }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <>
      {type === 'main' && false &&
        <Fab variant="extended" color="primary" sx={{ padding: 4, position: 'absolute', right: 10, bottom: 10, display: matches ? 'flex' : 'none' }} onClick={() => { console.log('window.location.assign(playStoreAddress)') }}>
          <Avatar src={'/icon-black.png'} sx={{ mr: 1 }} />
          <Stack direction={'column'} spacing={0}>
            <Typography textTransform={'none'} >{languageData[language].App.cta_1}</Typography>
            <Typography textTransform={'none'} >{languageData[language].App.cta_2}</Typography>
          </Stack>
        </Fab>
      }

      {type === 'sidebar' &&
        <Fab variant="extended" color="primary" sx={{ paddingX: 2, paddingY: 4, position: 'absolute', left: 10, bottom: 20 }} onClick={() => { console.log('window.location.assign(playStoreAddress)') }}>
          <Avatar src={'/icon-black.png'} sx={{ mr: 1 }} />
          <Stack direction={'column'} spacing={0}>
            <Typography textTransform={'none'} fontSize={12}>{languageData[language].App.cta_1}</Typography>
            <Typography textTransform={'none'} fontSize={12}>{languageData[language].App.cta_2}</Typography>
          </Stack>
        </Fab>
      }

    </>
  );
};
