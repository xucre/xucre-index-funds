
import React, { use, useEffect, useState } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import OpaqueCard from '../ui/OpaqueCard';
import { Invoice, InvoiceStatuses } from '@/service/types';
import InvoiceStatus from '../billing/InvoiceStatus';
import { useRouter } from 'next/navigation';
import { isDev } from '@/service/constants';
import { setInvoiceDetails } from '@/service/db';
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import DisbursementModal from '../billing/DisbursementModal';
import { useClerkOrganization } from '@/hooks/useClerkOrganization';
import OrganizationInvoiceDetailTable from './OrganizationInvoiceDetailTable';
import { createCustomer, createInvoice, getCustomer, getInvoice } from '@/service/billing/stripe';
import { getOrganization, getOrganizationMembers } from '@/service/clerk';
import { Organization } from '@clerk/backend';
import { useSnackbar } from 'notistack';

interface OrganizationInvoiceDetailProps {
  invoice: Invoice;
  usdcBalance: number | null;
  reload: Function;
  organizationId: string;
}

const OrganizationInvoiceDetail: React.FC<OrganizationInvoiceDetailProps> = ({ invoice, usdcBalance, reload, organizationId }) => {
    const router = useRouter();
    const {language} = useLanguage();
    const [loading, setLoading] = useState(false);
    const [openDisbursement, setOpenDisbursement] = useState(false);
    const [organization, setOrganization] = useState(null as Organization | null);
    const [invoiceCreated, setInvoiceCreated] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    const fetchData = async () => {
        try {
            const org = await getOrganization(organizationId);
            setOrganization(org);

            const _invoice = await getInvoice(invoice.id);
            console.log('stripe invoice:', _invoice);
            if (_invoice) {
                setInvoiceCreated(true);
            } else {
                setInvoiceCreated(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleStripeInvoiceClick = async () => {
       try {
            if (!organization) throw new Error('Organization not found');

            setLoading(true);
            const customer = await getCustomer(organizationId);
            let customerId;
            if (!customer) {
                const orgMembers = await getOrganizationMembers(organizationId);
                const owner = orgMembers.data.find(m => m.role === 'org:admin');
                customerId = await createCustomer(organization.name, owner.email, organizationId);
            } else {
                customerId = customer.id;
            }
            await createInvoice(customerId, invoice.id, invoice.members, invoice.totalDue);
            setLoading(false);
            fetchData();
            enqueueSnackbar('Invoice created successfully!', { variant: 'success' });
       } catch (error) {
              console.error('Error creating invoice:', error);
              enqueueSnackbar('Failed to create invoice', { variant: 'error' });
       }
    }

    const handleDisburseClick = async () => {
        if (!organizationId) return;
        setOpenDisbursement(true);        
    }

    const handleDisburseClose = () => {setOpenDisbursement(false); reload();};

    useEffect(() => {
        if (!organizationId) return;
        fetchData();
    }, [organizationId]);

    const canDisburse = invoice.status === InvoiceStatuses.New && usdcBalance && usdcBalance >= invoice.totalDue;
    
    return (
        <>
            <OpaqueCard>
                <Stack direction={'column'} spacing={4}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction={'column'} spacing={1}>
                        <Typography variant="h6">{languageData[language].Invoice.detail_title}</Typography>
                        <Box sx={{maxWidth: 100}}><InvoiceStatus status={invoice.status} /></Box>
                        <Typography>{languageData[language].Invoice.escrow_wallet}{invoice.escrowWallet}</Typography>
                        <Typography>{languageData[language].Invoice.total_due}{invoice.totalDue}</Typography>
                        <Typography>{languageData[language].Invoice.escrow_amount}{usdcBalance || 0}</Typography>
                        </Stack>
                        {!canDisburse && !invoiceCreated && <Chip onClick={handleStripeInvoiceClick} color={'primary'} sx={{fontWeight: 'bold'}} label={loading? 'Loading' : 'Create Stripe Invoice'} disabled={invoice.status != InvoiceStatuses.New || loading} />}
                        {!canDisburse && invoiceCreated && <Chip color={'primary'} sx={{fontWeight: 'bold'}} label={'Stripe Invoice Created'} disabled={true} />}
                        {canDisburse && !loading && <Chip onClick={handleDisburseClick} color={'primary'} sx={{fontWeight: 'bold'}} label={languageData[language].Invoice.disburse_button} disabled={invoice.status != InvoiceStatuses.New}/>}
                        {canDisburse && loading && <Chip color={'primary'} sx={{fontWeight: 'bold'}} label={languageData[language].Invoice.executing_label} />}
                    </Box>

                    <OrganizationInvoiceDetailTable members={invoice.members} />
                </Stack>
                
            </OpaqueCard>
            <DisbursementModal adminUsers={[]} open={openDisbursement} closeFunction={handleDisburseClose} invoice={invoice} organizationId={organizationId ? organizationId : ''} />
        </>
    );
};

export default OrganizationInvoiceDetail;