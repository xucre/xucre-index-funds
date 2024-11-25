import React, { useEffect, useState } from 'react';
import { getAllOrganizationInvoices, getInvoiceDetails } from '@/service/db';
import { useOrganization } from '@clerk/nextjs';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
import languageData from '@/metadata/translations';
import { useLanguage } from '@/hooks/useLanguage';
import { Invoice } from '@/service/types';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

const InvoiceTable = () => {
  const { organization } = useOrganization();
  const [invoices, setInvoices] = useState([] as Invoice[]);
  const { language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!organization) return;
      const invoiceIds = await getAllOrganizationInvoices(organization.id);
      const invoicePromises = invoiceIds.map(async (invoiceId: string) => {
        const invoiceData = await getInvoiceDetails(organization.id, invoiceId);
        return { ...invoiceData } as Invoice;
      });
      const invoicesData = await Promise.all(invoicePromises);
      setInvoices(invoicesData);
    };
    fetchInvoices();
  }, [organization]);

  return (
    <Box sx={{
      // ...existing code...
      '& .primaryBackground--header': {
        backgroundColor: 'rgb(5,46,37)',
        '--DataGrid-containerBackground': 'rgb(5,46,37)',
        '--DataGrid-pinnedBackground': 'rgb(5,46,37)'
      },
    }}>
      <DataGrid
        rows={invoices}
        rowSelection={false}
        sx={{ width: '100%', mb: 10 }}
        columns={[
          // ...existing code...
          { field: 'id', headerName: languageData[language].Invoice.table_header_id, flex: 2, headerClassName: 'primaryBackground--header' },
          { field: 'status', headerName: languageData[language].Invoice.table_header_status, flex: 1, headerClassName: 'primaryBackground--header' },
          { field: 'dueDate', headerName: languageData[language].Invoice.table_header_due_date, flex: 1, headerClassName: 'primaryBackground--header' },
          { field: 'totalDue', headerName: languageData[language].Invoice.table_header_total_due, flex: 1, headerClassName: 'primaryBackground--header' },
          { field: 'createdAt', headerName: languageData[language].Invoice.table_header_created_at, flex: 1, headerClassName: 'primaryBackground--header',

            renderCell: (params) => (
              <span>{dayjs(params.row.createdAt).format('L')}</span>
            )
          },
          {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            headerClassName: 'primaryBackground--header',
            renderCell: (params) => (
              <IconButton onClick={() => router.push(`/billing/${params.row.id}`)}>
                <ArrowForwardIcon />
              </IconButton>
            ),
          },
        ]}
      />
    </Box>
  );
};

export default InvoiceTable;
