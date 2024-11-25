import React from 'react';
import { Chip } from '@mui/material';
import { InvoiceStatuses } from '@/service/types'; // Adjust the import path as needed

import languageData from '@/metadata/translations'
import { useLanguage } from '@/hooks/useLanguage';

interface InvoiceStatusProps {
    status: InvoiceStatuses;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ status }) => {
    const {language} = useLanguage();
    let color: 'default' | 'error' | 'primary' | 'info' | 'secondary' = 'default';
    let statusText = '';
    switch (status) {
        case InvoiceStatuses.Paid:
            color = 'primary';
            statusText = languageData[language].Invoice.status_paid;
            break;
        case InvoiceStatuses.Disbursed:
            color = 'primary';
            statusText = languageData[language].Invoice.status_disbursed;
            break;
        case InvoiceStatuses.New:
            color = 'info';
            statusText = languageData[language].Invoice.status_new;
            break;
        case InvoiceStatuses.Cancelled:
            color = 'error';
            statusText = languageData[language].Invoice.status_cancelled;
            break;
        case InvoiceStatuses.Draft:
        default:
            color = 'default';
            statusText = languageData[language].Invoice.status_draft;
            break;
    }

    return <Chip label={statusText} color={color} sx={{color: 'initial', fontWeight: 'bold'}} />;
};

export default InvoiceStatus;