'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const EmptySafeWallet = ({ onCreateSafe }) => {
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
        No se encontró Safe
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Parece que aún no has creado tu Safe wallet. ¡Vamos a configurarlo para comenzar!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={onCreateSafe}
      >
        Crear Safe
      </Button>
    </Box>
  );
};

export default EmptySafeWallet;
