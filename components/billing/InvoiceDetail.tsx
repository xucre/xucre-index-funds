
import React, { useState } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import OpaqueCard from '../ui/OpaqueCard';
import { Invoice, InvoiceStatuses } from '@/service/types';
import InvoiceStatus from './InvoiceStatus';
import { useRouter } from 'next/navigation';
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import DisbursementModal from './DisbursementModal';
import { useClerkOrganization } from '@/hooks/useClerkOrganization';

interface InvoiceDetailProps {
  invoice: Invoice;
  usdcBalance: number | null;
  reload: Function;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, usdcBalance, reload }) => {
    const router = useRouter();
    const {organization, userMemberships} = useClerkOrganization();
    const {language} = useLanguage();
    const [loading, setLoading] = useState(false);
    const [openDisbursement, setOpenDisbursement] = useState(false);
    const handleFundClick = () => {
       router.push(`/billing/${invoice.id}/pay`);
    };
    const handleDisburseClick = async () => {
        if (!organization) return;
        setOpenDisbursement(true);        
    }

    const handleDisburseClose = () => {setOpenDisbursement(false); reload();};

    const canDisburse = invoice.status === InvoiceStatuses.New && usdcBalance && usdcBalance >= invoice.totalDue;
    
    return (
        <>
            <OpaqueCard>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction={'column'} spacing={1}>
                    <Typography variant="h6">{languageData[language].Invoice.detail_title}</Typography>
                    <Box sx={{maxWidth: 100}}><InvoiceStatus status={invoice.status} /></Box>
                    <Typography>{languageData[language].Invoice.escrow_wallet}{invoice.escrowWallet}</Typography>
                    <Typography>{languageData[language].Invoice.total_due}{invoice.totalDue}</Typography>
                    <Typography>{languageData[language].Invoice.escrow_amount}{usdcBalance || 0}</Typography>
                    </Stack>
                    {!canDisburse && <Chip onClick={handleFundClick} color={'primary'} sx={{fontWeight: 'bold'}} label={languageData[language].Invoice.fund_button} disabled={invoice.status != InvoiceStatuses.New} />}
                    {canDisburse && !loading && <Chip onClick={handleDisburseClick} color={'primary'} sx={{fontWeight: 'bold'}} label={languageData[language].Invoice.disburse_button} disabled={invoice.status != InvoiceStatuses.New}/>}
                    {canDisburse && loading && <Chip color={'primary'} sx={{fontWeight: 'bold'}} label={languageData[language].Invoice.executing_label} />}
                </Box>
            </OpaqueCard>
            <DisbursementModal adminUsers={userMemberships} open={openDisbursement} closeFunction={handleDisburseClose} invoice={invoice} organizationId={organization?.id || ''}/>
        </>
    );
};

export default InvoiceDetail;