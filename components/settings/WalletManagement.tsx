import React from 'react';
import AccountButton from '../accountButton';
import { Box, Divider, Stack, Typography } from '@mui/material';

const WalletManagement: React.FC = () => {
  return (
    <Box>
      <Stack direction={'column'} spacing={2} mb={2} >
        <Typography variant={'h5'}>Wallet Management</Typography>
        <Divider />
        <AccountButton />
      </Stack>
    </Box>
  );
};

export default WalletManagement;