'use client'
import { OrganizationProfile, OrganizationSwitcher, Protect, useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { Box, Stack, useTheme } from "@mui/material"
import router from "next/router";
import { dark } from "@clerk/themes";
import React, { useEffect } from "react";
import EmptyOrganization from "@/components/organization/EmptyOrganization";

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

  return (
    <>
      {user && user.publicMetadata.superAdmin &&
        <Stack direction={'row'} spacing={4} alignItems={'center'} justifyContent={'center'}>
          <OrganizationSwitcher
            appearance={{
              baseTheme: isDarkTheme ? dark : undefined,
            }}
            organizationProfileProps={{
              appearance: {
                baseTheme: isDarkTheme ? dark : undefined,
              }
            }}
            organizationProfileMode='navigation'
            organizationProfileUrl='/organization'
            hidePersonal={true}
          />
        </Stack> 
      }
      {isLoaded &&
        <Protect permission={'org:sys_memberships:manage'}>
          <Box alignItems={'center'} display={'flex'} justifyContent={'center'} width={'full'} mx={5} my={1} pb={10}>
            <OrganizationProfile appearance={{ baseTheme: isDarkTheme ? dark : undefined, }} path="/organization" />
          </Box>
        </Protect>
      }
      {!organization &&
        <></>
        // <EmptyOrganization onCreateOrganization={() => router.push('/organization/create')} />
      }


      
    </>


  );
};