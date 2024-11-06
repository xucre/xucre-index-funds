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
import { useUser } from "@clerk/nextjs";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


// OrganizationsTable.tsx
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import OpaqueCard from '@/components/ui/OpaqueCard';
import { getAllOrganizations } from "@/service/clerk";

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
  const {user} = useUser();
  const { language } = useLanguage();
  const { isConnected, address, chainId } = useAccount();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await getAllOrganizations();
        setOrganizations(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Organization Name', flex: 1, headerClassName: 'transparent--header', },
    { field: 'slug', headerName: 'Slug', flex: 1, headerClassName: 'transparent--header', },
    { field: 'maxAllowedMemberships', headerName: 'Max Members', flex: 1, headerClassName: 'transparent--header', },
    {
      field: 'view',
      headerName: '',
      sortable: false,
      headerClassName: 'transparent--header',
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
            '& .super-app-theme--header': {
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-columnHeaders > first-child': {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Box>
    </OpaqueCard>
  );
};

export default OrganizationsTable;