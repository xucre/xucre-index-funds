'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { TextareaAutosize, useTheme } from "@mui/material";
import { Box, CircularProgress, Grid2 as Grid, Stack, Typography } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import erc20 from "@/public/erc20.json";
import Campfire from "@/components/campfire";
import { IndexFund, useIndexFunds } from "@/hooks/useIndexFunds";
import CustomCard from "@/components/portfolio/customCard";
import WalletNotConnected from "@/components/walletNotConnected";
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation, normalizeDevChains } from "@/service/helpers";
import UniswapPoolChecker, { PoolData } from "@/components/uniswap/poolChecker";
import { useSnackbar } from "notistack";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function IndexBuilder() {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isConnected, address, chainId } = useAccount();
  const [fund, setFund] = useState({
    name: {
      [Language.EN]: 'Fund Name',
      [Language.ES]: '',
      [Language.PT]: ''
    },
    cardSubtitle: {
      [Language.EN]: 'Fund Subtitle',
      [Language.ES]: '',
      [Language.PT]: ''
    },
    description: {
      [Language.EN]: 'Fund Description',
      [Language.ES]: '',
      [Language.PT]: ''
    },
    image: '',
    imageSmall: '',
    color: '',
    chainId: normalizeDevChains(chainId),
    portfolio: [],
  } as IndexFund);

  const handlePortfolioItemRegister = (pool: PoolData) => {
    setFund({
      ...fund,
      custom: true,
      sourceToken: {
        name: pool.sourceToken.name,
        chainId: chainId,
        address: pool.sourceToken.address,
        weight: 0,
        description: {
          [Language.EN]: 'Source Token Description',
          [Language.ES]: '',
          [Language.PT]: ''
        },
        logo: '',
        active: true,
        poolFee: pool.feeTier,
        decimals: pool.sourceToken.decimals,
        chain_logo: '',
        chartColor: '',
        links: [],
        sourceFees: {},
      },
      portfolio: [...fund.portfolio, {
        name: pool.targetToken.name,
        chainId: chainId,
        address: pool.targetToken.address,
        weight: 0,
        description: {
          [Language.EN]: 'Pool Description',
          [Language.ES]: '',
          [Language.PT]: ''
        },
        logo: '',
        active: true,
        poolFee: pool.feeTier,
        decimals: pool.targetToken.decimals,
        chain_logo: '',
        chartColor: '',
        links: [],
        sourceFees: {
          [pool.sourceToken.address]: pool.feeTier
        },
      }]
    });
    enqueueSnackbar(`${languageData[language].IndexBuilder.successfulAddition}:${pool.targetToken.name}`, { variant: 'success', autoHideDuration: 1000 });
  }

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Index Builder View');
    }
  }, [mixpanel])

  if (isLocked) {
    return <Campfire setIsLocked={setIsLocked} />;
  }

  if (!isConnected) return <WalletNotConnected />;
  //if (!isSubscribed) return <Campfire setIsLocked={() => { }} />;
  if (!chainValidation(chainId)) return <WalletNotConnected />;
  return (
    <Grid container pb={4}>
      <Grid size={{ xs: 12, sm: 8 }} sx={{ overFlowY: 'scroll', mb: 20 }} height={{ sm: '85vh' }}>
        <TextareaAutosize value={JSON.stringify(fund, null, 2)} maxRows={40} style={{ paddingBottom: 15, width: '100%', height: '75%', overflowY: 'scroll' }} />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <UniswapPoolChecker registerPortfolioItem={handlePortfolioItemRegister} />
      </Grid>

    </Grid>
  );
};