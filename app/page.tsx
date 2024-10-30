'use client';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletNotConnected from '@/components/walletNotConnected';
import { useRouter } from 'next/navigation';
import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';

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
      <Stack direction={{xs: 'column', sm: 'row'}} spacing={{xs: 4, sm: 20}} justifyContent={'center'} alignItems={'center'} minHeight={'80vh'}>
        <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'} >
          <Avatar sx={{ width: 80, height: 80 }} src={'/icon_new2.png'} alt="menuLogo" />
          <Stack direction={'column'} spacing={0}>
            <Typography variant={'body2'} color={'textSecondary'}>Bienvenido a</Typography>
            <Typography variant={'h4'}>Xucre Investments</Typography>
            <Typography variant={'body2'}>Tu puerta directa hacia el mundo crypto</Typography>
          </Stack>
        </Stack>
        <Stack direction={'column'} spacing={2} justifyContent={'center'} alignItems={'flex-start'}>
          <Typography variant={'body2'} color={'textSecondary'}>¿Ya eres miembro?</Typography>
          <Chip label="Iniciar sesión" onClick={() => { router.push('/sign-in') }} sx={{color: 'white',bgcolor: '#00872a', fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25 }} />
        </Stack>
      </Stack>
    </main>
  );
}
