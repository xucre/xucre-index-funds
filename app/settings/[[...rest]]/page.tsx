'use client'
import { SignOutButton, UserButton, UserProfile } from "@clerk/nextjs";
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, useTheme } from "@mui/material"
import LinkIcon from '@mui/icons-material/Link';
import { Suspense, useEffect, useMemo, useState } from "react";
import { dark } from "@clerk/themes";
import WalletManagement from "@/components/settings/WalletManagement";
import { ThemeSwitcherElement } from "@/hooks/useThemeSwitcher";
import LanguageSelect from "@/components/ui/languageSelect";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import TonalityIcon from '@mui/icons-material/Tonality';
import SocialIcons from "@/components/ui/socialIcons";
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import WalletIcon from '@mui/icons-material/Wallet';
import BadgeIcon from '@mui/icons-material/Badge';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import EditUserProfile from "@/components/settings/EditUserProfile";
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import { useLanguage } from '@/hooks/useLanguage';
import EditUserPortfolio from "@/components/settings/EditUserPortfolio";
import { useSFDC } from "@/hooks/useSFDC";
import { isNull } from "@/service/helpers";
import React from "react";
import PrivacyPolicy from "@/components/support/PrivacyPolicy";
import OpaqueCard from "@/components/ui/OpaqueCard";
import IntroductionContainer from "@/components/onboarding/IntroductionContainer";
import { step } from "viem/chains";
import { usePathname } from 'next/navigation';

