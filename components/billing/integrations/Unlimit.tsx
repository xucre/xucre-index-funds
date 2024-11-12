'use client';
import { Box, CssBaseline, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { use, useEffect, useState } from 'react';
import { GateFiDisplayModeEnum, GateFiLangEnum, GateFiSDK, GateFiEventTypes } from '@gatefi/js-sdk';
import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/metadata/translations';
import { useMixpanel } from '@/hooks/useMixpanel';
import { BASEURL } from '@/service/constants';
export default function Unlimit({ invoiceId, destination, amount }: { invoiceId: string, destination: string, amount: number }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const [instance, setGatefiInstance] = useState<GateFiSDK>(null);

  useEffect(() => {
    let _instance = null;
    //if (instance) {

    _instance = new GateFiSDK({
      merchantId: process.env.NEXT_PUBLIC_UNLIMIT_KEY_TEST,
      displayMode: GateFiDisplayModeEnum.Embedded,
      nodeSelector: "#container",
      walletAddress: destination,
      defaultCrypto: {
        currency: 'USDT_BEP20',
        amount: amount.toString()
      },
      isSandbox: true,
      hideBrand: true,
      hideThemeSwitcher: true,
      fiatAmountLock: true,
      successUrl: `${BASEURL}/billing/${invoiceId}/pay/callback/success`,
      declineUrl: `${BASEURL}/billing/${invoiceId}/pay/callback/decline`,
      cancelUrl: `${BASEURL}/billing/${invoiceId}/pay/callback/cancel`,
      lang: language === Language.EN ? GateFiLangEnum.en_US : language === Language.ES ? GateFiLangEnum.es_PE : language === Language.PT ? GateFiLangEnum.pt_BR : GateFiLangEnum.es_PE,
    })
    _instance.setThemeType(theme.palette.mode);
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
        <Stack direction={'row'} width={'full'} justifyContent={'center'} alignItems={'center'} pb={10} id="container"></Stack>
      }
    </>
  );
}
