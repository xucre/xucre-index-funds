'use client'
import React, { use, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Chip, Stack, Grid2 as Grid, Slider, useTheme, Tooltip, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
import { useAccount, useSignMessage } from 'wagmi';
import CircleIcon from '@mui/icons-material/Circle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountButton from '@/components/accountButton';
import _ from 'lodash';
import { useSFDC } from '@/hooks/useSFDC';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { SFDCUserData, SFDCWallet } from '@/service/types';
import { useRouter } from 'next/navigation';
import OpaqueCard from '@/components/ui/OpaqueCard';
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import KYC from '@/components/settings/KYC';
import NumberInput from '@/components/ui/NumberInput';
import { getTextColor, isNull } from '@/service/helpers';
import ReusableModal from '@/components/ui/ReusableModal';
import { setSafeAddress } from '@/service/db';
import { useClerkUser } from '@/hooks/useClerkUser';

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

const EditUserProfile = ({selectedTab, showOpaqueCard = true, saveType = 'save', showPrevious=false, setStep = (number) => {}}: {selectedTab: number, showOpaqueCard?: boolean, saveType?: 'save' | 'next', showPrevious?: boolean, setStep? : (number) => void}) => {
  const {language} = useLanguage();
  //const router = useRouter();
  const { user } = useClerkUser();
  const { isAdmin } = useIsAdmin();
  const [_selectedTab, setSelectedTab] = React.useState(0);
  const { sfdcUser, updateUser, refresh } = useSFDC();
  //const sfdcUser = useMemo(() => (sfdcUserRaw), [sfdcUserRaw]);
  const [modifiedUser, setModifiedUser] = useState<SFDCUserData>(sfdcUser);
  const clearSafewallet = async () => {
    if (!user) return;
    setSafeAddress(user.id, '');
    //router.refresh()
  }

  useEffect(() => {
    console.log('edit user profile mounted')
    return () => {
      console.log('edit user profile unmounted')
    }
  }, []);
  
  useEffect(() => {
    if (!sfdcUser || sfdcUser === null) return;
    if (_.isEqual(sfdcUser, modifiedUser)) return;
    setModifiedUser(sfdcUser);
  }, [sfdcUser])

  const handleSaveProfile = async () => {
    if (!user || !modifiedUser) return;
    console.log('handle save profile');
    const profileData = {
      ...sfdcUser,
      status: 'Active',
      firstName: modifiedUser.firstName,
      middleName: modifiedUser.middleName,
      lastName: modifiedUser.lastName,
      address: modifiedUser.address,
      street: modifiedUser.street,
      street2: modifiedUser.street2,
      city: modifiedUser.city,
      province: modifiedUser.province,
      postalCode: modifiedUser.postalCode,
      country: modifiedUser.country,
      placeId: modifiedUser.placeId,
      idCardNumber: modifiedUser.idCardNumber,
      idExpirationDate: modifiedUser.idExpirationDate,
      idType: modifiedUser.idType,
      idIssueDate: modifiedUser.idIssueDate,
      frontImage: modifiedUser.frontImage,
      backImage: modifiedUser.backImage,
      beneficiaries: modifiedUser.beneficiaries || [],
    } as SFDCUserData;

    // Call saveProfile with the collected data
    await updateUser(profileData);

    if (saveType === 'next') {
      setStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    setStep((prev) => prev - 1);
  }
  
  //if (modifiedUser === null) return null;

  const isProfileComplete = modifiedUser && !isNull(modifiedUser.lastName) && !isNull(modifiedUser.firstName) && !isNull(modifiedUser.street) && !isNull(modifiedUser.city) && !isNull(modifiedUser.province) && !isNull(modifiedUser.postalCode) && !isNull(modifiedUser.country);// && !isNull(modifiedUser.riskTolerance) && !isNull(modifiedUser.salaryContribution);
  //const KYCMemo = React.memo(KYC);
  return (
    <Box sx={{px: showOpaqueCard ? 0: 4}}>      
      {/* <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
        <Typography variant="h6" gutterBottom>
          {languageData[language].Edit.title}
        </Typography>
        <Chip color={'error'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={clearSafewallet} label={'Clear Escrow Wallet'} />
      </Stack> */}
      <Stack direction={'column'} spacing={2} my={3} justifyContent={'space-between'} alignItems={'flex-start'} >
        <Stack direction={'column'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
          <KYC user={modifiedUser} updateUser={setModifiedUser} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        </Stack>
      </Stack>
      <Stack direction={'row'} spacing={2} justifyContent={showPrevious ? 'space-between' : 'flex-end'} alignItems={'center'} >
        {showPrevious &&
          <Chip 
            label={languageData[language].ui.previous}
            onClick={goBack} 
            color={'default'}
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

export default React.memo(EditUserProfile);
