'use client'
import { playStoreAddress } from "@/service/constants";
import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Box, Button, CircularProgress, Fab, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"

// components/LoadingIndicator.tsx
export default function Auth0Button() {
  const theme = useTheme();
  const { isAuthenticated, isLoading, logout, loginWithPopup, loginWithRedirect } = useAuth0();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const buttonColor = theme.palette.mode === 'light' ? 'secondary' : 'primary';
  return (
    <>
      {!isAuthenticated &&
        <Button variant="contained" color={buttonColor} onClick={() => loginWithRedirect()}>
          <Typography textTransform={'none'} >Login</Typography>
        </Button>
      }
      {isAuthenticated &&
        <Button variant="contained" color={buttonColor} onClick={() => logout()}>
          <Typography textTransform={'none'} >Logout</Typography>
        </Button>
      }
    </>
  );
};
