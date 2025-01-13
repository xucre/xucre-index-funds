
import React, { useState } from 'react';
import { Button, Modal, Box, TextField, Select, MenuItem, IconButton, Dialog, DialogContent, DialogTitle, Stack, Chip } from '@mui/material';
import { createUserWithRole } from '../../service/clerk';
import AddIcon from '@mui/icons-material/Add';
import { Roles } from '@/service/types';
import { useClerkOrganization } from '@/hooks/useClerkOrganization';

export default function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(Roles.Member);
  const { organization } = useClerkOrganization();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreateUser = async () => {
    if (organization) {
      await createUserWithRole(email, role, organization.id);
      // ...handle success or error...
      handleClose();
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <AddIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent sx={{minHeight: 200, display: 'flex'}}>
            <Stack direction={'column'} alignItems={'center'} justifyContent={'space-between'} mx={5} my={1} spacing={3} >
                <Stack direction={'row'} spacing={0}>
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Select
                        label="Role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as Roles)}
                    >
                        <MenuItem value={Roles.Admin}>Admin</MenuItem>
                        <MenuItem value={Roles.Member}>Member</MenuItem>
                        {/* <MenuItem value={Roles.SuperAdmin}>Super Admin</MenuItem> */}
                    </Select>
                </Stack>
                <Stack direction={'row'} spacing={2}>
                    <Chip color={'primary'} sx={{fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25 }} label={'Create User'} onClick={handleCreateUser} />
                </Stack>
            </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}