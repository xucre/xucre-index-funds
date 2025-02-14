'use client'
import React, { Suspense } from 'react';
import { DNA } from 'react-loader-spinner'
import { Box } from '@mui/material';

const LoadingComponent = () => (
  <Box display="flex" justifyContent="center" alignItems="center" >
    <Suspense fallback={<div>Loading...</div>}>
      {/* <CowGame /> */}
      <DNA
        visible={true}
        height="180"
        width="180"
        ariaLabel="dna-loading"
        wrapperStyle={{
          transform: 'rotate(90deg)',
        }}
        wrapperClass="dna-wrapper"
      />
      {/* <CircularProgress /> */}
    </Suspense>
  </Box>
);

export default LoadingComponent;