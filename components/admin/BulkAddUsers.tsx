import React, { useState, useRef } from 'react';
import { Button, Modal, Box, Typography, TextField, IconButton, Stack, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { bulkInviteUsers } from '@/service/clerk'; // Adjust to your actual import path

interface BulkAddUsersProps {
  organizationId: string;
}

const BulkAddUsers: React.FC<BulkAddUsersProps> = ({ organizationId }) => {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [membershipType, setMembershipType] = useState('org:member');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
      setEmails(lines);
      setOpen(true);
    };
    reader.readAsText(file);
  };

  const handleRemoveEmail = (index: number) => {
    setEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEmail = () => {
    if (newEmail.trim()) {
      setEmails((prev) => [...prev, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const handleConfirm = async () => {
    setFeedbackMsg('');
    try {
      await bulkInviteUsers(organizationId, emails, membershipType);
      setFeedbackMsg('Success! Invitations sent.');
    } catch (error) {
      setFeedbackMsg(`Error: ${(error as Error).message}`);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmails([]);
    setMembershipType('org:member');
    setFeedbackMsg('');
    setNewEmail('');
  };

  return (
    <>
      <Button variant="contained" onClick={handleUploadClick}>
        Upload CSV
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', bgcolor: 'background.paper',
            p: 4, borderRadius: 2, width: 400
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Bulk Add Users</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack spacing={2} mt={2}>
            <Select
              value={membershipType}
              onChange={(e) => setMembershipType(e.target.value)}
            >
              <MenuItem value="org:member">org:member</MenuItem>
              <MenuItem value="org:admin">org:admin</MenuItem>
            </Select>

            {emails.map((email, index) => (
              <Stack direction="row" key={index} justifyContent="space-between" alignItems="center">
                <Typography>{email}</Typography>
                <IconButton size="small" onClick={() => handleRemoveEmail(index)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}

            <Stack direction="row" spacing={1}>
              <TextField
                label="New Email"
                size="small"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Button variant="contained" onClick={handleAddEmail}>
                Add
              </Button>
            </Stack>

            {feedbackMsg && (
              <Typography color={feedbackMsg.startsWith('Error') ? 'error' : 'primary'}>{feedbackMsg}</Typography>
            )}

            <Button variant="contained" onClick={handleConfirm}>
              Confirm
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default BulkAddUsers;