
import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import OpaqueCard from '../ui/OpaqueCard';
import { Invoice, InvoiceStatuses } from '@/service/types';
import InvoiceStatus from './InvoiceStatus';
import { useRouter } from 'next/navigation';

interface InvoiceDetailProps {
  invoice: Invoice;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice }) => {
    const router = useRouter();
    const handleFundClick = () => {
       router.push(`/billing/${invoice.id}/pay`);
    };
    return (
        <OpaqueCard>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Stack direction={'column'} spacing={1}>
            <Typography variant="h6">Invoice Details</Typography>
            <Box sx={{maxWidth: 100}}><InvoiceStatus status={invoice.status} /></Box>
            <Typography>Escrow Wallet: {invoice.escrowWallet}</Typography>
            <Typography>Total Due: {invoice.totalDue}</Typography>
            <Typography>Total Paid: {invoice.totalPaid}</Typography>
            </Stack>
            <Chip onClick={handleFundClick} color={'primary'} sx={{fontWeight: 'bold'}} label="Fund Disbursement" disabled={invoice.status != InvoiceStatuses.New} />
        </Box>
        </OpaqueCard>
    );
};

export default InvoiceDetail;