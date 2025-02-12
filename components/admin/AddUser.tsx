import React, { useState } from 'react';
import { Button, Modal, Box, Typography, TextField, IconButton, Stack, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { inviteUser } from '@/service/clerk'; // Adjust to your actual import path

interface AddUserProps {
  organizationId: string;
}

const AddUser: React.FC<AddUserProps> = ({ organizationId }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [membershipType, setMembershipType] = useState('org:member' as 'org:member' | 'org:admin');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setName('');
    setMembershipType('org:member');
    setFeedbackMsg('');
  };

  const handleConfirm = async () => {
    setFeedbackMsg('');
    try {
      await inviteUser(organizationId, email, membershipType);
      setFeedbackMsg('Success! Invitation sent.');
    } catch (error) {
      setFeedbackMsg(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        Add User
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', bgcolor: 'background.paper',
            p: 4, borderRadius: 2, width: 400
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add User</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack spacing={2} mt={2}>
            <TextField
              label="Name"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select
              value={membershipType}
              onChange={(e) => setMembershipType(e.target.value as 'org:member' | 'org:admin')}
            >
              <MenuItem value="org:member">org:member</MenuItem>
              <MenuItem value="org:admin">org:admin</MenuItem>
            </Select>

            {feedbackMsg && (
              <Typography color={feedbackMsg.startsWith('Error') ? 'error' : 'primary'}>{feedbackMsg}</Typography>
            )}

            <Button variant="contained" onClick={handleConfirm}>
              Submit
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default AddUser;