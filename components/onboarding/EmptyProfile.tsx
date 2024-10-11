'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const EmptyProfileState = ({ onCreateProfile }) => {
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
      <AccountCircleIcon color="action" fontSize="large" />
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        No profile found
      </Typography>
      <Typography variant="body1" color="textSecondary">
        It seems you haven’t created your profile yet. Let's set it up to get started!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={onCreateProfile}
      >
        Create Profile
      </Button>
    </Box>
  );
};

export default EmptyProfileState;
