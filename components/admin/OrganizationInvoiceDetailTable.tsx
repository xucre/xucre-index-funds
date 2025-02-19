import React, { useEffect, useState } from 'react';
import { getOrganizationMembers } from '@/service/clerk';
import { getUserDetails, getSafeAddress, getOrganizationSettings } from '@/service/db';
import { OrganizationMembership } from '@clerk/backend';
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Box, Chip, Fade, Stack, Typography } from '@mui/material';
import { InvoiceMember, ToleranceLevels } from '@/service/types';
import languageData from '@/metadata/translations'
import { useLanguage } from '@/hooks/useLanguage';
import SaveIcon from '@mui/icons-material/Save';
import { useClerkOrganization } from '@/hooks/useClerkOrganization';

interface OrganizationInvoiceDetailTableProps {
  members: InvoiceMember[];
}


const OrganizationInvoiceDetailTable = ({members} : OrganizationInvoiceDetailTableProps) => {
  const { language } = useLanguage();


  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport printOptions={{
          hideFooter: true,
          hideToolbar: true,
        }}/>
      </GridToolbarContainer>
    );
  }
  return (
    <Box sx={{
      '& .primaryBackground--header': {
        backgroundColor: 'rgb(5,46,37)',
        '--DataGrid-containerBackground' : 'rgb(5,46,37)',
        '--DataGrid-pinnedBackground' : 'rgb(5,46,37)'
      },
    }}>
      <DataGrid
        rows={members}
        rowSelection={false}
        sx={{ width: '100%', mb: 10 }}
        slots={{ toolbar: CustomToolbar }}
        columns={[
          { field: 'id', headerName: languageData[language].Invoice.detail_table_column_id, flex:1, headerClassName: 'primaryBackground--header' },
          { field: 'email', headerName: languageData[language].Invoice.detail_table_column_email, flex:1, headerClassName: 'primaryBackground--header' },
          { field: 'firstName', headerName: languageData[language].Invoice.detail_table_column_first, flex:1, headerClassName: 'primaryBackground--header' },
          { field: 'lastName', headerName: languageData[language].Invoice.detail_table_column_last, flex:1, headerClassName: 'primaryBackground--header' },
          { field: 'salaryContribution', headerName: languageData[language].Invoice.detail_table_column_amount, flex:0.5, editable: false, headerClassName: 'primaryBackground--header' },
          { field: 'organizationContribution', headerName: languageData[language].Invoice.detail_table_column_amount_employer, flex:0.5, editable: false, headerClassName: 'primaryBackground--header' },
          { field: 'safeWalletAddress', headerName: languageData[language].Invoice.detail_table_column_wallet, flex:2, headerClassName: 'primaryBackground--header' },
        ]}        
      />
    </Box>
  );
};

export default OrganizationInvoiceDetailTable;