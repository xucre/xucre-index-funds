'use client'
import React, { use, useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Chip, Stack, Grid2 as Grid, Slider, useTheme, Tooltip, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
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
import KYC from '@/components/onboarding/KYC';
import NumberInput from '@/components/ui/NumberInput';
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
  
  const { sfdcUser, updateUser, refresh } = useSFDC();
  const [modifiedUser, setModifiedUser] = useState<SFDCUserData>(sfdcUser ? {
    firstName: sfdcUser.firstName,
    middleName: sfdcUser.middleName,
    lastName: sfdcUser.lastName,
    address: sfdcUser.address,
    placeId: sfdcUser.placeId,
    idCardNumber: sfdcUser.idCardNumber,
    idExpirationDate: sfdcUser.idExpirationDate || '',
    frontImage: sfdcUser.frontImage,
    backImage: sfdcUser.backImage,
    riskTolerance: sfdcUser.riskTolerance === '' ? 'Moderate' : sfdcUser.riskTolerance,
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
      idExpirationDate: '',
      frontImage: '',
      backImage: '',
      riskTolerance: 'Moderate',
      salaryContribution: 0,
      role: '',
      userId: user ? user.id : '',
      organizationId: user ? user.organizationMemberships[0].organization.id : '',
      userEmail: '',
      status: '',
      wallets: [] as SFDCWallet[]
  });
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
    setModifiedUser(sfdcUser);
    //setRiskTolerance(sfdcUser.riskTolerance);
    //setSalaryContribution(String(sfdcUser.salaryContribution));
  }, [sfdcUser])

  const handleSaveProfile = async () => {
    if (!user) return;
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
    refresh();
    //router.push('/dashboard')
  };

  const isProfileComplete = !isNull(modifiedUser.lastName) && !isNull(modifiedUser.firstName) && !isNull(modifiedUser.address);// && !isNull(modifiedUser.riskTolerance) && !isNull(modifiedUser.salaryContribution);

  return (
      <OpaqueCard sx={{
        px: 4,
        py: 2
      }}>
        {/* <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
          <Typography variant="h6" gutterBottom>
            {languageData[language].Edit.title}
          </Typography>
          <Chip color={'error'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={clearSafewallet} label={'Clear Escrow Wallet'} />
        </Stack> */}
      
        <Stack direction={'column'} spacing={2} my={3} justifyContent={'space-between'} alignItems={'flex-start'} >
          
          <Stack direction={'column'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
            <KYC user={modifiedUser} updateUser={setModifiedUser}/>
          </Stack>
        </Stack>
        <Stack direction={'row'} spacing={2} justifyContent={'end'} alignItems={'center'} >
          <Chip 
            label={languageData[language].Edit.save}
            onClick={handleSaveProfile} 
            disabled={!isProfileComplete}
            color={'primary'}
            sx={{ fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
          />
        </Stack>
      </OpaqueCard>
      
  );
};

export default EditProfile;
