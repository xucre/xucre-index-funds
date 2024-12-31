import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, IconButton, ListItemButton, Stack, Typography, Box } from '@mui/material';
import { delFundDetails, getAllFunds, getFundDetails, setFundDetails } from '@/service/db';
import { v4 as uuidv4 } from 'uuid';
import { IndexFund } from '@/service/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useParams, useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { globalChainId } from '@/service/constants';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

const FundList = () => {
    const router = useRouter();
    const {language} = useLanguage();
    const [funds, setFunds] = useState([] as IndexFund[]);
    const params = useParams();
    const fundId = params['id'] as string;
    const columns: GridColDef[] = [
      { 
        field: 'name', 
        headerName: 'Fund Name', 
        flex: 1, 
        headerClassName: 'primaryBackground--header', 
        renderCell: (params: GridRenderCellParams) => (params.row.name[language])},
      { field: 'toleranceLevels', headerName: 'Tolerance', flex: 1, headerClassName: 'primaryBackground--header', renderCell: (params: GridRenderCellParams) => (params.row.toleranceLevels ? params.row.toleranceLevels[0] : 'None')},
      { field: 'portfolio', headerName: 'Token Count', flex: 1, headerClassName: 'primaryBackground--header', renderCell: (params: GridRenderCellParams) => (params.row.portfolio.length)},
      {
        field: 'view',
        headerName: '',
        sortable: false,
        headerClassName: 'primaryBackground--header',
        renderCell: (params: GridRenderCellParams) => (
          <IconButton 
            aria-label={params.row.name}
            onClick={() => router.push(`/index-manager/${params.row.id}`)}
          >
            <ArrowForwardIcon />
          </IconButton>
        ),
      },
    ];
    useEffect(() => {
        const fetchFunds = async () => {
        const fundIds = await getAllFunds(globalChainId);
        const fundDetails = await Promise.all(
            fundIds.map(async (id) => {
                const details = await getFundDetails(globalChainId, id);
                return { id, ...details };
            })
        );
        setFunds(fundDetails);
        };
        fetchFunds();
    }, []);

    return (
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={funds}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25]}
          getRowId={(row) => row.id}
        />
      </Box>
        // <Stack direction={'column'} spacing={2}>
        //     {funds.map((fund) => (
        //         <ListItemButton component={ListItem} key={fund.id} onClick={() => router.push(`/index-manager/${fund.id}`)} selected={fundId === fund.id} sx={{px:3, py:1}}>
        //             <ListItemText primary={fund.name[language]} />
        //         </ListItemButton>
        //     ))}
        // </Stack>
    );
};

export default FundList;
