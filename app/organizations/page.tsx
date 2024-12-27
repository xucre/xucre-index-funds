'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Button, IconButton, useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { v4 as uuidv4 } from 'uuid';


// OrganizationsTable.tsx
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import OpaqueCard from '@/components/ui/OpaqueCard';
import { getAllOrganizations } from "@/service/clerk";
//import { createAccount, CreateAccountOptions } from "@/service/safe";
import LoadingButton from "@mui/lab/LoadingButton";
import { useClerkUser } from "@/hooks/useClerkUser";

interface Organization {
  id: string;
  name: string;
  slug: string;
  maxAllowedMemberships: number;
  // Include other organization properties as needed
}

const OrganizationsTable: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const {user} = useClerkUser();
  const { language } = useLanguage();
  const { isConnected, address, chainId } = useAccount();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await getAllOrganizations();
        setOrganizations(response.data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);
  
  // const handleCreateManualSafe = async () => {
  //   setProcessing(true);
  //   const id = uuidv4();
  //   const callParams = {
  //     rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
  //     owner: '',
  //     threshold: 1,
  //     singleOwner: true,
  //     chainid: globalChainId,
  //     id,
  //   } as CreateAccountOptions;
  //   const safeAddress = await createAccount(callParams);

  //   setProcessing(false);
  // }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Organization Name', flex: 1, headerClassName: 'primaryBackground--header', },
    { field: 'slug', headerName: 'Slug', flex: 1, headerClassName: 'primaryBackground--header', },
    { field: 'maxAllowedMemberships', headerName: 'Max Members', flex: 1, headerClassName: 'primaryBackground--header', },
    {
      field: 'view',
      headerName: '',
      sortable: false,
      headerClassName: 'primaryBackground--header',
      renderCell: (params: GridRenderCellParams) => (
        <IconButton 
          aria-label={params.row.name}
          onClick={() => router.push(`/organizations/id/${params.row.id}`)}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <OpaqueCard>
      {/* <LoadingButton variant="contained" fullWidth onClick={handleCreateManualSafe} loading={processing} loadingIndicator={'Executing'} sx={{display: 'flex',my: 2}}>
      Create Manual Safe
      </LoadingButton> */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={organizations}
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
          sx={{    
            '& .primaryBackground--header': {
              backgroundColor: 'rgb(5,46,37)',
              '--DataGrid-containerBackground' : 'rgb(5,46,37)',
              '--DataGrid-pinnedBackground' : 'rgb(5,46,37)'
            },
          }}
        />
      </Box>
    </OpaqueCard>
  );
};

export default OrganizationsTable;