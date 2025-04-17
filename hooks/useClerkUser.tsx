import { useState, useEffect, useMemo, use } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { getSafeAddress } from '@/service/db';
import { enqueueSnackbar } from 'notistack';
import { getSafeOwner, transferSignerOwnership } from '@/service/safe/safev2';
import { globalChainId } from '@/service/constants';

export function useClerkUser() {
  const {user: clerkUser, isSignedIn} = useUser();
  const {organization} = useOrganization();
  const [user, setUser] = useState(clerkUser);
  const [safeWallet, setSafeWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleCheckSafeOwnership = async () => {
      if (!safeWallet) return;
      const owners = await getSafeOwner(globalChainId, safeWallet);
      console.log('owners',owners, safeWallet)
      const hasEOAOwner = owners.includes(process.env.NEXT_PUBLIC_DEVACCOUNTADDRESS as string);
      if (hasEOAOwner) {
        handeTransferOwnership();
        //createEscrowAddress();
      }
  }
  
  const handeTransferOwnership = async () => {
    if (!safeWallet) return;
    //if (!safeWallet) return;
    const hash = await transferSignerOwnership({
      chainid: globalChainId,
      safeWallet: safeWallet
    });
    // addSignerOwnership
    // const hash = await removeSignerOwnership({
    //   chainid: globalChainId,
    //   safeWallet: escrowAddress
    // });
    console.log('Transfer ownership successful, transaction hash:', hash);
    enqueueSnackbar(`Transfer ownership successful: ${hash}`, {variant: 'success', autoHideDuration: 3000})
  }

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

  useEffect(() => {
    if (!safeWallet) return;
    handleCheckSafeOwnership();
  }, [safeWallet]);
  
  const memoizedValue = useMemo(() => ({
    user,
    organization,
    isSignedIn,
    safeWallet,
    loading,
    refresh: () => syncUser(),
    refreshSafeWallet: () => syncSafeWallet(),
  }), [user, isSignedIn, safeWallet, loading, organization]);

  return memoizedValue;
}
