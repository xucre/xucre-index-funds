'use client';
import { useRouter } from 'next/navigation';
import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { useLanguage } from '@/hooks/useLanguage';
import languageData from '@/metadata/translations'
import { useClerkUser } from '@/hooks/useClerkUser';

export default function Home() {
  const {language} = useLanguage();
  const router = useRouter();

  const {user, isSignedIn} = useClerkUser();

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
          {isSignedIn ? 
            <Chip label={languageData[language].Menu.dashboard} onClick={() => { router.push('/dashboard') }} color={'primary'} sx={{fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25 }} /> : 
            <Chip label={languageData[language].Home.button} onClick={() => { router.push('/sign-in') }} color={'primary'} sx={{fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25 }} />
          }
        </Stack>
      </Stack>
    </main>
  );
}
