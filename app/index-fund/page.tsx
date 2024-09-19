'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { useTheme } from "@mui/material";
import { Box, CircularProgress, Grid2 as Grid, Stack, Typography } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import erc20 from "@/public/erc20.json";
import Campfire from "@/components/campfire";
import { IndexFund, useIndexFunds } from "@/hooks/useIndexFunds";
import CustomCard from "@/components/portfolio/customCard";
import WalletNotConnected from "@/components/walletNotConnected";
import languageData from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";
import { normalizeDevChains } from '../../service/helpers';

// components/LoadingIndicator.tsx
export default function IndexFunds() {

  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const [selectedFund, setSelectedFund] = useState(null as IndexFund | null);
  const { isConnected, address, chainId } = useAccount();
  const { indexFunds } = useIndexFunds({ chainId: normalizeDevChains(chainId) });
  //const { isSubscribed } = usePaidPlanCheck();


  useEffect(() => {
    if (selectedFund) { // if selectedFund is not null      
      if (mixpanel) mixpanel.track('Index Fund Selected', { fund: selectedFund.name[language] });
      //const data = btoa(JSON.stringify(selectedFund));
      const data = selectedFund.name[language];
      router.push(`/index-fund/${data}`);
    }
    //console.log(indexFunds);
  }, [selectedFund])

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Index Fund Page View');
    }
  }, [mixpanel])

  if (isLocked) {
    //return <Campfire setIsLocked={setIsLocked} />;
  }

  if (!isConnected) return <WalletNotConnected />;
  //if (!isSubscribed) return <Campfire setIsLocked={() => { }} />;
  if (!chainValidation(chainId)) return <WalletNotConnected />;
  return (
    <Box pb={4}>
      <Stack justifyContent={'center'} alignItems={'center'}>
        {/*<Typography variant={'h6'} color={textColor}>{languageData[language].ui.index_fund_title}</Typography>*/}
      </Stack>
      <Grid container spacing={4} p={5}>
        {indexFunds.map((fund) => (
          <Grid size={{ xs: 10, md: 4 }} offset={{ md: 0, xs: 1 }} key={`${fund.name[language]}:${fund.chainId}`}>
            <CustomCard
              color={fund.color}
              title={fund.name[language]}
              sourceLogo={''}
              subtitle={fund.cardSubtitle[language]}
              image={fund.imageSmall}
              onclick={() => setSelectedFund(fund)}
            />
          </Grid>
        ))}
      </Grid>

    </Box>
  );
};