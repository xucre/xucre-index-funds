import React, { useEffect, useState } from 'react';
import { Stack, Typography, Divider, useTheme, Box, Skeleton, Accordion, AccordionDetails, AccordionSummary, Grid2 as Grid, Button } from '@mui/material';
import dayjs from 'dayjs';
import { retrieveTransactionDetails, TransactionDetails, Transfer } from '@/service/eip155';
import { CovalentTransactionV3 } from '@/hooks/useWalletData';
import { getDashboardBorderColor } from '@/service/helpers';
import truncateEthAddress from 'truncate-eth-address';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatEther, formatUnits, getAddress } from 'viem';
import { useLanguage } from '@/hooks/useLanguage';
import languageData from '@/metadata/translations';
import { TokenDetails } from '@/service/types';
import { getTokenMetadata, setTokenMetadata } from '@/service/db';
import { getTokenInfo } from '@/service/lambda';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { globalChainId } from '@/service/constants';
import { useIndexedDB } from '@/hooks/useIndexedDB';

dayjs.extend(relativeTime)

interface DashboardTransactionProps {
  transaction: CovalentTransactionV3;
  address: string;
}

type TransferExtended = Transfer & {tokenMetadata: TokenDetails};

const DashboardTransaction: React.FC<DashboardTransactionProps> = ({ transaction, address }) => {
  const theme = useTheme();
  const {language} = useLanguage();
  const borderColor = getDashboardBorderColor(theme);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [transactionType, setTransactionType] = useState<String>(languageData[language].Dashboard.unknown);
  const [transfers, setTransfers] = useState<TransferExtended[]>([]);
  const {getValue, putValue, isDBConnecting} = useIndexedDB();

  const computeTransactionType = (details: TransactionDetails) => {
    const myEvents = details.erc20Transfers.filter((transfer) => {return transfer.to === address || transfer.from === address});
    
    if (myEvents.length === 0) return languageData[language].Dashboard.unknown;
    if (myEvents.length === 1) return myEvents[0].to === address ? languageData[language].Dashboard.deposit : languageData[language].Dashboard.withdrawal;
    
    //if (myEvents.length > 1 ) return languageData[language].Dashboard.unknown;
    if (myEvents.length > 1) return languageData[language].Dashboard.investment;
    
    return languageData[language].Dashboard.unknown;
  }

  const enrichTransfers = async () => {
    if (transactionDetails === null) return;
    const cachedTransfers = await getValue(`transactions`,`transaction:${address}:${transaction.tx_hash}:transfers`);
    if (cachedTransfers) {
      const transferList = cachedTransfers.transfers as TransferExtended[];
      setTransfers(transferList);
      return;
    }
    const transferList = await Promise.all(transactionDetails.erc20Transfers.map(async (transfer) => {
      let token: TokenDetails;
      const token1 = await getTokenMetadata(globalChainId,  transfer.token);
      if (token1) {
        token = token1 as TokenDetails;
      } else {
        //token = {name: 'Unknown', symbol: 'UNK', decimals: 18, logo: '', defaultLogo: true};
        token = await getTokenInfo(globalChainId,  transfer.token);
        await setTokenMetadata(globalChainId,  transfer.token, token as TokenDetails);
      }
      //const token = await getTokenMetadata(globalChainId, transfer.token);
      return { ...transfer, tokenMetadata: token as TokenDetails };
    }));
    setTransfers(transferList);
    await putValue(`transactions`, {id: `transaction:${address}:${transaction.tx_hash}:transfers`, transfers: transferList});
    //localStorage.setItem(`transaction:${address}:${transaction.tx_hash}:transfers`, JSON.stringify(transferList));
  }

  useEffect(() => {
    console.log('transactionDetails', transactionDetails);
    if (transactionDetails && transactionType !== languageData[language].Dashboard.unknown && transactionDetails.erc20Transfers.length <= 25) {
      enrichTransfers();
    } else if (transactionDetails && transactionType !== languageData[language].Dashboard.unknown && transactionDetails.erc20Transfers.length > 25) {
      setTransactionType(languageData[language].Dashboard.unknown);
    }
  }, [transactionDetails, transactionType]);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      //const cachedDetails = localStorage.getItem(`transaction:${address}:${transaction.tx_hash}`);
      const cachedDetails = await getValue(`transactions`, `transaction:${address}:${transaction.tx_hash}`);
      if (cachedDetails) {
        const details = cachedDetails.details as TransactionDetails;
        setTransactionDetails(details);
        setTransactionType(computeTransactionType(details));
        return;
      }
      const details = await retrieveTransactionDetails(address, transaction.tx_hash);
      setTransactionType(computeTransactionType(details));
      setTransactionDetails(details);
      await putValue(`transactions`, {id: `transaction:${address}:${transaction.tx_hash}`, details: details});
      //localStorage.setItem(`transaction:${address}:${transaction.tx_hash}`, JSON.stringify(details));
    };

    if (transaction && address && !isDBConnecting) fetchTransactionDetails();
  }, [transaction, address, isDBConnecting]);

  if (!transactionDetails) {
    return <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
  }
  const direction = transactionType === languageData[language].Dashboard.deposit ? '+' : transactionType === languageData[language].Dashboard.withdrawal ? '-' : '';
  const isInvestment = transactionType === languageData[language].Dashboard.investment;
  const hasTransfers = transfers.length > 0;
  const isSpam = transactionDetails.erc20Transfers.length > 25;
  const matchedTransfers = transfers.filter((transfer) => transfer.to === address || transfer.from === address);
  const BasicEntry = () => {
    return (
      <Stack direction={'row'} spacing={1} justifyContent={'space-between'} alignItems={'center'} width={'100%'} >
        <a href={`https://polygonscan.com/tx/${transaction.tx_hash}`} target={'_blank'} ><Typography>{transactionType} tx ({truncateEthAddress(transaction.tx_hash)})</Typography></a>
        <Stack direction={'row'} spacing={1} alignItems={'center'}>
          <Typography fontWeight={'bold'}>{`${direction}${ hasTransfers ? formatUnits(BigInt(matchedTransfers[0].value), matchedTransfers[0].tokenMetadata.decimals) : 0} ${hasTransfers ? matchedTransfers[0].tokenMetadata.symbol : ''}`}</Typography>
          {hasTransfers && matchedTransfers[0].tokenMetadata.logo && <img src={matchedTransfers[0].tokenMetadata.logo} alt={matchedTransfers[0].tokenMetadata.symbol} style={{width: '20px', height: '20px'}} />}
        </Stack>
        
       </Stack>
    )
  }

  const InvestmentEntry = () => {
    const {language} = useLanguage();
    const [expanded, setExpanded] = React.useState(false);
    const handleChange = () => (event: React.SyntheticEvent, isExpanded) => {
      setExpanded(isExpanded);
    };
    return (
      <Stack direction={'row'} spacing={1} justifyContent={'space-between'} alignItems={'center'} width={'100%'} >
        <Accordion  sx={{backgroundColor: 'transparent', width:'100%'}} disableGutters={true} className={'gutterless-accordion'} elevation={0} slotProps={{ transition: { unmountOnExit: true }, heading: { sx: {marginY:0}} }} >
          
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="panel2-content"
            className={'gutterless-accordion'}
            sx={{padding: 0, margin: 0, marginY: 0, with: '100%'}}
            
          >
            <Typography sx={{margin:0}}>{transactionType} tx ({truncateEthAddress(transaction.tx_hash)})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" spacing={1} justifyContent={'end'} alignItems="center" width="100%">
              <Grid container direction="column" spacing={1} width="100%">
                {transfers.map((transfer, index) => {
                  const isMember = transfer.to === address || transfer.from === address;
                  const isInbound = transfer.to === address;
                  const _direction = isInbound ? '+' : '-';

                  if (!isMember) return null;
                  return (
                    <Grid container size={12} key={index}>
                      {/* Left Grid item */}
                      <Grid size={2}>
                        <Typography>{isInbound ? languageData[language].Dashboard.transaction_in : languageData[language].Dashboard.transaction_out}</Typography>
                      </Grid>
                      <Grid size={1}>
                        {transfer.tokenMetadata.logo && (
                          <img
                            src={transfer.tokenMetadata.logo}
                            alt={transfer.tokenMetadata.symbol}
                            style={{ width: '20px', height: '20px' }}
                          />
                        )}
                      </Grid>
                      <Grid size={9}>
                        <Typography fontWeight="bold">
                          {`${_direction}${formatUnits(
                            BigInt(transfer.value),
                            transfer.tokenMetadata.decimals
                          )} ${transfer.tokenMetadata.symbol}`}
                        </Typography>
                      </Grid>

                      
                    </Grid>
                  );
                })}
              </Grid>
            </Stack>
          </AccordionDetails>
        </Accordion>
        {/* <a href={`https://polygonscan.com/tx/${transaction.tx_hash}`} target={'_blank'} ><Typography>{transactionType} tx ({truncateEthAddress(transaction.tx_hash)})</Typography></a>
        <Typography fontWeight={'bold'}>{`${direction}${formatUnits(BigInt(transfers[0].value), transfers[0].tokenMetadata.decimals)} ${transfers[0].tokenMetadata.symbol}`}</Typography>
        <Typography fontWeight={'bold'}>{`${direction}${formatUnits(BigInt(transfers[1].value), transfers[1].tokenMetadata.decimals)} ${transfers[1].tokenMetadata.symbol}`}</Typography> */}
      </Stack>
    )
  }

  return (
    <Box width={'full'}>

      {transactionDetails !== null && !isInvestment && <BasicEntry />}
      {transactionDetails !== null && isInvestment && isSpam && <BasicEntry />}
      {transactionDetails !== null && isInvestment && !isSpam && <InvestmentEntry />}
    </Box>

  );
};

export default DashboardTransaction;