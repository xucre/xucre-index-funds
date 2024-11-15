'use client'
import { OrganizationProfile, OrganizationSwitcher, Protect, useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { Box, Chip, Stack, Typography, useTheme } from "@mui/material"
import router from "next/router";
import { dark } from "@clerk/themes";
import React, { useEffect } from "react";
import EmptyOrganization from "@/components/organization/EmptyOrganization";
import { useOrganizationWallet } from "@/hooks/useOrganizationWallet";
import EmptyEscrowWallet from "@/components/onboarding/EmptyEscrowWallet";
import OrganizationMembersTable from "@/components/organization/OrganizationMembersTable";
import CreateUserModal from "@/components/organization/CreateUserModal";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { setOrganizationSafeAddress } from "@/service/db";
import { isDev } from "@/service/constants";

// components/LoadingIndicator.tsx
export default function Organization() {
  const theme = useTheme();
  const { user } = useUser();
  const {userMemberships, setActive} = useOrganizationList();
  const { organization, isLoaded } = useOrganization();
  const isDarkTheme = theme.palette.mode === 'dark';

  useEffect(() => {
    if (userMemberships.count > 0) {
      const org = userMemberships.data[0];
      setActive({organization: org.id});
    }
  }, [organization, userMemberships])

  const clearSafewallet = async () => {
    await setOrganizationSafeAddress(organization.id, null, 'escrow');
  }
  
  return (
    <>
      {isLoaded && false && 
        <Protect permission={'org:sys_memberships:manage'}>
          <OpaqueCard sx={{px:2}}>
            <Stack direction={'column'} alignItems={'start'} display={'flex'} justifyContent={'center'} mx={5} my={1} pb={10}>
              
              <Stack direction={'row'} alignItems={'center'} width={'100%'} justifyContent={'space-between'} mb={2}>
                <Typography variant={'h5'}>Members</Typography>
                {isDev && <Chip color={'error'} sx={{fontWeight: 'bold', px: 3, py: 1}} onClick={clearSafewallet} label={'Clear Escrow Wallet'} /> }
              </Stack>
              <OrganizationMembersTable />
            </Stack>
          </OpaqueCard>
        </Protect>
      }
      {isLoaded && 
        <>
          <Protect permission={'org:sys_memberships:manage'}>
              <OrganizationProfile appearance={{ baseTheme: isDarkTheme ? dark : undefined, }} path="/organization" />
          </Protect>
        </>
      }
      {!organization &&
        <></>
      }
    </>
  );
};