// components/LoadingIndicator.tsx
export default function Settings() {
  const theme = useTheme();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const {language, languageData} = useLanguage();
  const isDarkTheme = theme.palette.mode === 'dark';
  const {sfdcUser: sfdcUserRaw, refresh} = useSFDC();
  const sfdcUser = useMemo(() => (sfdcUserRaw), [sfdcUserRaw]);
  const Display = () => (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" spacing={2} width={'100%'} justifyContent={'space-between'} >
        <Typography variant={'h6'}>{languageData[language].Settings.view_theme}</Typography>
        <ThemeSwitcherElement />
      </Stack>
      <Divider />
      <Stack direction="row" spacing={2} width={'100%'} justifyContent={'space-between'} >
        <Typography variant={'h6'}>{languageData[language].Settings.view_language}</Typography>
        <LanguageSelect type={'menu'} />
      </Stack>
      <Divider />
      <Stack direction="row" spacing={2} width={'100%'} justifyContent={'space-between'} >
        <Typography variant={'h6'}>{languageData[language].Settings.view_social}</Typography>
        <SocialIcons discordUrl={'https://discord.gg/F4gaehZ7'} emailUrl={'mailto:support@xucre.io'} twitterUrl={'https://x.com/WalletXucre'} githubUrl={null} instagramUrl={null} governanceUrl={null} websiteUrl={'https://linktr.ee/xucrewallet'} gitbookUrl={null} />
      </Stack>
    </Stack>
  )
  
  useEffect(() => {
    console.log('loading settings page');
  }, [])
  
  const isPersonalInformationComplete = !isNull(sfdcUser.lastName) && !isNull(sfdcUser.firstName) && !isNull(sfdcUser.street) && !isNull(sfdcUser.city) && !isNull(sfdcUser.province) && !isNull(sfdcUser.postalCode) && !isNull(sfdcUser.country);
  const isIdentificationComplete = !isNull(sfdcUser.idCardNumber) && !isNull(sfdcUser.idExpirationDate) && !isNull(sfdcUser.idIssueDate) && !isNull(sfdcUser.backImage) && !isNull(sfdcUser.frontImage);
  const isBeneficiaryComplete = true;//!isNull(sfdcUser.beneficiaries);
  const isPortfolioComplete = useMemo(() => !isNull(sfdcUser.riskTolerance) && !isNull(sfdcUser.salaryContribution), [sfdcUser.riskTolerance, sfdcUser.salaryContribution]);
  const UserProfileMemoized = React.memo(UserProfile);
  
  const navigationList = [
    {
      label: languageData[language].Settings.view_portfolio,
    },
    {
      label: languageData[language].Edit.personal_information,
    },
    {
      label: languageData[language].Edit.id_section,
    },
    {
      label: languageData[language].Edit.beneficiary_section,
    },
    {
      label: languageData[language].Settings.view_web3,
    },
    {
      label: languageData[language].Settings.view_display,
    }
  ]

  const getProfileIcon = (index: number) => {
    const portfolioIcon = isPortfolioComplete ? <WalletIcon fontSize="small" /> : <WarningAmberIcon color={'warning'} fontSize="small"/>;
    const personalIcon = isPersonalInformationComplete ? <BadgeIcon fontSize="small" /> : <WarningAmberIcon color={'warning'} fontSize="small"/>;
    const idIcon = isIdentificationComplete ? <ContactMailIcon fontSize="small" /> : <WarningAmberIcon color={'warning'} fontSize="small"/>;
    const beneficiaryIcon = isBeneficiaryComplete ? <RecentActorsIcon fontSize="small" /> : <WarningAmberIcon color={'warning'} fontSize="small"/>;
    const icons = [portfolioIcon, personalIcon, idIcon, beneficiaryIcon, <LinkIcon fontSize="small" />, <DisplaySettingsIcon fontSize="small" />];
    return icons[index];
  }

  useEffect(() => {
    console.log('pathname', pathname);
    const path = pathname.split('/').pop();
    if (path === 'portfolio') {
      setStep(0);
    } else if (path === 'personal') {
      setStep(1);
    } else if (path === 'identification') {
      setStep(2);
    } else if (path === 'beneficiaries') {
      setStep(3);
    } else if (path === 'web3') {
      setStep(4);
    } else if (path === 'display') {
      setStep(5);
    }
  }, [pathname])
  return (
    <OpaqueCard sx={{mx:4, p:0, my:4}}>
      <Stack direction={'row'} spacing={2} width={'full'}>
        
          <List sx={{minWidth: '15rem', pt:2}} >
            {
              navigationList.map((item, index) => {
                return <ListItemButton key={index} selected={step === index} onClick={() => setStep(index)} >
                  <ListItemIcon>
                      {getProfileIcon(index)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                  />
                </ListItemButton>
              })
            }
          </List>
          {step === 0 && 
            <OpaqueCard sx={{borderRadius: '0px 5px 5px 0px', width: '-webkit-fill-available'}}><EditUserPortfolio /></OpaqueCard> 
          }
          {step === 1 && 
            <OpaqueCard sx={{borderRadius: '0px 5px 5px 0px', width: '-webkit-fill-available'}}><EditUserProfile selectedTab={0}/></OpaqueCard> 
          }
          {step === 2 && 
            <OpaqueCard sx={{borderRadius: '0px 5px 5px 0px', width: '-webkit-fill-available'}}><EditUserProfile selectedTab={1}/></OpaqueCard> 
          }
          {step === 3 && 
            <OpaqueCard sx={{borderRadius: '0px 5px 5px 0px', width: '-webkit-fill-available'}}><EditUserProfile selectedTab={2}/></OpaqueCard> 
          }
          {step === 4 && 
            <OpaqueCard sx={{borderRadius: '0px 5px 5px 0px', width: '-webkit-fill-available'}}><WalletManagement /></OpaqueCard> 
          }
          {step === 5 && 
            <OpaqueCard sx={{borderRadius: '0px 5px 5px 0px', width: '-webkit-fill-available'}}><Display /></OpaqueCard> 
          }
      </Stack>
    </OpaqueCard>
  )
  
  return (
      <Box alignItems={'center'} display={'flex'} justifyContent={'center'} width={'full'} mx={5} my={1} pb={10}>
        
          <UserProfile
            appearance={{ baseTheme: isDarkTheme ? dark : undefined, }}

          >
            <UserProfile.Page label={languageData[language].Settings.view_portfolio} labelIcon={isPortfolioComplete ? <WalletIcon fontSize="small" /> : <WarningAmberIcon color={'warning'} fontSize="small"/>} url="portfolio">
              <OpaqueCard sx={{px: 4, py: 2}}><EditUserPortfolio /></OpaqueCard>
            </UserProfile.Page>
            <UserProfile.Page label={languageData[language].Edit.personal_information} labelIcon={isPersonalInformationComplete ? <BadgeIcon fontSize="small" /> : <WarningAmberIcon color={'warning'} fontSize="small"/>} url="personal">
              <OpaqueCard sx={{px: 4, py: 2}}><EditUserProfile selectedTab={0}/></OpaqueCard>
            </UserProfile.Page>
            <UserProfile.Page label={languageData[language].Edit.id_section} labelIcon={isIdentificationComplete ? <ContactMailIcon fontSize="small" /> : <WarningAmberIcon color={'warning'} fontSize="small"/>} url="identification">
              <OpaqueCard sx={{px: 4, py: 2}}><EditUserProfile selectedTab={1}/></OpaqueCard>
            </UserProfile.Page>
            <UserProfile.Page label={languageData[language].Edit.beneficiary_section} labelIcon={isBeneficiaryComplete ? <RecentActorsIcon fontSize="small" /> : <WarningAmberIcon color={'warning'} fontSize="small"/>} url="beneficiaries">
              <OpaqueCard sx={{px: 4, py: 2}}><EditUserProfile selectedTab={2}/></OpaqueCard>
            </UserProfile.Page>
            <UserProfile.Page label={languageData[language].Settings.view_web3} labelIcon={<LinkIcon fontSize="small" />} url="web3">
              <WalletManagement />
            </UserProfile.Page>
            <UserProfile.Page label={languageData[language].Settings.view_display} labelIcon={<DisplaySettingsIcon fontSize="small" />} url="display">
              <Display />
            </UserProfile.Page>
            {/* <UserProfile.Page label={languageData[language].Settings.view_privacy} labelIcon={<PrivacyTipIcon fontSize="small" />} url="privacy">
              <PrivacyPolicy />
            </UserProfile.Page> */}
            {/* <UserProfile.Page label="Logout" labelIcon={<LinkIcon fontSize="small" />} url="logout">
              <SignOutButton />
            </UserProfile.Page> */}

          </UserProfile>   

          <OpaqueCard sx={{px: 4, py: 2}}><EditUserPortfolio/></OpaqueCard>   
      </Box>
  );
};