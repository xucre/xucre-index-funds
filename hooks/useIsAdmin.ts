import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function useIsAdmin() {
  const { user } = useUser();
  //const { organization } = useOrganization();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    const runAsync = async () => {
      //console.log(memberships);
      if (user.organizationMemberships.length > 0) {
        const hasAdmin = user.organizationMemberships[0].permissions.find((permission) => permission === 'org:sys_memberships:manage');
        if (hasAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }

      if (user.publicMetadata.superAdmin) {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
    }

    if (user) {
      runAsync();
    }
  }, [user])

  return useMemo(
    () => ({ isAdmin, isSuperAdmin, user }),
    [user, isAdmin],
  );
}