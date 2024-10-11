'use client'
import { OrganizationProfile, Protect, useOrganization, useUser } from "@clerk/nextjs";
import { Box, useTheme } from "@mui/material"
import router from "next/router";
import { dark } from "@clerk/themes";
import React from "react";
import EmptyOrganization from "@/components/organization/EmptyOrganization";

// components/LoadingIndicator.tsx
export default function Organization() {
  const theme = useTheme();
  const { user } = useUser();
  const { organization } = useOrganization();

  const isDarkTheme = theme.palette.mode === 'dark';

  return (
    <>
      {organization &&
        <Protect permission={'org:sys_memberships:manage'}>
          <Box alignItems={'center'} display={'flex'} justifyContent={'center'} width={'full'} mx={5} my={1} pb={10}>
            <OrganizationProfile appearance={{ baseTheme: isDarkTheme ? dark : undefined, }} path="/organization" />
          </Box>
        </Protect>
      }
      {!organization &&
        <EmptyOrganization onCreateOrganization={() => router.push('/organization/create')} />
      }
    </>


  );
};