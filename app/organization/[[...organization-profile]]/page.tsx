'use client'
import { OrganizationProfile, OrganizationSwitcher, Protect, useOrganizationList } from "@clerk/nextjs";
import { Box, Chip, Stack, Typography, useTheme } from "@mui/material"
import router from "next/router";
import { dark } from "@clerk/themes";
import React, { useEffect } from "react";
import EmptyOrganization from "@/components/organization/EmptyOrganization";
import EmptyEscrowWallet from "@/components/onboarding/EmptyEscrowWallet";
import OrganizationMembersTable from "@/components/organization/OrganizationMembersTable";
import CreateUserModal from "@/components/organization/CreateUserModal";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { setOrganizationSafeAddress } from "@/service/db";
import { isDev } from "@/service/constants";
import { useClerkUser } from "@/hooks/useClerkUser";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";

// components/LoadingIndicator.tsx
export default function Organization() {
  const theme = useTheme();
  const { user } = useClerkUser();
  const {userMemberships, setActive} = useOrganizationList();
  const { organization, isLoaded } = useClerkOrganization();
  const isDarkTheme = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!userMemberships || !userMemberships.count || !setActive) return;
    if (userMemberships.count > 0) {
      console.log('setting active organization', userMemberships);
      const org = userMemberships.data[0];

      //setActive({organization: org.id});
    }
  }, [organization, userMemberships])
  
  return (
    <Box alignItems={'center'} display={'flex'} justifyContent={'center'} width={'full'} mx={5} my={1} pb={10}>
      {isLoaded && false && 
        <Protect permission={'org:sys_memberships:manage'}>
          <OpaqueCard sx={{px:2}}>
            <Stack direction={'column'} alignItems={'start'} display={'flex'} justifyContent={'center'} mx={5} my={1} pb={10}>
              
              <Stack direction={'row'} alignItems={'center'} width={'100%'} justifyContent={'space-between'} mb={2}>
                <Typography variant={'h5'}>Members</Typography>
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
    </Box>
  );
};