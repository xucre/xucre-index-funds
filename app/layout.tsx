'use client';
import type { Metadata } from 'next';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { headers } from 'next/headers'
import { Inter } from 'next/font/google';
import './globals.css';

import { cookieToInitialState } from 'wagmi'

import Wrapper from './clientWrapper';
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
          <Wrapper children={children} />
        </Suspense>
      </body>
    </html>
  );
}