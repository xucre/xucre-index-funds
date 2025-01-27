import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { getSafeAddress } from '@/service/db';

export function useClerkUser() {
  const {user: clerkUser, isSignedIn} = useUser();
  const [user, setUser] = useState(clerkUser);
  const [safeWallet, setSafeWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSafeWallet = async () => {
    if (!user) return;
    //setSafeWallet(null);
    const walletAddress = await getSafeAddress(user.id);
    if (walletAddress) {
      setSafeWallet(walletAddress);
    } else {
      setSafeWallet(null);
    }
  }
  const syncUser = async () => {
    if (!isSignedIn) {
      setUser(null);
      return;
    }
    if (!clerkUser) return;
    if (user && user.id === clerkUser.id) return;
    setUser(clerkUser);
  };

  const runSyncs = async () => {
    await syncUser();
    await syncSafeWallet();
    setLoading(false);
  }
  useEffect(() => {
    runSyncs();
  }, [clerkUser]);

  const memoizedValue = useMemo(() => ({
    user,
    isSignedIn,
    safeWallet,
    loading,
    refresh: () => syncUser(),
    refreshSafeWallet: () => syncSafeWallet(),
  }), [user, isSignedIn, safeWallet, loading]);

  return memoizedValue;
}
