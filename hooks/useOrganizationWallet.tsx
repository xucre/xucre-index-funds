export const maxDuration = 60; // Applies to the action
import { useEffect, useMemo, useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { getOrganizationSafeAddress, setOrganizationSafeAddress } from '@/service/db';
import { createAccount, CreateAccountOptions, createAccountV2 } from '@/service/safe';
import { globalChainId, isDev } from '@/service/constants';

export function useOrganizationWallet() {
    const {organization} = useOrganization();
    const [loading, setLoading] = useState(true);
    const [escrowAddress, setEscrowAddress] = useState(null as string | null);
    const [selfAddress, setSelfAddress] = useState(null as string | null);

    const refresh = async () => {
      if (!organization) return;
      setLoading(true);
      const selfAddress2 = await getOrganizationSafeAddress(organization.id, 'self');
      const escrowAddress2 = await getOrganizationSafeAddress(organization.id, 'escrow');
      
      setEscrowAddress(escrowAddress2);
      setSelfAddress(selfAddress2);
      setLoading(false);
    }
    
    useEffect(() => {        
        if (organization) {
            refresh();
        }
    }, [])

    const hasEscrowAddress = !!escrowAddress;
    const hasSelfAddress = !!selfAddress;

    const createEscrowAddress = async () => {
        if (!organization) return;
        setLoading(true);
        // create escrow address
        const safePayload = isDev ? { 
            rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
            owner: '',
            id: organization.id,
            threshold: 1
          } as CreateAccountOptions : {
            rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
            owner: '',
            threshold: 1,
            id: organization.id,
            chainid: globalChainId
          } as CreateAccountOptions;
        const safeAddress = await createAccount(safePayload);
        setOrganizationSafeAddress(organization.id, safeAddress, 'escrow');
        setEscrowAddress(safeAddress);

        setLoading(false);
    }
    const createSelfAddress = async () => {
        if (!organization) return;
        setLoading(true);
        // create escrow address
        const safeAddress = await createAccount({
            rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL as string,
            owner: '',
            threshold: 1,
            singleOwner: true,
            id: organization.id,
            //signer: '',
        });
        setOrganizationSafeAddress(organization.id, safeAddress, 'self');
        setSelfAddress(safeAddress);
        setLoading(false);
    }
    return useMemo(
        () => ({ escrowAddress, selfAddress, hasEscrowAddress, hasSelfAddress, createEscrowAddress, createSelfAddress, loading, refresh }),
        [escrowAddress, selfAddress, loading],
    );
}