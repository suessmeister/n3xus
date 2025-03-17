'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'

export interface BetHistory {
  id: string
  type: string
  option: string
  stake: number
  result: 'win' | 'loss' | 'pending'
  payout?: number
  timestamp: number
}

export default function UserStats() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [betHistory] = useState<BetHistory[]>([
    {
      id: '1',
      type: 'Next At Bat',
      option: 'Home Run',
      stake: 1,
      result: 'win',
      payout: 3.5,
      timestamp: Date.now() - 300000
    },
    {
      id: '2',
      type: 'Inning Result',
      option: 'Boston Red Sox - Run Scored',
      stake: 0.5,
      result: 'loss',
      timestamp: Date.now() - 600000
    },
    {
      id: '3',
      type: 'Pitch Type',
      option: 'Fastball Strike',
      stake: 0.75,
      result: 'pending',
      timestamp: Date.now() - 120000
    }
  ])

  const { data: balance = 0 } = useQuery({
    queryKey: ['balance', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey || !connection) return 0
      try {
        const balance = await connection.getBalance(publicKey)
        return balance / LAMPORTS_PER_SOL
      } catch (error) {
        console.error('Error fetching balance:', error)
        return 0
      }
    },
    enabled: !!publicKey && !!connection,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  })

  return (
    <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-6 mb-6 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
          Your Stats
        </h2>
        <div className="flex items-center px-4 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
          <span className="text-emerald-400 font-medium">{balance.toFixed(2)} SOL</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-emerald-400/80">Recent Bets</h3>
        <div className="space-y-3">
          {betHistory.map((bet) => (
            <div
              key={bet.id}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-white/10 transition-colors"
            >
              <div className="space-y-1">
                <div className="font-medium text-white/90">{bet.type}</div>
                <div className="text-sm text-emerald-400/80">
                  {bet.option} - {bet.stake} SOL
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(bet.timestamp).toLocaleString()}
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg font-medium ${{
                'win': 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
                'loss': 'bg-red-400/10 text-red-400 border border-red-400/20',
                'pending': 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
              }[bet.result]}`}>
                {bet.result === 'win' ? `+${bet.payout} SOL` : 
                 bet.result === 'loss' ? `-${bet.stake} SOL` : 
                 'Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
