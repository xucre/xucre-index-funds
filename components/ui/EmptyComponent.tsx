'use client'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const EmptyComponent = ({ executeCode, header, description, buttonText }: {executeCode: () => {}, header: string, description: string, buttonText: string}) => {
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
        {header}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {description}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={executeCode}
      >
        {buttonText}
      </Button>
    </Box>
  );
};

export default EmptyComponent;
