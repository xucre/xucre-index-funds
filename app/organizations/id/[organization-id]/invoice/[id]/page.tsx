'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Button, Snackbar, Stack, Typography } from '@mui/material';
import { createInvoice } from '@/service/billing/stripe';
import { Invoice, InvoiceStatuses } from '@/service/types';
import InvoiceDetail from '@/components/billing/InvoiceDetail';
import { useClerkOrganization } from '@/hooks/useClerkOrganization';
import { useEscrowBalance } from '@/hooks/useEscrowBalance';
import { useLanguage } from '@/hooks/useLanguage';
import languageData from '@/metadata/translations';
import { getInvoiceDetails } from '@/service/db';
import OrganizationInvoiceDetail from '@/components/admin/OrganizationInvoiceDetail';

const OrganizationInvoicePage = () => {
    const params = useParams();
    const organizationId = params['organization-id'] as string;
    const { language } = useLanguage();
    const { balance: usdcBalance, refresh } = useEscrowBalance(organizationId ? organizationId : '');
    const invoiceId = params['id'] as string;
    const [invoiceDetails, setInvoiceDetails] = useState<Invoice | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const fetchInvoiceDetails = async () => {
        if (!organizationId) return;
        try {
            const details = (await getInvoiceDetails(organizationId, invoiceId)) as Invoice;
            
            setInvoiceDetails(details);
        } catch (err) {
            console.error('Failed to fetch invoice details:', err);
        }
    };

    useEffect(() => {        
        fetchInvoiceDetails();
    }, [organizationId, invoiceId]);

    const handleCreateInvoice = async () => {
        if (!organizationId) return;
        try {
            //await createInvoice(organizationId, invoiceId);
            setSnackbarMessage('Invoice created successfully');
            setSnackbarOpen(true);
        } catch (err) {
            console.error('Failed to create invoice:', err);
            setSnackbarMessage('Failed to create invoice');
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box py={4}>
        {invoiceDetails ? (
            <Stack direction="column" spacing={2}>
                <OrganizationInvoiceDetail invoice={invoiceDetails} usdcBalance={usdcBalance} reload={() => {fetchInvoiceDetails()}} organizationId={organizationId}/>
            </Stack>
        ) : (
            <Typography>{languageData[language].Invoice.loading}</Typography>
        )}
        
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
        />
        </Box>
    );
};

export default OrganizationInvoicePage;