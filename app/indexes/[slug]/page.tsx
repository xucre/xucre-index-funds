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
import { getAllFunds, getFundDetails } from "@/service/db";
import { globalChainId, isDev } from "@/service/constants";
import { useClerkUser } from "@/hooks/useClerkUser";
import FundBlock from "@/components/fund/FundBlock";
import FundItemList from "@/components/fund/FundItemList";
import FundHeader from "@/components/fund/FundSelector";
import IndexBlock from "@/components/fund/FundBlock";
import IndexItemList from "@/components/indexes/IndexItemList";

export default function IndexFundPortfolio({ params }: { params: { slug: string } }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const mixpanel = useMixpanel();
  const slugString = params.slug as string;
  const textColor = getTextColor(theme);

  const [_indexFund, setIndexFund] = useState<IndexFund | undefined>(undefined);
  const { balance, allowance, hash, error, loading, isNativeToken, confirmationHash, approveContract, initiateSpot, sourceToken, sourceTokens, setSourceToken, status } = useConnectedIndexFund({ fund: _indexFund });
  const [amount, setAmount] = useState<BigInt>(BigInt(0));
  const [rawAmount, setRawAmount] = useState<string>('');
  const [priceData, setPriceData] = useState([] as PriceData[]);
  const [priceMap, setPriceMap] = useState({} as { [key: string]: PriceData });
  
  const getPrices = async () => {
    if (!_indexFund) return;
    const addresses = _indexFund.portfolio.map((item) => item.address).join(',');
    const _chainId = normalizeDevChains(globalChainId);
    const prices = await getTokenPrices(`addresses=${addresses}&chainId=${_chainId}`);
    
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
    approveContract(amount);
  }  

  const handleSpot = () => {
    initiateSpot(amount);
  }
  const allowanceString = allowance && sourceToken ? formatUnits(allowance as bigint, sourceToken.decimals) : 0;
  const allowanceAmount = allowance ? (allowance as BigInt) <= amount : true;
  
  const retrieveFunds = async () => {
    const funds = await getAllFunds(isDev ? 1155111: globalChainId);
    const fundDetailList = await Promise.all( funds.map(async (fund) => {
        return await getFundDetails(isDev ? 1155111: globalChainId, fund);
    }));
    const fund = fundDetailList.reduce((acc, fund) => {
        if (!fund.public) {
          return acc;
        }
        if (fund.id === slugString) return fund;
        return acc;
    }, fundDetailList[0] as IndexFund | undefined);
    setIndexFund(fund);
  }

  useEffect(() => {
    if (slugString) {
      retrieveFunds();
    }
  }, [slugString]);

  const PortfolioDescription = () => (
    <Stack direction={'column'} spacing={2} mx={2}>
      {/* <Typography variant={'h5'} color={textColor} textAlign={'center'}>{_indexFund ? _indexFund.name[language] : ''}</Typography> */}
      <Typography variant={'body1'} color={textColor} textAlign={'justify'}>{_indexFund ? _indexFund.description[language] : ''}</Typography>
    </Stack>
  )

  if (_indexFund === undefined) return <></>;

  return (
    <Stack direction={'row'} spacing={4} justifyContent={'space-between'} alignItems={'start'} sx={{px:4}}>
      <Box mt={{ xs: 0 }} pb={4} mx={2} p={2}>
        <Stack direction={'row'} sx={{py: 4}} spacing={2} justifyContent={'start'} alignItems={'center'} >
          <IndexBlock header={_indexFund.name[language]} subheader={_indexFund ? _indexFund.cardSubtitle[language] : ''} />
        </Stack>
        
        <Box>
          <PortfolioDescription />
        </Box>

        <Box my={1}>
          <IndexItemList portfolioItems={_indexFund.portfolio} priceMap={priceMap} />
        </Box>
      </Box>
      <Box minWidth={'20vw'}>
        <BuyItem isNativeToken={isNativeToken} confirmationHash={confirmationHash} status={status} portfolio={_indexFund} sourceToken={sourceToken} sourceTokens={sourceTokens} setSourceToken={setSourceToken} balance={balance} allowance={allowance} rawAmount={rawAmount} handleAmountUpdate={handleAmountUpdate} amount={amount} handleApproval={handleApproval} loading={loading} allowanceAmount={allowanceAmount} handleSpot={handleSpot} />
      </Box>
    </Stack>
  );
};  