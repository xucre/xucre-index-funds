import { useState, useEffect, useMemo } from 'react';
import { getUSDCBalance } from '@/service/alchemy';
import { getOrganizationSafeAddress } from '@/service/db';

export function useEscrowBalance(organizationId: string) {
  const [balance, setBalance] = useState<number | null>(null);
  
  const fetchBalance = async () => {
    const safeAddress = await getOrganizationSafeAddress(organizationId, 'escrow');
    if (safeAddress && safeAddress.length > 0) {
      const usdcBalance = await getUSDCBalance(safeAddress);
      if (!usdcBalance) return;
      setBalance(usdcBalance);
    }
  };

  useEffect(() => {
    
    fetchBalance();
  }, [organizationId]);

  const memoizedValue = useMemo(() => ({
    balance,
    refresh: () => fetchBalance(),
  }), [balance]);

  return memoizedValue;
}
