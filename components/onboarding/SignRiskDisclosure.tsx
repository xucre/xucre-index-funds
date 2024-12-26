'use client'
import React, { useState } from 'react';
import { Box, Typography, Button, Skeleton, Chip, Dialog, DialogContent, DialogTitle, MenuItem, Select, Stack, TextField, useTheme } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useAccount } from 'wagmi';
import AccountButton from '../accountButton';
import { createAccount, CreateAccountOptions } from '@/service/safe';
import { updateSafeWalletDetails } from '@/service/sfdc';
import { setSafeAddress } from '@/service/db';
import { useRouter } from 'next/navigation';
import { globalChainId } from '@/service/constants';
import { Roles } from '@/service/types';
import { DocusealForm } from '@docuseal/react'
import { useUser } from '@clerk/nextjs';
import { getTextColor } from '@/service/helpers';
import { useSFDC } from '@/hooks/useSFDC';
import dayjs from 'dayjs';

const SignRiskDisclosure = ({refresh}: {refresh: Function}) => {
  const {language} = useLanguage();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const {user} = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {sfdcUser, updateUser} = useSFDC();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleComplete = async (data) => {  
    console.log('handleComplete', data);

    await updateUser({
      ...sfdcUser,
      riskDisclosureSigned: true,
      riskDisclosureSignedDate: dayjs().format('YYYY-MM-DD')
    });
    handleClose();
    refresh();
  }

  const openDocumentSign = async () => {
    // setLoading(true);
    // const safePayload = {
    //   rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    //   owner: '',
    //   threshold: 1,
    //   id: id,
    //   chainid: globalChainId
    // } as CreateAccountOptions;
    // console.log('createSafeWallet');
    // const safeAddress = await createAccount(safePayload);
    // setSafeAddress(id, safeAddress);
    // updateSafeWalletDetails(id, safeAddress);
    // setLoading(false);
    // refresh();
  }

  const customCss = `
    #form_container {
      color: ${getTextColor(theme)};
    }

    div {
      color: ${getTextColor(theme)};
    }

    p {
      color: #000000;
    }

    svg {
      color: #000000;
    }
  `;
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
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {languageData[language].Onboarding.empty_disclosure}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {languageData[language].Onboarding.empty_disclosure_description}
          </Typography>
          {
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={handleOpen}
            >
              {languageData[language].Onboarding.empty_disclosure_button}
            </Button>  
          } 
        </>
      }
      
      {loading &&
        <Skeleton variant={'rounded'} width="100%" height={200} />
      }
      
      <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'lg'}>
        {/* <DialogTitle>{languageData[language].Onboarding.empty_disclosure_title}</DialogTitle> */}
        <DialogContent sx={{ display: 'flex'}}>
            <Stack direction={'column'} alignItems={'center'} justifyContent={'space-between'} mx={5} my={1} spacing={3} >
                {user && user.primaryEmailAddress && 
                  <DocusealForm
                    src={`https://docuseal.com/d/${process.env.NEXT_PUBLIC_DOCUSEAL_TEMPLATE_ID}`}
                    email={user.primaryEmailAddress.emailAddress}
                    onComplete={handleComplete}
                    logo={'/icon.png'}
                    customCss={customCss}
                  />
                }
                {/*                 
                <Stack direction={'row'} spacing={2}>
                    <Chip color={'primary'} sx={{fontSize: 18, fontWeight: 'bold', py: 2.5, px: 10, borderRadius: 25 }} label={'Create User'} onClick={openDocumentSign} />
                </Stack> */}
            </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SignRiskDisclosure;
