import { useEffect, useMemo, useState } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { getOrganizationSafeAddress, setOrganizationSafeAddress } from '@/service/db';
import { createAccount, CreateAccountOptions } from '@/service/safe';
import { isDev } from '@/service/constants';

export function useOrganizationWallet() {
    const {organization} = useOrganization();
    const [loading, setLoading] = useState(true);
    const [escrowAddres, setEscrowAddress] = useState(null as string | null);
    const [selfAddress, setSelfAddress] = useState(null as string | null);
    useEffect(() => {
        const runAsync = async () => {
            setLoading(true);
            const selfAddress2 = await getOrganizationSafeAddress(organization.id, 'self');
            const escrowAddress2 = await getOrganizationSafeAddress(organization.id, 'escrow');
            setEscrowAddress(escrowAddress2);
            setSelfAddress(selfAddress2);
            setLoading(false);
        }

        if (organization) {
            runAsync();
        }
    }, [organization])

    const hasEscrowAddress = !!escrowAddres;
    const hasSelfAddress = !!selfAddress;

    const createEscrowAddress = async () => {
        setLoading(true);
        // create escrow address
        const safePayload = isDev ? { 
            rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
            owner: '',
            threshold: 1
          } as CreateAccountOptions : {
            rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
            owner: '',
            threshold: 1,
            chainid: 137
          } as CreateAccountOptions;
        console.log('createEscrowAddress', isDev);
        //const safeAddress = isDev ? await createAccountSelfSign(safePayload) : await createAccount(safePayload);
        const safeAddress = await createAccount(safePayload);
        setOrganizationSafeAddress(organization.id, safeAddress, 'escrow');
        setEscrowAddress(safeAddress);

        setLoading(true);
    }
    const createSelfAddress = async () => {
        setLoading(true);
        // create escrow address
        const safeAddress = await createAccount({
            rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL,
            owner: '',
            threshold: 1,
            singleOwner: true,
            //signer: '',
        });
        setOrganizationSafeAddress(organization.id, safeAddress, 'self');
        setSelfAddress(safeAddress);
        setLoading(false);
    }
    return useMemo(
        () => ({ escrowAddres, selfAddress, hasEscrowAddress, hasSelfAddress, createEscrowAddress, createSelfAddress, loading }),
        [escrowAddres, selfAddress],
    );
}