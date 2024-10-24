

import type { Metadata } from 'next';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Inter } from 'next/font/google';
import './globals.css';


import { headers } from 'next/headers' // added
import Wrapper from './clientWrapper';
import { ContextProvider } from '@/context'
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

const metadata: Metadata = {
  title: 'Xucre: Swap dApp',
  description: 'dApp enabling swaps in the Xucre wallet',
  icons: '/favicon.ico'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const cookies = headers().get('cookie')

  return (
    <html lang="en">
      <link rel="icon" type="image/x-icon" href="/favicon.ico"></link>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <title>Xucre: Index Funds dApp</title>
      </head>
      <body>
        <Suspense>
          <ContextProvider cookies={cookies}>
            <Wrapper children={children} />
          </ContextProvider>
        </Suspense>
      </body>
    </html>
  );
}