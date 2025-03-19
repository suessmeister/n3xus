'use client'

import './globals.css'
import { ClusterProvider } from '@/components/cluster/cluster-data-access'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { UiLayout } from '@/components/ui/ui-layout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

const links: { label: string; path: string }[] = [
  { label: 'Today\'s Lineup', path: '/lineup' },
  { label: 'Multiplayer', path: '/multiplayer' },
  { label: 'Leaderboard', path: '/leaderboard' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ClusterProvider>
            <SolanaProvider>
              <UiLayout links={links}>{children}</UiLayout>
              <Toaster position="top-right" />
            </SolanaProvider>
          </ClusterProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
