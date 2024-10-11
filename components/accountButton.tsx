'use client'
import React, { useRef } from 'react';
import Box from '@mui/material/Box';

const AccountButton = ({ showBalance = true }) => {

  return (
    <Box>
      {<w3m-button balance={showBalance ? 'show' : 'hide'} />}
    </Box>
  )
}

export default AccountButton;

