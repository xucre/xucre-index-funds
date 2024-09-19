'use client';
import { Box, CssBaseline, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { use, useEffect, useState } from 'react';
import { GateFiDisplayModeEnum, GateFiLangEnum, GateFiSDK } from '@gatefi/js-sdk';
import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/metadata/translations';

export default function Unlimit({ finalAddress }: { finalAddress: string }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const [instance, setGatefiInstance] = useState<GateFiSDK>(null);

  useEffect(() => {
    let _instance = null;
    //if (instance) {
    _instance = new GateFiSDK({
      merchantId: process.env.NEXT_PUBLIC_UNLIMIT_KEY,
      displayMode: GateFiDisplayModeEnum.Embedded,
      nodeSelector: "#container",
      walletAddress: finalAddress,
      isSandbox: false,
      hideBrand: true,
      hideThemeSwitcher: true,
      lang: language === Language.EN ? GateFiLangEnum.en_US : language === Language.ES ? GateFiLangEnum.es_PE : language === Language.PT ? GateFiLangEnum.pt_BR : GateFiLangEnum.es_PE,
      defaultCrypto: {
        currency: 'MATIC_POLYGON'
      }
    })
    _instance.setThemeType(theme.palette.mode === 'light' ? 'light' : 'dark');
    setGatefiInstance(_instance);
    //}
    return () => {
      if (_instance) {
        _instance.destroy();
      }
      if (instance) {
        //instance.destroy();
      }
    }
  }, [])

  return (
    <>
      {
        <Stack direction={'row'} width={'full'} justifyContent={'center'} alignItems={'center'} id="container"></Stack>
      }
    </>
  );
}
