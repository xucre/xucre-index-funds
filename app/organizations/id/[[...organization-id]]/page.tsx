'use client'
import { useParams, useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Button, Modal, Typography, useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { getOrganization, getOrganizationMembers, updateOrganizationMetadata } from "@/service/clerk";
import { OrganizationUserData } from "@/service/types";
import UserDetails from "@/components/admin/UserDetails";
import EditOrganization from "@/components/admin/EditOrganization";
import { Organization } from "@clerk/backend";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

const OrganizationDetails: React.FC = () => {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isConnected, address, chainId } = useAccount();
  const params = useParams();
  const organizationId = params['organization-id'] as string;
  const [organization, setOrganization] = useState(null as Organization | null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null as OrganizationUserData | null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const org = await getOrganization(organizationId);
      setOrganization(org);

      const orgMembers = await getOrganizationMembers(organizationId);
      setMembers(orgMembers.data.map((member: any) => ({
          id: member.publicUserData.userId,
          firstName: member.publicUserData.firstName,
          lastName: member.publicUserData.lastName,
          emailAddress: member.publicUserData.identifier,
      } as OrganizationUserData)));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!organizationId) return;

    fetchData();
  }, [organizationId]);

  const handleViewMember = (member: any) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setModalOpen(false);
  };

  const memberColumns: GridColDef[] = [
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'lastName', headerName: 'Last Name', flex: 1 },
    { field: 'emailAddress', headerName: 'Email', flex: 1 },
    {
      field: 'view',
      headerName: 'View',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button variant="contained" onClick={() => handleViewMember(params.row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      {organization && (
        <OpaqueCard>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent={'space-between'}>
            <>
              <Typography variant="h5">{organization.name}</Typography>
              <Typography variant="body1">ID: {organization.id}</Typography>
              <Typography variant="body1">
                Max Members: {organization.maxAllowedMemberships}
              </Typography>
            </>
            <EditOrganization
              publicMetadata={JSON.stringify(organization.publicMetadata)}
              save={async (updatedMetadata: string) => {
                await updateOrganizationMetadata(organizationId, updatedMetadata);
                fetchData();
              }} />
          </Stack>
          {/* Additional organization details */}
        </OpaqueCard>
      )}

      <Box mt={4}>
        <OpaqueCard>
          <Typography variant="h6" gutterBottom>
            Organization Members
          </Typography>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={members}
              columns={memberColumns}
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
        </OpaqueCard>
      </Box>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedMember && (
            <UserDetails {...selectedMember} />
          )}

          <Button variant="contained" onClick={handleCloseModal} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default OrganizationDetails;