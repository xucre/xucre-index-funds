'use client'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem } from '@mui/material';
import { useAccount, useSignMessage } from 'wagmi';
import { useUser } from '@clerk/nextjs';
import AccountButton from '@/components/accountButton';
import { useSFDC } from '@/hooks/useSFDC';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { SFDCUserData, SFDCWallet } from '@/service/types';
import { useRouter } from 'next/navigation';

const riskOptions = [
  { label: 'Aggressive', value: 'Aggressive' },
  { label: 'Moderate', value: 'Moderate' },
  { label: 'Conservative', value: 'Conservative' },
];

interface ProfileData {
  riskTolerance: string;
  salaryContribution: number;
  signedMessage?: string;
}

const EditProfile = ({ }) => {
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
    setSalaryContribution(sfdcUser.salaryContribution.toString());
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
      organizationId: user.organizationMemberships[0].id,
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      p={4}
      maxWidth="400px"
      margin="auto"
    >
      <Typography variant="h5" gutterBottom>
        Set up your investment profile
      </Typography>

      <TextField
        select
        label="Risk Tolerance"
        value={riskTolerance}
        onChange={(e) => setRiskTolerance(e.target.value)}
        fullWidth
        margin="normal"
      >
        {riskOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Salary Contribution (%)"
        type="number"
        value={salaryContribution}
        onChange={(e) => setSalaryContribution(e.target.value)}
        fullWidth
        margin="normal"
      />

      {isConnected &&
        <Button
          variant="outlined"
          onClick={() => signMessage({ account: address, message })}
          sx={{ mt: 2 }}
        >
          Sign Message
        </Button>
      }
      {!isConnected &&
        <AccountButton />
      }


      {signedMessage && (
        <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
          Message signed successfully!
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveProfile}
        sx={{ mt: 3 }}
        disabled={!riskTolerance || !salaryContribution}
      >
        Save Profile
      </Button>
    </Box>
  );
};

export default EditProfile;
