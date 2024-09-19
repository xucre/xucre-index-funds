'use client';
import { Suspense } from 'react';
//import type { NextPage } from 'next';
import Ramp from '../../components/ramp';
import { Box } from '@mui/material';

export default function OnRamp() {
  return <Suspense><Box pb={4}><Ramp /></Box></Suspense>;
}