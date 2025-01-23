'use client'

import { useEffect, useMemo, useState } from 'react';
import { useClerkUser } from './useClerkUser';
import { useClerkOrganization } from './useClerkOrganization';

export function useIsAdmin() {
  const { user } = useClerkUser();
  const { organization }= useClerkOrganization();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    const runAsync = async () => {
      if (!user) return;
      if (user.organizationMemberships.length > 0) {
        const hasAdmin = user.organizationMemberships.find((mem) => mem.organization.id === organization?.id)?.permissions.find((permission) => permission === 'org:sys_memberships:manage');
        //const hasAdmin = user.organizationMemberships[0].permissions.find((permission) => permission === 'org:sys_memberships:manage');
        if (hasAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        const hasSuperAdmin = user.organizationMemberships.find((mem) => mem.organization.id === organization?.id)?.permissions.find((permission) => permission === 'org:superadmin:true'); 
        if (hasSuperAdmin) {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      }
    }

    if (user) {
      runAsync();
    }
  }, [user, organization])

  return useMemo(
    () => ({ isAdmin, isSuperAdmin, user }),
    [user, organization, isAdmin, isSuperAdmin],
  );
}