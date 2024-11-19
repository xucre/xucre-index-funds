
import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import OpaqueCard from '../ui/OpaqueCard';
import { Invoice, InvoiceStatuses } from '@/service/types';
import InvoiceStatus from './InvoiceStatus';
import { useRouter } from 'next/navigation';
import { CreateInvoiceOptions, createInvoiceTransaction } from '@/service/safe';
import { useOrganization } from '@clerk/nextjs';
import { isDev } from '@/service/constants';
import { setInvoiceDetails } from '@/service/db';

interface InvoiceDetailProps {
  invoice: Invoice;
  usdcBalance: number | null;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, usdcBalance }) => {
    const router = useRouter();
    const {organization} = useOrganization();
    const handleFundClick = () => {
       router.push(`/billing/${invoice.id}/pay`);
    };
    const handleDisburseClick = async () => {
        if (!organization) return;
        //createInvoiceTransaction
        try {
            const txDetails = {
                rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
                owner: '',
                chainid: isDev ? 1155111: 137,
                id: organization.id,
                invoice
            } as CreateInvoiceOptions;
            const transactionHash = await createInvoiceTransaction(txDetails);
            console.log('Transaction Hash:', transactionHash);
            if (transactionHash !== '') {
                const _invoice = {
                    ...invoice,
                    status: InvoiceStatuses.Disbursed,
                    paymentTransction: transactionHash,
                    updatedAt: new Date().toISOString()
                }
                await setInvoiceDetails(organization.id, _invoice.id, _invoice);
                router.refresh()
            }
        } catch (err) {
            console.log(err.reason);
            return;
        }
        
    }
    const canDisburse = invoice.status === InvoiceStatuses.New && usdcBalance && usdcBalance >= invoice.totalDue;
    return (
        <OpaqueCard>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Stack direction={'column'} spacing={1}>
            <Typography variant="h6">Invoice Details</Typography>
            <Box sx={{maxWidth: 100}}><InvoiceStatus status={invoice.status} /></Box>
            <Typography>Escrow Wallet: {invoice.escrowWallet}</Typography>
            <Typography>Total Due: ${invoice.totalDue}</Typography>
            <Typography>Escrow Amount Available: ${usdcBalance || 0}</Typography>
            </Stack>
            {!canDisburse && <Chip onClick={handleFundClick} color={'primary'} sx={{fontWeight: 'bold'}} label="Fund Disbursement" disabled={invoice.status != InvoiceStatuses.New} />}
            {canDisburse && <Chip onClick={handleDisburseClick} color={'primary'} sx={{fontWeight: 'bold'}} label="Disburse" disabled={invoice.status != InvoiceStatuses.New} />}
        </Box>
        </OpaqueCard>
    );
};

export default InvoiceDetail;