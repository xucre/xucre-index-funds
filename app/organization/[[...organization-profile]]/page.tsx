'use client'
import { OrganizationProfile, OrganizationSwitcher, Protect, useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { Box, Stack, Typography, useTheme } from "@mui/material"
import router from "next/router";
import { dark } from "@clerk/themes";
import React, { useEffect } from "react";
import EmptyOrganization from "@/components/organization/EmptyOrganization";
import { useOrganizationWallet } from "@/hooks/useOrganizationWallet";
import EmptyEscrowWallet from "@/components/onboarding/EmptyEscrowWallet";
import OrganizationMembersTable from "@/components/organization/OrganizationMembersTable";
import CreateUserModal from "@/components/organization/CreateUserModal";
import OpaqueCard from "@/components/ui/OpaqueCard";

// components/LoadingIndicator.tsx
export default function Organization() {
  const theme = useTheme();
  const { user } = useUser();
  const {userMemberships, setActive} = useOrganizationList();
  const { organization, isLoaded } = useOrganization();
  const { escrowAddres, hasEscrowAddress, createEscrowAddress } = useOrganizationWallet();
  const isDarkTheme = theme.palette.mode === 'dark';

  useEffect(() => {
    if (userMemberships.count > 0) {
      const org = userMemberships.data[0];
      setActive({organization: org.id});
    }
  }, [organization, userMemberships])

  useEffect(() => {
    console.log(escrowAddres);
  } , [escrowAddres])
  return (
    <>
      {isLoaded && hasEscrowAddress && 
        <Protect permission={'org:sys_memberships:manage'}>
          <OpaqueCard sx={{px:2}}>
            <Stack direction={'column'} alignItems={'start'} display={'flex'} justifyContent={'center'} mx={5} my={1} pb={10}>
              {/* <OrganizationProfile appearance={{ baseTheme: isDarkTheme ? dark : undefined, }} path="/organization" /> */}
              <Typography variant={'h5'}>Members</Typography>
              <OrganizationMembersTable />
            </Stack>
          </OpaqueCard>
        </Protect>
      }

      {isLoaded && !hasEscrowAddress && 
        <Protect permission={'org:sys_memberships:manage'}>
          <EmptyEscrowWallet onCreateSafe={createEscrowAddress} />
        </Protect>
      }
      {!organization &&
        <></>
      }
    </>
  );
};