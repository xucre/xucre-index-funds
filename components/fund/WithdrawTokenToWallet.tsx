import React, { useState, useEffect } from 'react';
// ...existing imports...
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemIcon, ListItemText, Button, CircularProgress, Chip, Stack, Typography, Avatar, TextField, Slider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useOrganization } from '@clerk/nextjs';
import { IndexFund, Invoice, InvoiceStatuses, TokenDetails } from '@/service/types';
import truncateEthAddress from 'truncate-eth-address';
import { globalChainId, isDev } from '@/service/constants';
import { CreateInvoiceOptions, createInvoiceTransaction, createInvoiceTransactionV2, executeUserSpotExecution } from '@/service/safe';
import { getAllFunds, getFundDetails, setInvoiceDetails } from '@/service/db';
import { useLanguage } from '@/hooks/useLanguage';
import { Item } from '@/hooks/useWalletData';
import { useAccount } from 'wagmi';
import AccountButton from '../accountButton';
import AmountInput from '../ui/AmountInput';

interface WithdrawTokenToWalletProps {
    details: Item;
    metadata: TokenDetails;
    open: boolean;
    closeFunction: any;
}
const WithdrawTokenToWallet: React.FC<WithdrawTokenToWalletProps> = ({ details, metadata, open, closeFunction }) => {
    const {language, languageData} = useLanguage();
    const {organization} = useOrganization();
    const {address, isConnected} = useAccount();
    const [steps, setSteps] = useState({
        disbursing: 'pending',
        executing: 'pending',
    });
    const [currentCount, setCurrentCount] = useState(0);
    const [isCloseEnabled, setIsCloseEnabled] = useState(false);

    useEffect(() => {
        if (open) {
            handleDisburseFunds();
            //handleExecuteTransactions();
        }
    }, [open]);

    const handleClose = () => {
        setSteps({
            disbursing: 'pending',
            executing: 'pending',
        })
        setCurrentCount(0);
        setIsCloseEnabled(false);
        closeFunction();
    }

    const handleDisburseFunds = async () => {
    };

    const getIcon = (status) => {
        if (status === 'loading') return <CircularProgress size={24} />;
        if (status === 'success') return <CheckCircleIcon color="success" />;
        if (status === 'error') return <ErrorIcon color="error" />;
        return null;
    };
    const currentValue = details.holdings[0].quote_rate;
    const totalAmount = details.holdings[0].close.quote;
    console.log('currentValue', currentValue, totalAmount);
    return (
        <Dialog open={open} onClose={(event, reason) => {}} fullWidth={true} maxWidth={'md'} sx={{zIndex:'auto'}} PaperProps={{ elevation:6, sx: { borderRadius: 4, zIndex:0 } }}>
            <Stack direction={'row'} spacing={1} justifyContent={'space-between'} padding={2} alignItems={'center'}>
              <Typography variant={'h6'} sx={{paddingY:1}}>{'Withdraw Token'}</Typography>
              <AccountButton />
            </Stack>
            <DialogContent>
              <Stack direction={'row'} spacing={1} justifyContent={'space-between'} alignItems={'center'}>
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
                <AmountInput max={totalAmount} decimals={metadata.decimals} quote={currentValue} onChange={function (value: number): void {
                  throw new Error('Function not implemented.');
                } } />
              </Stack>
              <Stack direction={'row'} spacing={1} justifyContent={'end'} alignItems={'center'}>
                  <Chip label={languageData[language].ui.close} onClick={handleClose} color={'primary'} sx={{fontWeight: 'bold', px: 3, borderRadius: 25, }} />
              </Stack>
                
            </DialogContent>
            
        </Dialog>
    );
};

export default WithdrawTokenToWallet;
