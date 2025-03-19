'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../../components/solana/solana-provider'
import Link from 'next/link'

interface Player {
  id: string
  username: string
  wins: number
  gamesPlayed: number
  lastPlayed: string
}

export default function LeaderboardPage() {
  const { publicKey } = useWallet()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('http://127.0.0.1:5000/leaderboard')
        if (!response.ok) throw new Error('Failed to fetch leaderboard')
        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setError('Could not load leaderboard. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateWinRate = (wins: number, gamesPlayed: number) => {
    if (gamesPlayed === 0) return '0%'
    const winRate = (wins / gamesPlayed) * 100
    return `${winRate.toFixed(1)}%`
  }

  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <div>
              <h1 className="text-3xl font-bold mb-6">Connect your wallet to view the leaderboard</h1>
              <WalletButton className="btn btn-primary" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link 
            href="/multiplayer"
            className="btn btn-primary"
          >
            Multiplayer Games
          </Link>
          <Link 
            href="/"
            className="btn btn-outline"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No players yet</h2>
          <p className="text-gray-600 mb-6">Be the first to play and get on the leaderboard!</p>
          <Link href="/multiplayer" className="btn btn-primary">
            Start Playing
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-right">Wins</th>
                <th className="px-4 py-3 text-right">Games</th>
                <th className="px-4 py-3 text-right">Win Rate</th>
                <th className="px-4 py-3 text-right">Last Played</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr 
                  key={player.id} 
                  className={`border-t hover:bg-gray-50 ${index < 3 ? 'font-semibold' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {index === 0 ? (
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-400 text-white">1</span>
                      ) : index === 1 ? (
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-white">2</span>
                      ) : index === 2 ? (
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-600 text-white">3</span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{player.username}</td>
                  <td className="px-4 py-3 text-right">{player.wins}</td>
                  <td className="px-4 py-3 text-right">{player.gamesPlayed}</td>
                  <td className="px-4 py-3 text-right">{calculateWinRate(player.wins, player.gamesPlayed)}</td>
                  <td className="px-4 py-3 text-right">{formatDate(player.lastPlayed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 