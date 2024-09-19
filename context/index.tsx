'use client'

import React, { ReactNode, useEffect } from 'react'
import { config, projectId } from '@/config'

import { createWeb3Modal } from '@web3modal/wagmi/react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SnackbarProvider } from 'notistack';


import { State, WagmiProvider } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { useTheme } from '@mui/material'

// Setup queryClient
const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')



export function ContextProvider({
  children,
  initialState
}: {
  children: ReactNode
  initialState?: State
}) {
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const _config = config;
  const _initialState = { ...initialState, reconnectOnMount: true };
  useEffect(() => {
    createWeb3Modal({
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
        //'--w3m-color-mix': '#78D217',
        //'--w3m-color-mix-strength': 40
      }
    })
    setIsLoaded(true)
  }, [])
  if (!isLoaded) return null;
  return (
    <WagmiProvider config={_config} initialState={_initialState}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider maxSnack={3} >
          {children}
        </SnackbarProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}