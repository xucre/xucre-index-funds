'use client'
import React, { use, useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Chip, Stack, Grid2 as Grid, Slider, useTheme, Tooltip, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { useAccount, useSignMessage } from 'wagmi';
import CircleIcon from '@mui/icons-material/Circle';
import AccountButton from '@/components/accountButton';

import { useSFDC } from '@/hooks/useSFDC';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { SFDCUserData, SFDCWallet } from '@/service/types';
import { useRouter } from 'next/navigation';
import OpaqueCard from '@/components/ui/OpaqueCard';
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import KYC from '@/components/onboarding/KYC';
import NumberInput from '@/components/ui/NumberInput';
import { getTextColor } from '@/service/helpers';

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

const EditProfile = ({ }) => {
  const {language} = useLanguage();
  const [riskTolerance, setRiskTolerance] = useState('');
  const [salaryContribution, setSalaryContribution] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  // const [message, setMessage] = useState('');
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { user, isAdmin } = useIsAdmin();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  
  const { sfdcUser, updateUser } = useSFDC();
  const [modifiedUser, setModifiedUser] = useState<SFDCUserData>(sfdcUser ? {
    firstName: sfdcUser.firstName,
    middleName: sfdcUser.middleName,
    lastName: sfdcUser.lastName,
    address: sfdcUser.address,
    placeId: sfdcUser.placeId,
    idCardNumber: sfdcUser.idCardNumber,
    idExpirationDate: sfdcUser.idExpirationDate,
    frontImage: sfdcUser.frontImage,
    backImage: sfdcUser.backImage,
    riskTolerance: sfdcUser.riskTolerance,
    salaryContribution: sfdcUser.salaryContribution,
    role: sfdcUser.role,
    userId: sfdcUser.userId,
    organizationId: sfdcUser.organizationId,
    userEmail: sfdcUser.userEmail,
    status: sfdcUser.status,
    wallets: sfdcUser.wallets
  } : {
      firstName: '',
      middleName: '',
      lastName: '',
      address: '',
      placeId: '',
      idCardNumber: '',
      idExpirationDate: 0,
      frontImage: '',
      backImage: '',
      riskTolerance: '',
      salaryContribution: 0,
      role: '',
      userId: user.id,
      organizationId: user.organizationMemberships[0].organization.id,
      userEmail: '',
      status: '',
      wallets: [] as SFDCWallet[]
  });

  // useEffect(() => {
  //   if (!isConnected || !user) return;
  //   setMessage(`${address}:${user.id}`)
  // }, [isConnected, address, user])

  useEffect(() => {
    if (!sfdcUser) return;
    setModifiedUser(sfdcUser);
    //setRiskTolerance(sfdcUser.riskTolerance);
    setSalaryContribution(String(sfdcUser.salaryContribution));
    // if (sfdcUser.wallets && sfdcUser.wallets.length > 0) {
    //   setSignedMessage(sfdcUser.wallets[0].signedMessage || '');
    // }
  }, [sfdcUser])

  // const { signMessage } = useSignMessage({
  //   mutation: {
  //     onSuccess: (data) => {
  //       setSignedMessage(data);
  //     },
  //     onError: (error) => {
  //       console.error(error);
  //     },
  //   }
  // });

  const handleSaveProfile = async () => {
    const profileData = {
      userEmail: user.emailAddresses[0].emailAddress,
      userId: user.id,
      role: isAdmin ? 'Administrator' : 'User',
      organizationId: user.organizationMemberships[0].organization.id,
      status: 'Active',
      wallets: [],
      firstName: modifiedUser.firstName,
      middleName: modifiedUser.middleName,
      lastName: modifiedUser.lastName,
      address: modifiedUser.address,
      placeId: modifiedUser.placeId,
      idCardNumber: modifiedUser.idCardNumber,
      idExpirationDate: modifiedUser.idExpirationDate,
      frontImage: modifiedUser.frontImage,
      backImage: modifiedUser.backImage,
      riskTolerance: modifiedUser.riskTolerance,
      salaryContribution: modifiedUser.salaryContribution,
    } as SFDCUserData;

    if (signedMessage) {
      profileData.wallets = [{
        walletAddress: address,
        primary: true,
        chainId: 'EVM',
        //signedMessage: signedMessage
      } as SFDCWallet];
      //profileData.signedMessage = signedMessage;
    }

    // Call saveProfile with the collected data
    await updateUser(profileData);
    router.push('/dashboard')
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'salaryContribution') {
      if (isNaN(Number(value))) return;
      setModifiedUser((prevData) => ({
        ...prevData,
        salaryContribution: Number(value),
      }));
    } else {
      setModifiedUser((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const NumberHelpText = () => {
    return (
      <>
        <Typography variant="h6">
          {languageData[language].Edit.risk_help_text_title}
        </Typography>
        <Typography variant="body2">
          {languageData[language].Edit.risk_help_text_body1}
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CircleIcon />
            </ListItemIcon>
            <ListItemText primary={languageData[language].Edit.risk_help_text_bullet1} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CircleIcon />
            </ListItemIcon>
            <ListItemText primary={languageData[language].Edit.risk_help_text_bullet2} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CircleIcon />
            </ListItemIcon>
            <ListItemText primary={languageData[language].Edit.risk_help_text_bullet3} />
          </ListItem>
        </List>
        <Typography variant="body1">
          {languageData[language].Edit.risk_help_text_body2}
        </Typography>
      </>
      
    )
  }

  const isNull = (value: any) => {
    return value === null || value === undefined || value === '';
  }
  const isProfileComplete = !isNull(modifiedUser.lastName) && !isNull(modifiedUser.firstName) && !isNull(modifiedUser.address) && !isNull(modifiedUser.riskTolerance) && !isNull(modifiedUser.salaryContribution);
  
  const WalletSection = () => {
    return <></>
    // return (
    //   <>
    //     {isConnected &&
    //       <Button
    //         variant="outlined"
    //         onClick={() => signMessage({ account: address, message })}
    //         sx={{ mt: 2 }}
    //       >
    //         {languageData[language].Edit.sign_button}
    //       </Button>
    //     }
    //     {!isConnected &&
    //       <AccountButton />
    //     }
    //     {signedMessage && (
    //       <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
    //         {languageData[language].Edit.sign_message}
    //       </Typography>
    //     )}
    //   </>
    // )
  }

  return (
      <OpaqueCard sx={{
        p: 4,
        my: 4,
        mx: 6,
        mb: 10
      }}>
        <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
          <Typography variant="h5" gutterBottom>
            {languageData[language].Edit.title}
          </Typography>
          <Chip 
            label={languageData[language].Edit.save}
            onClick={handleSaveProfile} 
            disabled={!isProfileComplete}
            color={'primary'}
            sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
          />
        </Stack>
      
        <Stack direction={'row-reverse'} spacing={2} my={3} justifyContent={'space-between'} alignItems={'flex-start'} >
          <Stack direction={'column'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >

            <Grid container spacing={2}>
              <Grid size={12}><Typography fontWeight={'bold'}>{languageData[language].Edit.porfolio_section}</Typography></Grid>
              <Grid size={12}>
                <TextField
                  select
                  label={languageData[language].Edit.tolerance_label}
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
              </Grid>
              <Grid size={12}>
                <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
                  {/* <Tooltip title={<NumberHelpText />}> */}
                    <Typography color={'text.secondary'} variant={'caption'}>{languageData[language].Edit.salary_label}</Typography>
                  {/* </Tooltip> */}
                </Stack>
                <NumberInput onChange={(_, value) => {
                    setModifiedUser((prevData) => ({
                      ...prevData,
                      salaryContribution: Math.round(value as number * 10) / 10,
                    }));
                  }} 
                  aria-label={languageData[language].Edit.salary_label} 
                  min={0} 
                  max={50} 
                  step={.1}
                  value={modifiedUser.salaryContribution} 
                />    
                {/* <Slider
                  aria-label={languageData[language].Edit.salary_label}
                  value={modifiedUser.salaryContribution}
                  getAriaValueText={(value) => `${value}%`}
                  step={0.1}
                  marks
                  min={0}
                  max={50}
                  valueLabelDisplay="auto"
                  onChange={(e, value) => {
                    setModifiedUser((prevData) => ({
                      ...prevData,
                      salaryContribution: value as number,
                    }));
                  }}
                /> */}
                {/* <TextField
                  label={languageData[language].Edit.salary_label}
                  type="number"
                  name={'salaryContribution'}
                  value={modifiedUser.salaryContribution}
                  onChange={handleChange}
                  fullWidth
                /> */}
                
              </Grid>
            </Grid>
          </Stack>
          <Stack direction={'column'} maxWidth={'50%'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
            <KYC user={modifiedUser} updateUser={setModifiedUser}/>
          </Stack>
        </Stack>
      </OpaqueCard>
      
  );
};

export default EditProfile;
