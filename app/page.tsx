'use client';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletNotConnected from '@/components/walletNotConnected';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  useEffect(() => {
    if (isConnected) {
      //router.replace('/index-fund')
    }
  }, [isConnected]);

  return (
    <main>
      {!isConnected &&
        <WalletNotConnected />
      }
    </main>
  );
}
