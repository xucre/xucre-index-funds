'use client';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletNotConnected from '@/components/walletNotConnected';
import { useRouter } from 'next/navigation';
import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { useLanguage } from '@/hooks/useLanguage';
import languageData from '@/metadata/translations'

export default function Home() {
  const {language} = useLanguage();
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
          <Avatar sx={{ width: 80, height: 80 }} src={'/icon_new2.png'} alt="menuLogo" variant={'square'} />
          <Stack direction={'column'} spacing={0}>
            <Typography variant={'body2'} color={'textSecondary'}>{languageData[language].Home.title_1}</Typography>
            <Typography variant={'h4'}>{languageData[language].Home.title_2}</Typography>
            <Typography variant={'body2'}>{languageData[language].Home.title_3}</Typography>
          </Stack>
        </Stack>
        <Stack direction={'column'} spacing={2} justifyContent={'center'} alignItems={'flex-start'}>
          <Typography variant={'body2'} color={'textSecondary'}>{languageData[language].Home.button_header}</Typography>
          <SignedIn>
          <Chip label={languageData[language].Home.button} onClick={() => { router.push('/dashboard') }} sx={{color: 'white',bgcolor: '#00872a', fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25 }} />
          </SignedIn>
          <SignedOut>
            <Chip label={languageData[language].Home.button} onClick={() => { router.push('/sign-in') }} sx={{color: 'white',bgcolor: '#00872a', fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25 }} />
          </SignedOut>
        </Stack>
      </Stack>
    </main>
  );
}
