import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';

export function useClerkUser() {
  const {user: clerkUser, isSignedIn} = useUser();
  const [user, setUser] = useState(clerkUser);
  const [balance, setBalance] = useState<number | null>(null);
  
  const syncUser = async () => {
    if (!isSignedIn) {
      setUser(null);
      return;
    }
    if (!clerkUser) return;
    if (user && user.id === clerkUser.id) return;
    setUser(clerkUser);
  };

  useEffect(() => {
    syncUser();
  }, [clerkUser]);

  const memoizedValue = useMemo(() => ({
    user,
    isSignedIn,
    refresh: () => syncUser(),
  }), [balance]);

  return memoizedValue;
}
