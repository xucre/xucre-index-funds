'use client'

import { useState, useEffect, useMemo } from 'react';
import { useOrganization, useOrganizationList, useUser } from '@clerk/nextjs';

export function useClerkOrganization() {
  const {organization: clerkOrganization, isLoaded} = useOrganization();
  const [organization, setOrganization] = useState(clerkOrganization);

  const {userMemberships, setActive} = useOrganizationList();

  useEffect(() => {
    if (!userMemberships || !userMemberships.count || !setActive || !isLoaded) return;
    if (userMemberships.count > 0 && !organization) {
      //console.log('setting active organization', userMemberships);
      //const org = userMemberships.data[0];
      //setActive({organization: org.id});
    }
  }, [organization, userMemberships])
  
  const [balance, setBalance] = useState<number | null>(null);
  //const [isLoaded, setIsLoaded] = useState(false);

  const syncOrganization = () => {
    //if (!clerkOrganization) return;
    if (organization && clerkOrganization?.id === organization.id) return;
    setOrganization(clerkOrganization);   
  };

  useEffect(() => {
    syncOrganization();
    //setIsLoaded(true);
  }, [clerkOrganization]);

  const memoizedValue = useMemo(() => ({
    organization,
    userMemberships: userMemberships.data || [],
    isLoaded,
    refresh: () => syncOrganization(),
  }), [organization, userMemberships, isLoaded]);

  return memoizedValue;
}
