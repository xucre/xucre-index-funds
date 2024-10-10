import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

const EmptyOrganization = ({ onCreateOrganization }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      height="100%"
      p={4}
    >
      <AddBusinessIcon color="action" fontSize="large" />
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        No organizations found
      </Typography>
      <Typography variant="body1" color="textSecondary">
        It looks like you haven't created any organizations yet.
        Let's get started by setting one up!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={onCreateOrganization}
      >
        Create Organization
      </Button>
    </Box>
  );
};

export default EmptyOrganization;
