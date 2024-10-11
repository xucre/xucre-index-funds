'use client'

import React, { ReactNode, useEffect } from 'react'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack';
import { ClerkProvider } from '@clerk/nextjs'
import { wagmiAdapter, config, projectId, networks } from '@/config'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, polygon, type AppKitNetwork } from '@reown/appkit/networks'
import { cookieToInitialState, State, WagmiProvider, type Config } from 'wagmi'

import { useTheme } from '@mui/material'
import { SFDCProvider } from '@/hooks/useSFDC'
import { GoldRushProvider } from '@covalenthq/goldrush-kit'
import '@covalenthq/goldrush-kit/styles.css'

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
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
  //const [modalState, setModalState] = React.useState(null as any);
  useEffect(() => {
    console.log('theme', theme.palette.mode)
    /*const result = createWeb3Modal({
      defaultChain: polygon,
      projectId,
      wagmiConfig: _config,
      enableAnalytics: true,
      excludeWalletIds: [
        //'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
        //'4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
      ],
      includeWalletIds: [
        //'3e2f036d9c513d07af5468ad7672e42a27432a54eb1242e498d1a1be1f488c4d',
      ],
      themeMode: theme.palette.mode,
      themeVariables: {
        '--w3m-color-mix': theme.palette.mode === 'dark' ? '#D4E815' : '#1B1E3F',
        //'--w3m-color-mix-strength': 40
      }
    })*/
    //setModalState(result)
    setIsLoaded(true)
  }, [])

  if (!isLoaded) return null;
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider >
          <SnackbarProvider maxSnack={3} >
            <GoldRushProvider
              apikey={process.env.NEXT_PUBLIC_COVALENT_API_KEY} //use your API key
              theme={{
                mode: theme.palette.mode,
                colors: {
                  light: {
                    primary: '#1B1E3F',
                    secondary: '#1B1E3F',
                    background: '#ffffff',
                    foreground: '#ffffff'
                  },
                  dark: {
                    primary: '#D4E815',
                    secondary: '#1B1E3F',
                    background: '#121212 !important',
                    foreground: '#ffffff'
                  }
                }
              }}
            >
              <SFDCProvider>
                {children}
              </SFDCProvider>
            </GoldRushProvider>
          </SnackbarProvider>
        </ClerkProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}