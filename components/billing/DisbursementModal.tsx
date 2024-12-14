import React, { useState, useEffect } from 'react';
// ...existing imports...
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemIcon, ListItemText, Button, CircularProgress, Chip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useOrganization } from '@clerk/nextjs';
import { IndexFund, Invoice, InvoiceStatuses } from '@/service/types';
import { isDev } from '@/service/constants';
import { CreateInvoiceOptions, createInvoiceTransaction, createInvoiceTransactionV2, executeUserSpotExecution } from '@/service/safe';
import { getAllFunds, getFundDetails, setInvoiceDetails } from '@/service/db';
import { useLanguage } from '@/hooks/useLanguage';

interface DisbursementModalProps {
    invoice: Invoice;
    open: boolean;
    closeFunction: any;
}
const DisbursementModal: React.FC<DisbursementModalProps> = ({ invoice, open, closeFunction }) => {
    const {language, languageData} = useLanguage();
    const {organization} = useOrganization();
    // ...existing code...
    const [steps, setSteps] = useState({
        disbursing: 'pending',
        executing: 'pending',
    });
    const [currentCount, setCurrentCount] = useState(0);
    const totalCount = invoice.members.length; // Replace with actual total count
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
        if (!organization) {
            setSteps(prev => ({ ...prev, disbursing: 'error' }));
            setIsCloseEnabled(true);
            return;
        }
        setSteps(prev => ({ ...prev, disbursing: 'loading' }));
        try {
            const txDetails = {
                rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
                owner: '',
                chainid: isDev ? 1155111: 137,
                id: organization.id,
                invoice,
                safeAddress: invoice.escrowWallet
            } as CreateInvoiceOptions;
            const transactionHash = await createInvoiceTransaction(txDetails);
            if (transactionHash !== '') {
                const _invoice = {
                    ...invoice,
                    status: InvoiceStatuses.Disbursed,
                    paymentTransction: transactionHash,
                    updatedAt: new Date().toISOString()
                }
                await setInvoiceDetails(organization.id, _invoice.id, _invoice);
                
                //setTimeout(() => {
                setSteps(prev => ({ ...prev, disbursing: 'success' }));
                handleExecuteTransactions();
                //}, 10000)                
            } else {
                setSteps(prev => ({ ...prev, disbursing: 'error' }));
                setIsCloseEnabled(true);
            }
        } catch (error) {
            setSteps(prev => ({ ...prev, disbursing: 'error' }));
            setIsCloseEnabled(true);
        }
    };

    const handleExecuteTransactions = async () => {
        setSteps(prev => ({ ...prev, executing: 'loading' }));
        
            // Get funds per risk tolerance
            const funds = await getAllFunds(isDev ? 1155111: 137);
            const fundDetailList = await Promise.all( funds.map(async (fund) => {
                return await getFundDetails(isDev ? 1155111: 137, fund);
            }));
            const fundMap = fundDetailList.reduce((acc, fund) => {
                if (!fund.toleranceLevels || fund.toleranceLevels.length === 0) return acc;
                acc[fund.toleranceLevels[0]] = fund;
                return acc;
            }, {} as {[key: string]: IndexFund});
            
            // Execute user transactions and update currentCount
            await Promise.all(invoice.members.map(async (member) => {
                try {
                  console.log(member)
                    if (member.salaryContribution < .1) {
                        setCurrentCount(prev => prev + 1);
                        return;
                    }
                    await executeUserSpotExecution(member, process.env.NEXT_PUBLIC_SAFE_RPC_URL as string, isDev ? 1155111: 137, invoice.id, fundMap);
                    setCurrentCount(prev => prev + 1);
                    return;
                } catch (err) {
                    console.log('error executing spot for member', member.safeWalletAddress)}
                    return;
                }
            ));
            setSteps(prev => ({ ...prev, executing: 'success' }));
            setIsCloseEnabled(true);
        // } catch (error) {
        //     setSteps(prev => ({ ...prev, executing: 'error' }));
        // } finally {
        //     setIsCloseEnabled(true);
        // }
    };

    const getIcon = (status) => {
        if (status === 'loading') return <CircularProgress size={24} />;
        if (status === 'success') return <CheckCircleIcon color="success" />;
        if (status === 'error') return <ErrorIcon color="error" />;
        return null;
    };

    return (
        <Dialog open={open} onClose={(event, reason) => {}} fullWidth={true} maxWidth={'md'} >
            <DialogTitle>Processing Disbursement</DialogTitle>
            <DialogContent>
                <Stack direction={'column'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                    <List>
                        <ListItem>
                            <ListItemIcon>{getIcon(steps.disbursing)}</ListItemIcon>
                            <ListItemText primary="Disbursing USDT to users" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>{getIcon(steps.executing)}</ListItemIcon>
                            <ListItemText
                            primary={`Executing user transactions ${
                                `${currentCount}/${totalCount}`
                            }`}
                            />
                        </ListItem>
                    </List>
                </Stack>
                <Stack direction={'row'} spacing={1} justifyContent={'end'} alignItems={'center'}>
                    <Chip label={languageData[language].ui.close} disabled={!isCloseEnabled} onClick={handleClose} color={'primary'} sx={{fontWeight: 'bold', px: 3, borderRadius: 25, }} />
                </Stack>
                
            </DialogContent>
            
        </Dialog>
    );
};

export default DisbursementModal;
