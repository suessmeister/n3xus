'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { CircleDot, ExternalLink, RefreshCw } from 'lucide-react'
import { AuroraBackground } from '../ui/aurora-background'

interface PlayerStat {
  id: string
  rank: number
  playerName: string
  teamName: string
  value: number | string
}

interface StatCategory {
  id: string
  title: string
  description: string
  players: PlayerStat[]
  unit?: string
}

// Modern color palette
const colors = {
  primary: 'from-emerald-400 to-cyan-400',
  secondary: 'from-violet-500 to-purple-500',
  accent: 'from-pink-500 to-rose-500',
  muted: 'from-gray-700/90 to-gray-800/90',
}

// Styling classes
const styles = {
  glassCard: 'backdrop-blur-xl bg-black/20 border border-white/10',
  glowText: 'bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent',
  hoverGlow: 'hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300'
}

// API URL for MLB stats
const STATS_API_URL = "https://statsapi.mlb.com/api/v1/stats/leaders"

export default function LiveStats() {
  const { publicKey } = useWallet()
  const [statCategories, setStatCategories] = useState<StatCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("homeRuns")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Stat category definitions
  const categories = [
    { id: "homeRuns", title: "Home Runs", statGroup: "hitting", type: "homeRuns", description: "Leaders in total home runs" },
    { id: "battingAverage", title: "Batting Avg", statGroup: "hitting", type: "battingAverage", description: "Leaders in batting average" },
    { id: "era", title: "ERA", statGroup: "pitching", type: "earnedRunAverage", description: "Leaders in earned run average" },
    { id: "strikeouts", title: "Strikeouts", statGroup: "pitching", type: "strikeouts", description: "Leaders in pitching strikeouts" },
    { id: "rbi", title: "RBI", statGroup: "hitting", type: "rbi", description: "Leaders in runs batted in" },
    { id: "wins", title: "Wins", statGroup: "pitching", type: "wins", description: "Leaders in pitcher wins" }
  ]

  const fetchStats = async () => {
    setLoading(true)
    
    try {
      const fetchedCategories = await Promise.all(
        categories.map(async (category) => {
          const url = `${STATS_API_URL}?leaderCategories=${category.type}&statGroup=${category.statGroup}&limit=10`
          const response = await fetch(url)
          
          if (!response.ok) {
            throw new Error(`Failed to fetch ${category.title} stats`)
          }
          
          const data = await response.json()
          const leaders = data.leagueLeaders[0]?.leaders || []
          
          const players: PlayerStat[] = leaders.map((leader: any) => ({
            id: leader.person.id.toString(),
            rank: leader.rank,
            playerName: leader.person.fullName,
            teamName: leader.team?.name || 'Free Agent',
            value: leader.value
          }))
          
          return {
            id: category.id,
            title: category.title,
            description: category.description,
            players,
            unit: category.id === 'battingAverage' ? '' : 
                  category.id === 'era' ? '' : undefined
          }
        })
      )
      
      setStatCategories(fetchedCategories)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('Could not load player statistics. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (publicKey) {
      fetchStats()
    }
  }, [publicKey])
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }
  
  // Format stat value based on category
  const formatStatValue = (value: number | string, categoryId: string) => {
    if (categoryId === 'battingAverage') {
      return Number(value).toFixed(3).replace(/^0+/, '')
    } else if (categoryId === 'era') {
      return Number(value).toFixed(2)
    } else {
      return value
    }
  }
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!publicKey) {
    return (
      <div className={`${styles.glassCard} p-8 text-center rounded-xl`}>
        <h2 className={`text-xl font-bold mb-4 ${styles.glowText}`}>Connect your wallet to view player statistics</h2>
        <div className="flex justify-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    )
  }

  if (loading && statCategories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  if (error && statCategories.length === 0) {
    return (
      <div className={`${styles.glassCard} p-6 rounded-xl`}>
        <h2 className="text-lg font-semibold text-rose-400 mb-2">Error</h2>
        <p className="text-white/80">{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-black/30 hover:bg-black/40 text-rose-400 rounded-md flex items-center border border-rose-500/30"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    )
  }

  const selectedStats = statCategories.find(category => category.id === selectedCategory) || statCategories[0]

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${styles.glowText}`}>MLB Player Stats</h2>
          <div className="mt-1 flex items-center text-sm text-cyan-400/80">
            <CircleDot className="w-4 h-4 mr-1 text-cyan-400" />
            <span>Last updated: {formatLastUpdated()}</span>
          </div>
        </div>
        <button 
          onClick={fetchStats}
          className="mt-2 sm:mt-0 px-4 py-1.5 bg-black/30 hover:bg-black/40 text-cyan-400 rounded-md flex items-center border border-cyan-500/30 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white'
                  : 'bg-black/30 text-white/70 hover:bg-black/40 hover:text-white border border-white/10'
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Table */}
      <div className={`${styles.glassCard} rounded-xl overflow-hidden ${styles.hoverGlow}`}>
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-500/20 to-purple-500/20">
          <h3 className="font-semibold text-white">{selectedStats?.title} Leaders</h3>
          <p className="text-sm text-white/70">{selectedStats?.description}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-black/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-400/80 uppercase tracking-wider w-16">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-400/80 uppercase tracking-wider">Player</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-400/80 uppercase tracking-wider">Team</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-400/80 uppercase tracking-wider w-24">{selectedStats?.title}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {selectedStats?.players.map((player) => (
                <tr key={player.id} className="hover:bg-black/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{player.rank}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{player.playerName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-white/70">{player.teamName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`text-sm font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent`}>
                      {formatStatValue(player.value, selectedStats.id)}
                    </div>
                  </td>
                </tr>
              ))}
              
              {selectedStats?.players.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-white/60">
                    No player statistics available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 border-t border-white/10 text-center">
          <a 
            href="https://www.mlb.com/stats" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center justify-center transition-colors"
          >
            View All Stats <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </>
  )
} 