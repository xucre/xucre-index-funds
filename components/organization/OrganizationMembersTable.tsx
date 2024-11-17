
import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography, IconButton, Stack, Dialog } from '@mui/material';
import { getOrganizationMembers, removeUserFromOrganization } from '../../service/clerk';
import { useOrganization } from '@clerk/nextjs';
import { OrganizationMembership } from '@clerk/backend';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateUserModal from './CreateUserModal';

const OrganizationMembersTable: React.FC = () => {
  const { organization } = useOrganization();
  const [members, setMembers] = useState([] as OrganizationMembership[]);
  const [selectedMember, setSelectedMember] = useState(null as OrganizationMembership | null);
  const [modalOpen, setModalOpen] = useState(false);

  const getMembers = async () => {
    if (!organization) return;
    const members2 = await getOrganizationMembers(organization.id);
    setMembers(members2.data);
  }

  useEffect(() => {
    if (organization) {
        getMembers()
    }
  }, [organization]);

  const handleRemoveClick = (member) => {
    const currentMember = members.find((m) => m.id === member.id);
    if (!currentMember) return;
    setSelectedMember(currentMember);
    setModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedMember && selectedMember.publicUserData && organization) {
      await removeUserFromOrganization(selectedMember.publicUserData.userId, organization.id);
        //   setMembers(members.filter((m) => m.userId !== selectedMember.userId));
      setModalOpen(false);
      getMembers()
    }
  };
  const rows = members.map((member) => {
    return {
      id: member.id,
      userId: member.publicUserData ? member.publicUserData.userId : '',
      identifier: member.publicUserData ? member.publicUserData.identifier : '',
    };
  });
  const columns: GridColDef[] = [
    { field: 'userId', headerName: 'User ID', flex:2, headerClassName: 'primaryBackground--header'},
    { field: 'identifier', headerName: 'Email', flex: 2, headerClassName: 'primaryBackground--header'},
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'primaryBackground--header',
      renderCell: (params: GridRenderCellParams) => (
        <IconButton onClick={() => handleRemoveClick(params.row)}>
          <DeleteIcon />
        </IconButton>
      ),
    }
  ];

  return (
    <Box width={'100%'} sx={{
        '& .primaryBackground--header': {
          backgroundColor: 'rgb(5,46,37)',
          '--DataGrid-containerBackground' : 'rgb(5,46,37)',
          '--DataGrid-pinnedBackground' : 'rgb(5,46,37)'
        },
    }}>
      <Stack direction="row" alignItems={'end'} justifyContent={'end'} spacing={1} sx={{ mb: 1 }}>
        <CreateUserModal />
      </Stack>
      <DataGrid rows={rows} rowSelection={false} columns={columns} getRowId={(row) => row.id} />
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <>
        {selectedMember && selectedMember.publicUserData &&
            <Box>
            <Typography variant="h5">{selectedMember.publicUserData.identifier}</Typography>
            <Typography>Are you sure you want to remove this user?</Typography>
            <Button variant="contained" color="error" onClick={handleConfirmRemove}>
            Yes
            </Button>
            <Button variant="contained" onClick={() => setModalOpen(false)}>
            No
            </Button>
            </Box>
        }
        </>
      </Dialog>
    </Box>
  );
};

export default OrganizationMembersTable;