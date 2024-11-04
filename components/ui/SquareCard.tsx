'use client'
import { Card, styled } from "@mui/material"


const SquareCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper,
  opacity: 0.85,
  padding: theme.spacing(2),
  boxShadow: 'none'
}));

export default SquareCard