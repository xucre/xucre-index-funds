'use client'

import React, { ReactNode, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack';
import { ClerkLoaded, ClerkProvider } from '@clerk/nextjs'
import { wagmiAdapter, config, projectId, networks } from '@/config'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, polygon, type AppKitNetwork } from '@reown/appkit/networks'
import { cookieToInitialState, State, WagmiProvider, type Config } from 'wagmi'
import { dark, shadesOfPurple, experimental_createTheme } from '@clerk/themes'
import { esMX, enUS, ptBR } from '@clerk/localizations'

import { useTheme } from '@mui/material'
import { SFDCProvider } from '@/hooks/useSFDC'
import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/metadata/translations/index';
import { IndexDbContextProvider } from '@/hooks/useIndexedDB';

// Setup queryClient
const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Xucre Crypto Index Fund',
  description: 'dApp enabling users to invest in a diversified portfolio of cryptocurrencies',
  url: 'https://fund.xucre.net', // origin must match your domain & subdomain
  icons: ['https://swap.xucre.net/icon-green.png']
}

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: polygon,
  metadata: metadata,
  themeMode: 'dark',
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export function ContextProvider({
  children,
  cookies
}: {
  children: ReactNode
  cookies?: string | null
}) {
  const {language} = useLanguage();
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
  //const [modalState, setModalState] = React.useState(null as any);
  useEffect(() => {
    console.log('context mounted')
    setIsLoaded(true)
  }, [])
  const customTheme = experimental_createTheme({})
  const activeLanguage = language === Language.EN ? enUS : language === Language.PT ? ptBR : esMX;
  if (!isLoaded) return null;
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <IndexDbContextProvider>
          <ClerkProvider 
            signInUrl={'/sign-in'}
            signInFallbackRedirectUrl={'/dashboard'}
            signUpFallbackRedirectUrl={'/dashboard'}
            signUpForceRedirectUrl={'/dashboard'}
            signInForceRedirectUrl={'/dashboard'}
            signUpUrl={'/sign-up'} 
            afterSignOutUrl={'/sign-in'} 
            afterMultiSessionSingleSignOutUrl={'/sign-in'}
            appearance={{
              baseTheme: dark
            }}
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            localization={activeLanguage}
            touchSession={true}
            //polling={false}
          >
            <SnackbarProvider maxSnack={3} >
            {/* <ClerkLoaded> */}
              <SFDCProvider>
                {children}
              </SFDCProvider>
            {/* </ClerkLoaded> */}
            </SnackbarProvider>
          </ClerkProvider>
        </IndexDbContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}