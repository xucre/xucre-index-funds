import { useEffect, useMemo, useState } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { getOrganizationSafeAddress, setOrganizationSafeAddress } from '@/service/db';
import { createAccount } from '@/service/safe';

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
        const safeAddress = await createAccount({
            rpcUrl: 'https://endpoints.omniatech.io/v1/eth/sepolia/public',
            owner: '',
            threshold: 1,
            singleOwner: true,
            //signer: '',
        });
        setOrganizationSafeAddress(organization.id, safeAddress, 'escrow');
        setEscrowAddress(safeAddress);

        setLoading(true);
    }
    const createSelfAddress = async () => {
        setLoading(true);
        // create escrow address
        const safeAddress = await createAccount({
            rpcUrl: 'https://endpoints.omniatech.io/v1/eth/sepolia/public',
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