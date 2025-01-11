'use client'
import React, { useEffect, useState } from 'react';
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
import { getTextColor } from '@/service/helpers';
import { useSFDC } from '@/hooks/useSFDC';
import dayjs from 'dayjs';
import { useClerkUser } from '@/hooks/useClerkUser';

const SignRiskDisclosure = ({ type, refresh}: {type: 'card'|'modal', refresh: Function}) => {
  const {language} = useLanguage();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const {user} = useClerkUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const {sfdcUser, updateUser} = useSFDC();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleComplete = async (data) => {  

    await updateUser({
      ...sfdcUser,
      riskDisclosureSigned: true,
      riskDisclosureSignedDate: dayjs().format('YYYY-MM-DD')
    });
    handleClose();
    refresh();
  }

  useEffect(() => {
    const runAsync = async () => {
      // const response = await fetch('/api/docuseal');
      // const data = await response.json();
      // if (data.templateId){
      //   setTemplateId(data.templateId);
      // }   
      if (language === Language.EN) {
        setTemplateId(process.env.NEXT_PUBLIC_DOCUSEAL_TEMPLATE_ID_EN as string);
      } else {
        setTemplateId(process.env.NEXT_PUBLIC_DOCUSEAL_TEMPLATE_ID_ES as string);
      }
    }
    runAsync();
  }, [])

  const openDocumentSign = async () => {
    // setLoading(true);
    // const safePayload = {
    //   rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
    //   owner: '',
    //   threshold: 1,
    //   id: id,
    //   chainid: globalChainId
    // } as CreateAccountOptions;
    // const safeAddress = await createAccount(safePayload);
    // setSafeAddress(id, safeAddress);
    // updateSafeWalletDetails(id, safeAddress);
    // setLoading(false);
    // refresh();
  }

  const customCss = `
    #form_container {
      color: #000000;
    }

    div {
      color: #000000;
    }

    p {
      color: #000000;
    }

    svg {
      color: #000000;
    }
  `;

  if (loading) return <Skeleton variant={'rounded'} width="100%" height={200} />;
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
      {type === 'modal' && 
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
      
      {type === 'card' && 
        <Box sx={{ display: 'block'}}>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mx={5} my={1} spacing={3} width={'100%'}>
              {user && user.primaryEmailAddress && templateId.length > 0 && sfdcUser && 
                <DocusealForm
                  src={`https://docuseal.com/d/${templateId}`}
                  email={user.primaryEmailAddress.emailAddress}
                  onComplete={handleComplete}
                  logo={'/icon.png'}
                  customCss={customCss}
                  values={{
                    Name: sfdcUser.firstName || '' + ' ' + sfdcUser.lastName || '',
                  }}
                  withTitle={false}
                />
              }
          </Stack>
        </Box>
      }

      <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'lg'}>
        {/* <DialogTitle>{languageData[language].Onboarding.empty_disclosure_title}</DialogTitle> */}
        <DialogContent sx={{ display: 'block'}}>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mx={5} my={1} spacing={3} width={'100%'}>
                {user && user.primaryEmailAddress && templateId.length > 0 && sfdcUser && 
                  <DocusealForm
                    src={`https://docuseal.com/d/${templateId}`}
                    email={user.primaryEmailAddress.emailAddress}
                    onComplete={handleComplete}
                    logo={'/icon.png'}
                    customCss={customCss}
                    values={{
                      Name: sfdcUser.firstName || '' + ' ' + sfdcUser.lastName || '',
                    }}
                    withTitle={false}
                  />
                }
            </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SignRiskDisclosure;
