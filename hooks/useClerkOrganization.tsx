import { useState, useEffect, useMemo } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';

export function useClerkOrganization() {
  const {organization: clerkOrganization, isLoaded} = useOrganization();
  const [organization, setOrganization] = useState(clerkOrganization);
  const [balance, setBalance] = useState<number | null>(null);
  //const [isLoaded, setIsLoaded] = useState(false);

  const syncOrganization = async () => {
    if (!clerkOrganization) return;
    if (organization && clerkOrganization.id === organization.id) return;
    setOrganization(clerkOrganization);
    
  };

  useEffect(() => {
    syncOrganization();
    //setIsLoaded(true);
  }, [clerkOrganization]);

  const memoizedValue = useMemo(() => ({
    organization,
    isLoaded,
    refresh: () => syncOrganization(),
  }), [balance]);

  return memoizedValue;
}
