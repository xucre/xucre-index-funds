import React from 'react';
import { Chip } from '@mui/material';
import { InvoiceStatuses } from '@/service/types'; // Adjust the import path as needed

interface InvoiceStatusProps {
    status: InvoiceStatuses;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ status }) => {
    let color: 'default' | 'error' | 'primary' | 'info' | 'secondary' = 'default';

    switch (status) {
        case InvoiceStatuses.Paid:
            color = 'primary';
            break;
        case InvoiceStatuses.Disbursed:
            color = 'primary';
            break;
        case InvoiceStatuses.New:
            color = 'info';
            break;
        case InvoiceStatuses.Cancelled:
            color = 'error';
            break;
        case InvoiceStatuses.Draft:
        default:
            color = 'default';
            break;
    }

    return <Chip label={status} color={color} sx={{color: 'initial', fontWeight: 'bold'}} />;
};

export default InvoiceStatus;