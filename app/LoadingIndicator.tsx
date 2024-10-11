'use client'
import { Grid, Typography } from "@mui/material"

// components/LoadingIndicator.tsx
export const LoadingIndicator = () => {
  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      height={'90vh'}
    >
      <Typography color={'white'}>Loading...</Typography>
    </Grid>
  );
};