'use client'
import { useLanguage } from '@/hooks/useLanguage';
import { Box, Chip, Stack, Typography } from '@mui/material';
import React from 'react';


export default function IntroductionContainer({setStep = (number) => {}}: { setStep? : (number) => void}) {
  const {language, languageData} = useLanguage();
  const handleNext = () => {
    setStep((prev) => prev + 1);
  }
  return (
    <Box 
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      textAlign="center"
      height="100%"
      minHeight={'50vh'}
      p={4}>
      <Stack direction="column" spacing={2} mt={5}>
        <Typography variant={'h5'} pb={2}>{languageData[language].Onboarding.onboarding_title}</Typography>
        <Typography variant={'body1'}>{languageData[language].Onboarding.onboarding_description}</Typography>
      </Stack>
    
      <Stack direction={'row'} spacing={2} justifyContent={'end'} alignItems={'center'} width={'100%'} mt={5} >      
        <Chip 
          label={languageData[language].ui.next}
          onClick={handleNext} 
          color={'primary'}
          sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
        />
      </Stack>
  </Box>
  );
}
