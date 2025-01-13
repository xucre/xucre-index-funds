
import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography, IconButton, Stack, Dialog } from '@mui/material';
import { getOrganizationMembers, removeUserFromOrganization } from '../../service/clerk';
import { OrganizationMembership } from '@clerk/backend';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateUserModal from './CreateUserModal';
import { useLanguage } from '@/hooks/useLanguage';
import languageData from '@/metadata/translations';
import { useClerkOrganization } from '@/hooks/useClerkOrganization';

const OrganizationMembersTable: React.FC = () => {
  const {language} = useLanguage();
  const { organization } = useClerkOrganization();
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
    { field: 'userId', headerName: languageData[language].Organization.organization_member_table_user_id, flex:2, headerClassName: 'primaryBackground--header'},
    { field: 'identifier', headerName: languageData[language].Organization.organization_member_table_email, flex: 2, headerClassName: 'primaryBackground--header'},
    {
      field: 'actions',
      headerName: languageData[language].Organization.organization_member_table_actions,
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
            <Typography>{languageData[language].Organization.organization_member_table_remove_question}</Typography>
            <Button variant="contained" color="error" onClick={handleConfirmRemove}>
              {languageData[language].ui.yes}
            </Button>
            <Button variant="contained" onClick={() => setModalOpen(false)}>
              {languageData[language].ui.no}
            </Button>
            </Box>
        }
        </>
      </Dialog>
    </Box>
  );
};

export default OrganizationMembersTable;