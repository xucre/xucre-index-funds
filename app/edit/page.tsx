'use client'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Chip, Stack } from '@mui/material';
import { useAccount, useSignMessage } from 'wagmi';
import AccountButton from '@/components/accountButton';
import { useSFDC } from '@/hooks/useSFDC';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { SFDCUserData, SFDCWallet } from '@/service/types';
import { useRouter } from 'next/navigation';
import OpaqueCard from '@/components/ui/OpaqueCard';
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";

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
  const [message, setMessage] = useState('');
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { user, isAdmin } = useIsAdmin();
  const { sfdcUser, updateUser } = useSFDC();

  useEffect(() => {
    if (!isConnected || !user) return;
    setMessage(`${address}:${user.id}`)
  }, [isConnected, address, user])

  useEffect(() => {
    if (!sfdcUser) return;
    setRiskTolerance(sfdcUser.riskTolerance);
    setSalaryContribution(String(sfdcUser.salaryContribution));
    if (sfdcUser.wallets && sfdcUser.wallets.length > 0) {
      setSignedMessage(sfdcUser.wallets[0].signedMessage || '');
    }
  }, [sfdcUser])

  const { signMessage } = useSignMessage({
    mutation: {
      onSuccess: (data) => {
        setSignedMessage(data);
      },
      onError: (error) => {
        console.error(error);
      },
    }
  });

  const handleSaveProfile = async () => {
    const profileData = {
      riskTolerance,
      salaryContribution: parseFloat(salaryContribution),
      userEmail: user.emailAddresses[0].emailAddress,
      userId: user.id,
      role: isAdmin ? 'Administrator' : 'User',
      organizationId: user.organizationMemberships[0].organization.id,
      status: 'Active',
      wallets: []
    } as SFDCUserData;

    if (signedMessage) {
      profileData.wallets = [{
        walletAddress: address,
        primary: true,
        chainId: 'EVM',
        signedMessage: signedMessage
      } as SFDCWallet];
      //profileData.signedMessage = signedMessage;
    }

    // Call saveProfile with the collected data
    await updateUser(profileData);
    router.push('/dashboard')
  };

  const WalletSection = () => {
    return (
      <>
        {isConnected &&
          <Button
            variant="outlined"
            onClick={() => signMessage({ account: address, message })}
            sx={{ mt: 2 }}
          >
            {languageData[language].Edit.sign_button}
          </Button>
        }
        {!isConnected &&
          <AccountButton />
        }
        {signedMessage && (
          <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
            {languageData[language].Edit.sign_message}
          </Typography>
        )}
      </>
    )
  }

  return (
      <OpaqueCard sx={{
        p: 4,
        my: 4,
        ml: 6
      }}>
        <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
          <Stack direction={'column'} spacing={2} justifyContent={'center'} alignItems={'center'} >
            <Typography variant="h5" gutterBottom>
              {languageData[language].Edit.title}
            </Typography>

            <TextField
              select
              label={languageData[language].Edit.tolerance_label}
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value)}
              fullWidth
              margin="normal"
            >
              {riskOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {languageData[language].Edit[option.label]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={languageData[language].Edit.salary_label}
              type="number"
              value={salaryContribution}
              onChange={(e) => setSalaryContribution(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Stack>
          <Stack direction={'column'} minHeight={'20vh'}  height={'fill-content'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
            <WalletSection />
            <Stack direction={'row'} spacing={2} justifyContent={'flex-end'} alignItems={'flex-end'} >
              <Chip 
                label="Ahorrar" 
                onClick={handleSaveProfile} 
                disabled={!riskTolerance || !salaryContribution}
                sx={{color: 'white',bgcolor: '#00872a', fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25, mt: 3 }} 
              />
            </Stack>
          </Stack>
        </Stack>
      </OpaqueCard>
      
  );
};

export default EditProfile;
