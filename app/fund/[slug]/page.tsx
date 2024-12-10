'use client'
import { getTextColor } from "@/service/theme";

import { Divider, useTheme } from "@mui/material";
import { Box, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useConnectedIndexFund, useIndexFunds } from "@/hooks/useIndexFunds";
import WalletNotConnected from "@/components/walletNotConnected";
import PortfolioItemList from "@/components/portfolio/portfolioItemList";
import { getTokenPrices } from "@/service/lambda";
import { IndexFund, PriceData } from "@/service/types";
import { BuyItem } from "@/components/portfolio/buyItem";
import { useLanguage } from "@/hooks/useLanguage";
import languageData, { languages } from '@/metadata/translations';
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation, normalizeDevChains } from "@/service/helpers";
import React from "react";
import OpaqueCard from "@/components/ui/OpaqueCard";
import demoPortfolio from "@/public/demoPortfolio.json";
import { useUser } from "@clerk/nextjs";
import { getAllFunds, getFundDetails } from "@/service/db";
import { isDev } from "@/service/constants";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";



// components/LoadingIndicator.tsx
export default function IndexFundItem({ params }: { params: { slug: string } }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const mixpanel = useMixpanel();
  const { isSignedIn } = useUser();
  const slugString = params.slug as string;
  //const _indexFund = JSON.parse(atob(decodeURIComponent(slugString))) as IndexFund;
  const textColor = getTextColor(theme);
  // const { isConnected, chainId, isConnecting, isReconnecting } = useAccount();
  // const { indexFunds } = useIndexFunds({ chainId: normalizeDevChains(chainId || 137) });
  // const _indexFund = indexFunds.find((fund) => {
  //   return languages.reduce((returnVal, lang) => {
  //     if (returnVal) return returnVal;
  //     return encodeURIComponent(fund.name[lang]) === slugString || normalizeDevChains(chainId || 137) === fund.chainId;
  //   }, false);
  // });

  const [_indexFund, setIndexFund] = useState<IndexFund | undefined>(undefined);
  //const _indexFund = demoPortfolio;
  //const [_indexFund, setIndexFund] = useState(indexFundFound);
  const { balance, allowance, hash, error, loading, isNativeToken, confirmationHash, approveContract, initiateSpot, sourceToken, sourceTokens, setSourceToken, status } = useConnectedIndexFund({ fund: _indexFund });
  const [amount, setAmount] = useState<BigInt>(BigInt(0));
  const [rawAmount, setRawAmount] = useState<string>('');
  const [priceData, setPriceData] = useState([] as PriceData[]);
  const [priceMap, setPriceMap] = useState({} as { [key: string]: PriceData });
  //const { isSubscribed } = usePaidPlanCheck();
  const getPrices = async () => {
    if (!_indexFund) return;
    const addresses = _indexFund.portfolio.map((item) => item.address).join(',');
    const _chainId = normalizeDevChains(137);
    const prices = await getTokenPrices(`addresses=${addresses}&chainId=${_chainId}`);
    //console.log('getPrices', prices);
    try {
      setPriceData(prices as PriceData[]);
      const _priceMap = prices.reduce((acc, price) => {
        return { ...acc, [price.address.toLowerCase()]: price }
      }, {});
      setPriceMap(_priceMap);
    } catch (err) {
      console.log(err.message);
    }

  }

  useEffect(() => {
    if (_indexFund) getPrices();
  }, [_indexFund])

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Index Fund Item Page View', { fund: _indexFund?.name[language] });
    }
  }, [mixpanel]);

  const handleAmountUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!sourceToken) return;
    setRawAmount(event.target.value);
    setAmount(parseUnits(event.target.value, sourceToken.decimals));
  }

  const handleApproval = () => {
    console.log('Approving');
    approveContract(amount);
  }  

  const handleSpot = () => {
    initiateSpot(amount);
  }
  const allowanceString = allowance && sourceToken ? formatUnits(allowance as bigint, sourceToken.decimals) : 0;
  const allowanceAmount = allowance ? (allowance as BigInt) <= amount : true;
  //console.log(allowanceAmount, allowanceString)
  const retrieveFunds = async () => {
    const funds = await getAllFunds(isDev ? 1155111: 137);
    const fundDetailList = await Promise.all( funds.map(async (fund) => {
        return await getFundDetails(isDev ? 1155111: 137, fund);
    }));
    //console.log(fundDetailList);
    const fund = fundDetailList.reduce((acc, fund) => {
        if (!fund.toleranceLevels || fund.toleranceLevels.length === 0) {
          return acc;
        }
        if (fund.toleranceLevels[0] === slugString) return fund;
        return acc;
    }, fundDetailList[0] as IndexFund);
    setIndexFund(fund);
  }

  useEffect(() => {
    if (slugString) {
      retrieveFunds();
    }
  }, [slugString]);

  const PortfolioDescription = () => (
    <Stack direction={'column'} spacing={2}>
      <Typography variant={'h5'} color={textColor} textAlign={'center'}>{_indexFund ? _indexFund.name[language] : ''}</Typography>
      <Typography variant={'body1'} color={textColor} textAlign={'justify'}>{_indexFund ? _indexFund.description[language] : ''}</Typography>
    </Stack>
  )

  if (_indexFund === undefined) return <></>;
  return (
    <Box mt={{ xs: 0, sm: 4 }} pb={4}>

      <Stack direction={'row'} mt={2} mx={2} spacing={2} justifyContent={'space-evenly'} alignItems={'start'} sx={{ display: { md: 'flex', xs: 'none' } }}>
        <OpaqueCard sx={{p: 4}}>
          <Stack maxWidth={'50vw'} direction={'column'} justifyContent={'center'} alignItems={'center'}>
            <PortfolioDescription />
            <PortfolioItemList portfolioItems={_indexFund.portfolio} priceMap={priceMap} />
          </Stack>
        </OpaqueCard>
        {!isSignedIn && false &&
          <Box maxWidth={'50vw'}>
            <BuyItem isNativeToken={isNativeToken} confirmationHash={confirmationHash} status={status} portfolio={_indexFund} sourceToken={sourceToken} sourceTokens={sourceTokens} setSourceToken={setSourceToken} balance={balance} allowance={allowance} rawAmount={rawAmount} handleAmountUpdate={handleAmountUpdate} amount={amount} handleApproval={handleApproval} loading={loading} allowanceAmount={allowanceAmount} handleSpot={handleSpot} />
          </Box>
        }

      </Stack>

      <Stack direction={'column'} m={2} spacing={4} justifyContent={'center'} alignItems={'center'} sx={{ display: { md: 'none', xs: 'flex' } }}>
        <OpaqueCard>
          <PortfolioDescription />
          <PortfolioItemList portfolioItems={_indexFund.portfolio} priceMap={priceMap} />
        </OpaqueCard>
        <Divider sx={{ color: textColor, width: '80vw' }} />

        {/**BUY ITEM  */}
        {!isSignedIn && false &&
          <BuyItem isNativeToken={isNativeToken} confirmationHash={confirmationHash} status={status} portfolio={_indexFund} sourceToken={sourceToken} sourceTokens={sourceTokens} setSourceToken={setSourceToken} balance={balance} allowance={allowance} rawAmount={rawAmount} handleAmountUpdate={handleAmountUpdate} amount={amount} handleApproval={handleApproval} loading={loading} allowanceAmount={allowanceAmount} handleSpot={handleSpot} />
        }
      </Stack>
    </Box>
  );
};