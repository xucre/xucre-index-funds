'use client'
import { getTextColor } from "@/service/theme";

import LoadingButton from '@mui/lab/LoadingButton';
import { Avatar, Button, ButtonBase, ButtonGroup, Divider, IconButton, Menu, MenuItem, TextField, useTheme } from "@mui/material";
import { Box, CircularProgress, Grid2 as Grid, Stack, Typography } from "@mui/material"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Suspense, useEffect, useState } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { getAddress, formatEther, parseEther, parseUnits, formatUnits } from "viem";
import erc20 from "@/public/erc20.json";
import Campfire from "@/components/campfire";
import { IndexFund, useConnectedIndexFund, useIndexFunds } from "@/hooks/useIndexFunds";
import CustomCard from "@/components/portfolio/customCard";
import WalletNotConnected from "@/components/walletNotConnected";
import PortfolioItemList from "@/components/portfolio/portfolioItemList";
import { getTokenPrices } from "@/service/lambda";
import FundChart from "@/components/portfolio/fundChart";
import { PriceData } from "@/service/types";
import { BuyItem } from "@/components/portfolio/buyItem";
import { useLanguage } from "@/hooks/useLanguage";
import languageData, { languages } from '@/metadata/translations';
import { Language } from "@mui/icons-material";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation, normalizeDevChains } from "@/service/helpers";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";



// components/LoadingIndicator.tsx
export default function IndexFundItem({ params }: { params: { slug: string } }) {
  const theme = useTheme();
  const { language } = useLanguage();
  const mixpanel = useMixpanel();
  const slugString = params.slug as string;
  //const _indexFund = JSON.parse(atob(decodeURIComponent(slugString))) as IndexFund;
  const textColor = getTextColor(theme);
  const { isConnected, chainId, isConnecting, isReconnecting } = useAccount();
  const { indexFunds } = useIndexFunds({ chainId: normalizeDevChains(chainId) });
  const _indexFund = indexFunds.find((fund) => {
    return languages.reduce((returnVal, lang) => {
      if (returnVal) return returnVal;
      return encodeURIComponent(fund.name[lang]) === slugString || normalizeDevChains(chainId) === fund.chainId;
    }, false);
  });
  const { balance, allowance, hash, error, loading, confirmationHash, approveContract, initiateSpot, sourceToken, sourceTokens, setSourceToken, status } = useConnectedIndexFund({ fund: _indexFund });
  const [amount, setAmount] = useState<BigInt>(BigInt(0));
  const [rawAmount, setRawAmount] = useState<string>('');
  const [priceData, setPriceData] = useState([] as PriceData[]);
  const [priceMap, setPriceMap] = useState({} as { [key: string]: PriceData });
  //const { isSubscribed } = usePaidPlanCheck();
  const getPrices = async () => {
    const addresses = _indexFund.portfolio.map((item) => item.address).join(',');
    const _chainId = normalizeDevChains(chainId);
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
    if (chainId && _indexFund) getPrices();
  }, [chainId, _indexFund])

  useEffect(() => {
    if (mixpanel) {
      mixpanel.track('Index Fund Item Page View', { fund: _indexFund?.name[language] });
    }
  }, [mixpanel]);

  const handleAmountUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  const allowanceString = allowance ? formatUnits(allowance as bigint, sourceToken.decimals) : 0;
  const allowanceAmount = allowance ? (allowance as BigInt) <= amount : true;
  //console.log(allowanceAmount, allowanceString)

  //useEffect(() => { console.log(allowanceAmount, allowanceString) }, [allowanceAmount, allowanceString])

  const SelectSource = () => {

  }

  const PortfolioDescription = () => (
    <Stack direction={'column'} spacing={2}>
      <Typography variant={'h5'} color={textColor} textAlign={'center'}>{_indexFund.name[language]}</Typography>
      <Typography variant={'body1'} color={textColor}>{_indexFund.description[language]}</Typography>
    </Stack>
  )

  //return (<Campfire setIsLocked={() => { }} />)

  //if (!isSubscribed) return <Campfire setIsLocked={() => { }} />;
  if (!isConnected && !isConnecting && !isReconnecting) {
    return <WalletNotConnected />
  }

  if (!chainValidation(chainId)) return <Typography textAlign={'center'}>{languageData[language].ui.wrong_network}</Typography>;
  if (_indexFund === undefined) return <></>;
  return (
    <Box mt={{ xs: 0, sm: 4 }} pb={4}>

      <Stack direction={'row'} mt={2} mx={2} spacing={2} justifyContent={'space-evenly'} alignItems={'start'} sx={{ display: { md: 'flex', xs: 'none' } }}>
        <Stack maxWidth={'50vw'} direction={'column'} justifyContent={'center'} alignItems={'center'}>
          <PortfolioDescription />
          <PortfolioItemList portfolioItems={_indexFund.portfolio} priceMap={priceMap} />
        </Stack>
        <Box maxWidth={'50vw'}>
          <BuyItem confirmationHash={confirmationHash} status={status} portfolio={_indexFund} sourceToken={sourceToken} sourceTokens={sourceTokens} setSourceToken={setSourceToken} balance={balance} allowance={allowance} rawAmount={rawAmount} handleAmountUpdate={handleAmountUpdate} amount={amount} handleApproval={handleApproval} loading={loading} allowanceAmount={allowanceAmount} handleSpot={handleSpot} />
        </Box>

      </Stack>

      <Stack direction={'column'} m={2} spacing={4} justifyContent={'center'} alignItems={'center'} sx={{ display: { md: 'none', xs: 'flex' } }}>
        <PortfolioDescription />
        <PortfolioItemList portfolioItems={_indexFund.portfolio} priceMap={priceMap} />
        <Divider sx={{ color: textColor, width: '80vw' }} />

        {/**BUY ITEM  */}
        <BuyItem confirmationHash={confirmationHash} status={status} portfolio={_indexFund} sourceToken={sourceToken} sourceTokens={sourceTokens} setSourceToken={setSourceToken} balance={balance} allowance={allowance} rawAmount={rawAmount} handleAmountUpdate={handleAmountUpdate} amount={amount} handleApproval={handleApproval} loading={loading} allowanceAmount={allowanceAmount} handleSpot={handleSpot} />
      </Stack>
    </Box>
  );
};