'use client'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Skeleton, LinearProgress, Chip, Stack, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useRouter } from 'next/navigation';
import { globalChainId } from '@/service/constants';
import { useClerkUser } from '@/hooks/useClerkUser';

const AdditionalInfoContainer = ({ setStep = (number) => {}}: {setStep? : (number) => void}) => {
  const {language} = useLanguage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const goBack = () => {
    setStep((prev) => prev - 1);
  }

  const handleNext = () => {
    router.push('/dashboard');
  }
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      height="100%"
      p={4}
    >
      {!loading && 
        <>
          <AccountCircleIcon color="action" fontSize="large" />
          
          <Typography variant="h5" color="textPrimary" gutterBottom>
            {languageData[language].Onboarding.additional_info_title}
          </Typography>
          
          <List>
            <ListItem>
              <ListItemButton component="a" href="/settings/beneficiaries">
                <ListItemText primary={languageData[language].Onboarding.additional_info_item_1} />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton component="a" href="/settings/web3">
                <ListItemText primary={languageData[language].Onboarding.additional_info_item_2} />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton component="a" href="http://www.xucre.net/noticias">
                <ListItemText primary={languageData[language].Onboarding.additional_info_item_3} />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton component="a" href="https://swap.xucre.net">
                <ListItemText primary={languageData[language].Onboarding.additional_info_item_4} />
              </ListItemButton>
            </ListItem>
          </List>
          

          <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} width={'100%'} >  
            <Chip 
              label={languageData[language].ui.previous}
              onClick={goBack} 
              color={'primary'}
              sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
            />            
            
            <Chip 
              label={languageData[language].ui.complete}
              onClick={handleNext} 
              color={'primary'}
              sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
            />
          </Stack>
        </>
      }
      
      {loading &&
        <>
          <LinearProgress />
          {/* <Typography variant="body1" color="textSecondary">
            {languageData[language].Onboarding.creating_safe_title}
          </Typography> */}
        </>
      }
      
    </Box>
  );
};

export default AdditionalInfoContainer;
