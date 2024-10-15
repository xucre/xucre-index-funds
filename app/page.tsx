'use client';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletNotConnected from '@/components/walletNotConnected';
import { useRouter } from 'next/navigation';
import { Avatar, Box, Stack, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  useEffect(() => {
    if (isConnected) {
      //router.replace('/index-fund')
    }
  }, [isConnected]);

  return (
    <main>
      <Stack direction={'column'} spacing={2} justifyContent={'center'} alignItems={'center'} py={10}>
        <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
          <Avatar sx={{ width: 80, height: 80 }} src={'/icon-green.png'} alt="menuLogo" />
          <Typography variant={'h1'}>Xucre Investments</Typography>
        </Stack>
      </Stack>
    </main>
  );
}
