'use client'
import { Card, styled } from "@mui/material"


const OpaqueCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper,
  opacity: 0.85,
  padding: theme.spacing(2),
  boxShadow: 'none',
  borderRadius: 25,
}));

export default OpaqueCard