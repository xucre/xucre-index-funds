import React, { useState, useEffect } from 'react';
// ...existing imports...
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemIcon, ListItemText, Button, CircularProgress, Chip, Stack, Typography, Avatar, TextField, Slider, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ClearIcon from '@mui/icons-material/Clear';
import { IndexFund, Invoice, InvoiceStatuses, TokenDetails } from '@/service/types';
import truncateEthAddress from 'truncate-eth-address';
import { globalChainId, isDev } from '@/service/constants';
import { executeTokenWithdrawalToWallet, executeUserSpotExecution } from '@/service/safe/safe';
import { getAllFunds, getFundDetails, saveWithdrawalLog, setInvoiceDetails } from '@/service/db';
import { useLanguage } from '@/hooks/useLanguage';
import { Item } from '@/hooks/useWalletData';
import { useAccount, useSignMessage } from 'wagmi';
import AccountButton from '../accountButton';
import AmountInput from '../ui/AmountInput';
import { useClerkOrganization } from '@/hooks/useClerkOrganization';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useSnackbar } from 'notistack';

interface WithdrawTokenToWalletProps {
    details: Item;
    metadata: TokenDetails;
    open: boolean;
    closeFunction: any;
    address: string;
}
const WithdrawTokenToWallet: React.FC<WithdrawTokenToWalletProps> = ({ details, metadata, open, address, closeFunction }) => {
    const {language, languageData} = useLanguage();
    const {organization} = useClerkOrganization();
    const {user, safeWallet} = useClerkUser();

    const { enqueueSnackbar } = useSnackbar();
    const {address: wcAddress, isConnected} = useAccount();
    const { signMessage } = useSignMessage({
      mutation: {
        onSuccess: (data) => {
          handleMessageSigned(data);
        },
        onError: (error) => {
          console.error(error);
        },
      }
    });
    const [executing, setExecuting] = useState(false);
    const [amount, setAmount] = useState(0);

    const handleClose = () => {
        closeFunction();
    }
    console.log('safe address', address);
    const handleMessageSigned = async (signedMessage: string) => {
      if (!user || !wcAddress || !safeWallet) return;
      try {
        await saveWithdrawalLog(user.id,details.contract_address,signedMessage);
        await executeTokenWithdrawalToWallet({
          tokenAddress: details.contract_address,
          amount: amount,
          from: safeWallet,
          to: wcAddress,
          decimals: metadata.decimals,
          chainId: globalChainId,
        });
        enqueueSnackbar(languageData[language].ui.transaction_successful, {
          variant: 'success',
          autoHideDuration: 1000,
        });
        closeFunction('refresh');
      } catch (err) {
        enqueueSnackbar(languageData[language].ui.transaction_error, {
          variant: 'error',
          autoHideDuration: 1000,
        });
      }
    }

    const handleFormSubmit = async () => {
      signMessage({ account: wcAddress, message: `Withdraw ${metadata.symbol} - ${details.contract_address} (${amount}) from ${address} to ${wcAddress}` })
    };

    const getIcon = (status) => {
        if (status === 'loading') return <CircularProgress size={24} />;
        if (status === 'success') return <CheckCircleIcon color="success" />;
        if (status === 'error') return <ErrorIcon color="error" />;
        return null;
    };

    const onAmountChange = (value: number) => {
      setAmount(value);
    }

    const quote = details.holdings[0].quote_rate === null ? details.holdings[1] : details.holdings[0];
    const currentValue = quote.quote_rate;
    const totalAmount = quote.close.quote;
    
    return (
        <Dialog open={open} onClose={(event, reason) => {}} fullWidth={true} maxWidth={'md'} sx={{zIndex:'auto'}} PaperProps={{ elevation:6, sx: { borderRadius: 4, zIndex:0 } }}>
            <Stack direction={'row'} spacing={1} justifyContent={'space-between'} padding={2} alignItems={'center'}>
              <Typography variant={'h6'} sx={{paddingY:1}}>{languageData[language].ui.withdraw_title}</Typography>
              <IconButton aria-label={languageData[language].ui.close} onClick={handleClose}><ClearIcon /></IconButton>
            </Stack>
            <DialogContent>
              <Stack direction={'row'} spacing={6} justifyContent={'center'} alignItems={'start'} my={2} pb={10}>
                <Stack direction={'row'} spacing={1} justifyContent={'start'} alignItems={'center'}>
                  <Avatar alt={details.contract_name} src={metadata.logo} sx={{ border: metadata.defaultLogo ? 'solid 2px' : '' }} />
                  <Stack direction={'column'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{ color: 'text.primary', display: 'inline', fontWeight: 'bold' }}
                    >
                      {details.contract_name}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: 'text.secondary', display: 'inline' }}
                    >
                      {truncateEthAddress(details.contract_address)}
                    </Typography>
                  </Stack>
                </Stack>
                
                <AmountInput max={totalAmount} decimals={metadata.decimals} quote={currentValue} onChange={onAmountChange} />
              </Stack>
              <Stack direction={'row'} spacing={1} justifyContent={'space-between'} alignItems={'center'}>
                <AccountButton />
                { <Chip label={languageData[language].App.sign_message_title} disabled={amount === 0 && user !== null} onClick={handleFormSubmit} color={'primary'} sx={{fontWeight: 'bold', px: 3, borderRadius: 25, }} /> }
              </Stack>
                
            </DialogContent>
            
        </Dialog>
    );
};

export default WithdrawTokenToWallet;
