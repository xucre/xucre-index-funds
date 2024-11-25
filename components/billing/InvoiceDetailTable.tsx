import React, { useEffect, useState } from 'react';
import { getOrganizationMembers } from '@/service/clerk';
import { getUserDetails, getSafeAddress } from '@/service/db';
import { OrganizationMembership } from '@clerk/backend';
import { useOrganization } from '@clerk/nextjs';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip, Fade, Stack, Typography } from '@mui/material';
import { InvoiceMember } from '@/service/types';
import languageData from '@/metadata/translations'
import { useLanguage } from '@/hooks/useLanguage';
import SaveIcon from '@mui/icons-material/Save';

interface InvoiceDetailTableProps {
  existingMembers?: InvoiceMember[];
  saveMembers: (members: InvoiceMember[]) => void;
  showButtons: boolean;
}


const InvoiceDetailTable = ({existingMembers, saveMembers, showButtons} : InvoiceDetailTableProps) => {
  const {organization} = useOrganization();
  const [hasChanges, setHasChanges] = useState(false);
  const [members, setMembers] = useState([] as InvoiceMember[]);
  const [initialMembers, setInitialMembers] = useState([] as InvoiceMember[]);
  const { language } = useLanguage();

  const fetchMembers = async () => {
    if (!organization) return;
    const organizationMembers = (await getOrganizationMembers(organization.id)).data;
   
    const membersData = await organizationMembers.reduce(async (accumulator: InvoiceMember[], member: OrganizationMembership) => {
      if (!member.publicUserData) {
        return await accumulator;
      }
      const userDetails = await getUserDetails(member.publicUserData.userId);
      if (!userDetails) {
        return await accumulator;
      }
      const salaryContribution = userDetails?.salaryContribution || 0;
      const firstName = userDetails?.firstName || '';
      const lastName = userDetails?.lastName || '';
      const email = userDetails?.userEmail || '';
      const id = userDetails?.userId || '';
      const safeWalletAddress = await getSafeAddress(member.publicUserData.userId);
      const _accumulator = await accumulator;
      return [..._accumulator, {
        ...member,
        id,
        email,
        firstName,
        lastName,
        salaryContribution,
        safeWalletAddress,
      } as InvoiceMember]
    }, []);
    console.log(membersData);
    return membersData;
  };

  const executeSave = async () => {
    await saveMembers(members);
  }

  const cancelSave = () => {
    setMembers(initialMembers);
    setHasChanges(false);
  }

  useEffect(() => {
    const fetchData = async () => {
      console.log(existingMembers);
      if (existingMembers) {
        setMembers(existingMembers);
        setInitialMembers(existingMembers);
        return;
      }
      console.log('fetchingMembers')
      const data = await fetchMembers();
      setMembers(data);
    };
    fetchData();
  }, [existingMembers]);

  useEffect(() => {
    const hasChanges = JSON.stringify(members) !== JSON.stringify(initialMembers);
    setHasChanges(hasChanges);
  }, [members, initialMembers]); 

  return (
    <Box sx={{
      '& .primaryBackground--header': {
        backgroundColor: 'rgb(5,46,37)',
        '--DataGrid-containerBackground' : 'rgb(5,46,37)',
        '--DataGrid-pinnedBackground' : 'rgb(5,46,37)'
      },
    }}>
      {showButtons && 
        <>
          <Stack  direction="row" alignItems={'center'} justifyContent={'space-between'} spacing={1} sx={{mb:1}}>
          <Chip color={'secondary'} sx={{fontWeight: 'bold', px: 3, py: 1}} label={languageData[language].Invoice.detail_table_refresh_members} onClick={fetchMembers} />
            <Fade in={hasChanges}>
              <Stack  direction="row" alignItems={'center'} justifyContent={'end'} spacing={1} >
                <Chip color={'primary'}  sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={executeSave} label={languageData[language].ui.save} />
                <Chip color={'error'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={cancelSave} label={languageData[language].ui.cancel} />
              </Stack>
            </Fade>
            
          </Stack>
        </>
        
      }
      <DataGrid
        rows={members}
        rowSelection={false}
        sx={{ width: '100%', mb: 10 }}
        columns={[
          { field: 'id', headerName: languageData[language].Invoice.detail_table_column_id, flex:2, headerClassName: 'primaryBackground--header' },
          { field: 'email', headerName: languageData[language].Invoice.detail_table_column_email, flex:1, headerClassName: 'primaryBackground--header' },
          { field: 'firstName', headerName: languageData[language].Invoice.detail_table_column_first, flex:1, headerClassName: 'primaryBackground--header' },
          { field: 'lastName', headerName: languageData[language].Invoice.detail_table_column_last, flex:1, headerClassName: 'primaryBackground--header' },
          { field: 'salaryContribution', headerName: languageData[language].Invoice.detail_table_column_amount, flex:1, editable: true, headerClassName: 'primaryBackground--header' },
          { field: 'safeWalletAddress', headerName: languageData[language].Invoice.detail_table_column_wallet, flex:2, headerClassName: 'primaryBackground--header' },
        ]}        
        processRowUpdate={(params) => {
          const { id } = params;
          const updatedMembers = members.map((member) => {
            if (member.id === id) {
              return { ...params };
            }
            return member;
          });
          setMembers(updatedMembers);
          return params;
        }}
      />
    </Box>
  );
};

export default InvoiceDetailTable;