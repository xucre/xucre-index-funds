'use client';
import { Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';

export function walletClientToSigner(walletClient) {
  if (walletClient) {
    const provider = new Web3Provider(walletClient.transport, 'any');
    const signer = provider.getSigner();
    return signer;
  } else {
    throw Error('WalletClient not found');
  }
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });

  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient],
  );
}