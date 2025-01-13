'use client'
import React, { use, useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Chip, Stack, Grid2 as Grid, Slider, useTheme, Tooltip, List, ListItem, ListItemText, ListItemIcon, IconButton, Skeleton } from '@mui/material';
import { useAccount, useSignMessage } from 'wagmi';
import CircleIcon from '@mui/icons-material/Circle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountButton from '@/components/accountButton';

import { useSFDC } from '@/hooks/useSFDC';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { SFDCUserData, SFDCWallet } from '@/service/types';
import { useRouter } from 'next/navigation';
import OpaqueCard from '@/components/ui/OpaqueCard';
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import { getTextColor, isNull } from '@/service/helpers';
import ReusableModal from '@/components/ui/ReusableModal';
import { setSafeAddress } from '@/service/db';

const riskOptions = [
  { label: 'risk_aggressive', value: 'Aggressive' },
  { label: 'risk_moderate', value: 'Moderate' },
  { label: 'risk_conservative', value: 'Conservative' },
];

interface ProfileData {
  riskTolerance: string;
  salaryContribution: number;
  signedMessage?: string;
}

const EditProfile = ({direction = 'column', showOpaqueCard = true, saveType = 'save', showPrevious=false, setStep = (number) => {}} : {direction?: 'column' | 'row', showOpaqueCard? : boolean, saveType?: 'save' | 'next', showPrevious?: boolean, setStep? : (number) => void}) => {
  const {language} = useLanguage();
  const [signedMessage, setSignedMessage] = useState('');
  // const [message, setMessage] = useState('');
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { user, isAdmin } = useIsAdmin();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  
  const { sfdcUser, updateUser, refresh } = useSFDC();
  const [modifiedUser, setModifiedUser] = useState<SFDCUserData | null>(null);
  const clearSafewallet = async () => {
    if (!user) return;
    setSafeAddress(user.id, '');
    router.refresh()
  }
  // useEffect(() => {
  //   if (!isConnected || !user) return;
  //   setMessage(`${address}:${user.id}`)
  // }, [isConnected, address, user])

  useEffect(() => {
      if (!sfdcUser) return;
      if (modifiedUser === null) {
        setModifiedUser({...sfdcUser, riskTolerance: sfdcUser.riskTolerance || 'Moderate', salaryContribution: sfdcUser.salaryContribution || 0});
      }
    }, [sfdcUser])

  const handleSaveProfile = async () => {
    if (!user || !modifiedUser) return;
    const profileData = {
      ...sfdcUser,
      status: 'Active',
      riskTolerance: modifiedUser.riskTolerance,
      salaryContribution: modifiedUser.salaryContribution
    } as SFDCUserData;

    // if (signedMessage) {
    //   profileData.wallets = [{
    //     walletAddress: address,
    //     primary: true,
    //     chainId: 'EVM',
    //     //signedMessage: signedMessage
    //   } as SFDCWallet];
    //   //profileData.signedMessage = signedMessage;
    // }

    // Call saveProfile with the collected data
    await updateUser(profileData);
    //router.push('/dashboard')
    refresh();
    if (saveType === 'next') {
      setStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    setStep((prev) => prev - 1);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!modifiedUser) return;
    const { name, value } = e.target;
    if (name === 'salaryContribution') {
      if (isNaN(Number(value))) return;
      setModifiedUser({
        ...modifiedUser,
        salaryContribution: Number(value),
      });
    } else {
      setModifiedUser({
        ...modifiedUser,
        [name]: value,
      });
    }
  };

  const RiskToleranceHelpText = () => {
    return (
      <Box p={5}>
        <Typography variant="h6" sx={{pb:2}}>
          {languageData[language].Edit.risk_help_text_title}
        </Typography>
        <Typography variant="body1">
          {languageData[language].Edit.risk_help_text_body1}
        </Typography>
        <List>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small" />
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.risk_help_text_bullet1} />
          </ListItem>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small"  sx={{fontSize: 10}}/>
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.risk_help_text_bullet2} />
          </ListItem>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small" />
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.risk_help_text_bullet3} />
          </ListItem>
        </List>
        <Typography variant="body1">
          {languageData[language].Edit.risk_help_text_body2}
        </Typography>
      </Box>
      
    )
  }

  const SalaryContributionHelpText = () => {
    return (
      <Box p={5}>
        <Typography variant="h6" sx={{pb:2}}>
          {languageData[language].Edit.salary_help_text_title}
        </Typography>
        <Typography variant="body1">
          {languageData[language].Edit.salary_help_text_body1}
        </Typography>
        <List>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small" />
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.salary_help_text_bullet1} />
          </ListItem>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small"  sx={{fontSize: 10}}/>
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.salary_help_text_bullet2} />
          </ListItem>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small" />
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.salary_help_text_bullet3} />
          </ListItem>
        </List>
        <Typography variant="body1">
          {languageData[language].Edit.salary_help_text_body2}
        </Typography>
      </Box>
      
    )
  }
  
  const isProfileComplete = modifiedUser && !isNull(modifiedUser.riskTolerance) && !isNull(modifiedUser.salaryContribution);
  if (!modifiedUser) return <Skeleton variant={'rounded'} width="100%" height={200} />;

  return (
      <Box sx={{px: showOpaqueCard ? 0: 4}}>
        {/* <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
          <Typography variant="h6" gutterBottom>
            {languageData[language].Edit.title}
          </Typography>
          <Chip color={'error'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={clearSafewallet} label={'Clear Escrow Wallet'} />
        </Stack> */}

        <Typography fontWeight={'bold'}>{languageData[language].Edit.porfolio_section}</Typography>
        <Stack direction={direction} spacing={direction === 'column' ? 2: 5} justifyContent={direction === 'column' ? 'space-between' : 'space-between'} alignItems={'center'} width={'100%'} my={direction === 'column' ? 0 : 5}>
          <TextField
            sx={{maxWidth: 300, flexGrow: 2}}
            select
            label={<>
              <Stack direction={'row'} spacing={2} justifyContent={'flex-start'} alignItems={'center'} >
                <Typography color={'text.secondary'} variant={'body1'}>{languageData[language].Edit.tolerance_label}</Typography>
                <ReusableModal icon={<HelpOutlineIcon color={'disabled'} />} >
                  <RiskToleranceHelpText />
                </ReusableModal>
              </Stack>
            </>}
            defaultValue={''}
            value={modifiedUser.riskTolerance}
            name={'riskTolerance'}
            onChange={handleChange}
            fullWidth
          >
            {riskOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {languageData[language].Edit[option.label]}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={'column'} spacing={2} flexGrow={1}>
            <Stack direction={'row'} spacing={2} justifyContent={'flex-start'} alignItems={'center'} >
              <Typography color={'text.secondary'} variant={'caption'}>{languageData[language].Edit.salary_label}</Typography>
              <ReusableModal icon={<HelpOutlineIcon color={'disabled'} />} >
                <SalaryContributionHelpText />
              </ReusableModal>
            </Stack>
            <Slider
              aria-label={languageData[language].Edit.salary_label}
              value={modifiedUser.salaryContribution}
              getAriaValueText={(value) => `$${value}`}
              step={10}
              marks={[100,200,300,400,500].map((value) => ({value, label: `$${value}`}))}
              min={0}
              max={500}
              valueLabelDisplay="auto"
              onChange={(e, value) => {
                if (!modifiedUser) return;
                setModifiedUser({
                  ...modifiedUser,
                  salaryContribution: value as number,
                });
              }}
            />
          </Stack>
        </Stack>
        <Stack direction={'row'} spacing={2} justifyContent={showPrevious ? 'space-between' : 'flex-end'} alignItems={'center'} >
          {showPrevious &&
            <Chip 
              label={languageData[language].ui.previous}
              onClick={goBack} 
              color={'primary'}
              sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
            />
          }
          <Chip 
            label={saveType === 'save' ? languageData[language].Edit.save : languageData[language].ui.next}
            onClick={handleSaveProfile} 
            disabled={!isProfileComplete}
            color={'primary'}
            sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
          />
        </Stack>
      </Box>
      
  );
};

export default EditProfile;
