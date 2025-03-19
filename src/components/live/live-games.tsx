'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { RefreshCw, Clock, CircleDot, ExternalLink } from 'lucide-react'
import { AuroraBackground } from '../ui/aurora-background'

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

// MLB API URL for live game data
const SCHEDULE_API_URL = "https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=2023-09-14&hydrate=team,linescore,game(content(summary,editorial,media(epg)),tickets)&useLatestGames=true&language=en"

interface LiveGame {
  id: string
  gameId: string
  homeTeam: {
    name: string
    logo: string
  }
  awayTeam: {
    name: string
    logo: string
  }
  homeScore: number
  awayScore: number
  inning: number
  isTopInning: boolean
  outs: number
  status: 'live' | 'preview' | 'final'
  lastUpdate: string
  bases: {
    first: boolean
    second: boolean
    third: boolean
  }
  balls: number
  strikes: number
  pitcher: string
  batter: string
}

export default function LiveGames() {
  const { publicKey } = useWallet()
  const [liveGames, setLiveGames] = useState<LiveGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLiveGames = async () => {
    try {
      // In a real application, we would use the current date
      const response = await fetch(SCHEDULE_API_URL)
      
      if (!response.ok) {
        throw new Error('Failed to fetch live game data')
      }
      
      const data = await response.json()
      
      // Process API response into LiveGame format
      const games: LiveGame[] = data.dates[0]?.games.map((game: any) => {
        // Determine game status
        let status: 'live' | 'preview' | 'final' = 'preview'
        if (game.status.abstractGameState === 'Final') {
          status = 'final'
        } else if (game.status.abstractGameState === 'Live') {
          status = 'live'
        }
        
        // Get inning info if available
        const linescore = game.linescore || {}
        const currentInning = linescore.currentInning || 0
        const isTopInning = linescore.isTopInning || false
        const outs = linescore.outs || 0
        
        // Get base runners
        const bases = {
          first: linescore.offense?.first?.id !== undefined,
          second: linescore.offense?.second?.id !== undefined,
          third: linescore.offense?.third?.id !== undefined
        }
        
        // Get count
        const balls = linescore.balls || 0
        const strikes = linescore.strikes || 0
        
        // Get current pitcher and batter
        const pitcher = linescore.defense?.pitcher?.fullName || ''
        const batter = linescore.offense?.batter?.fullName || ''
        
        return {
          id: game.gamePk.toString(),
          gameId: game.gamePk.toString(),
          homeTeam: {
            name: game.teams.home.team.name,
            logo: `https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`
          },
          awayTeam: {
            name: game.teams.away.team.name,
            logo: `https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`
          },
          homeScore: game.teams.home.score || 0,
          awayScore: game.teams.away.score || 0,
          inning: currentInning,
          isTopInning,
          outs,
          status,
          lastUpdate: new Date().toISOString(),
          bases,
          balls,
          strikes,
          pitcher,
          batter
        }
      }) || []
      
      setLiveGames(games)
      setError(null)
    } catch (error) {
      console.error('Error fetching live games:', error)
      setError('Could not load live game data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (publicKey) {
      fetchLiveGames()
      
      // Refresh data every 15 seconds
      const intervalId = setInterval(fetchLiveGames, 15000)
      
      return () => clearInterval(intervalId)
    }
  }, [publicKey])

  // Format time elapsed since last update
  const getTimeElapsed = (lastUpdate: string) => {
    const lastUpdatedDate = new Date(lastUpdate)
    const now = new Date()
    
    const diffSeconds = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / 1000)
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`
    } else {
      const minutes = Math.floor(diffSeconds / 60)
      return `${minutes}m ago`
    }
  }

  // Handle image error (fallback for team logos)
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://www.mlbstatic.com/team-logos/league-on-dark.svg'
  }

  // Class names based on game status
  const getGameStatusClasses = (status: 'live' | 'preview' | 'final') => {
    switch (status) {
      case 'live':
        return {
          border: 'bg-gradient-to-r from-rose-500 to-pink-600',
          text: 'text-rose-400'
        }
      case 'final':
        return {
          border: 'bg-gradient-to-r from-gray-600 to-gray-700',
          text: 'text-gray-300'
        }
      default:
        return {
          border: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          text: 'text-blue-400'
        }
    }
  }

  if (!publicKey) {
    return (
      <div className={`${styles.glassCard} p-8 text-center rounded-xl`}>
        <h2 className={`text-xl font-bold mb-4 ${styles.glowText}`}>Connect your wallet to view live games</h2>
        <div className="flex justify-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    )
  }

  if (loading && liveGames.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  if (error && liveGames.length === 0) {
    return (
      <div className={`${styles.glassCard} p-6 rounded-xl`}>
        <h2 className="text-lg font-semibold text-rose-400 mb-2">Error</h2>
        <p className="text-white/80">{error}</p>
        <button 
          onClick={fetchLiveGames}
          className="mt-4 px-4 py-2 bg-black/30 hover:bg-black/40 text-rose-400 rounded-md flex items-center border border-rose-500/30"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    )
  }

  if (liveGames.length === 0) {
    return (
      <div className={`${styles.glassCard} p-8 text-center rounded-xl`}>
        <h2 className={`text-xl font-bold mb-2 ${styles.glowText}`}>No Live Games</h2>
        <p className="text-white/80 mb-4">There are no MLB games currently in progress.</p>
        <button 
          onClick={fetchLiveGames}
          className="px-4 py-2 bg-black/30 hover:bg-black/40 text-cyan-400 rounded-md flex items-center mx-auto border border-cyan-500/30"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${styles.glowText}`}>MLB Live Games</h2>
          <div className="mt-1 flex items-center text-sm text-cyan-400/80">
            <CircleDot className="w-4 h-4 mr-1 text-cyan-400" />
            <span>Live updates every 15 seconds</span>
          </div>
        </div>
        <button 
          onClick={fetchLiveGames}
          className="mt-2 sm:mt-0 px-4 py-1.5 bg-black/30 hover:bg-black/40 text-cyan-400 rounded-md flex items-center border border-cyan-500/30 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveGames.map((game) => (
          <LiveGameCard key={game.id} game={game} getTimeElapsed={getTimeElapsed} handleImageError={handleImageError} getGameStatusClasses={getGameStatusClasses} />
        ))}
      </div>
    </>
  )
}

function LiveGameCard({ 
  game, 
  getTimeElapsed, 
  handleImageError, 
  getGameStatusClasses 
}: { 
  game: LiveGame, 
  getTimeElapsed: (lastUpdate: string) => string,
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void,
  getGameStatusClasses: (status: 'live' | 'preview' | 'final') => { border: string, text: string }
}) {
  const statusClasses = getGameStatusClasses(game.status)
  
  return (
    <div className={`${styles.glassCard} rounded-xl overflow-hidden ${styles.hoverGlow} relative`}>
      {/* Game status indicator (live, preview, final) */}
      <div className={`absolute top-3 right-3 py-1 px-3 rounded-full ${statusClasses.text} border border-white/10 backdrop-blur-sm bg-black/40 text-xs font-medium`}>
        {game.status === 'live' ? 'LIVE' : game.status === 'final' ? 'FINAL' : 'PREVIEW'}
      </div>
      
      {/* Teams and scores */}
      <div className="pt-6 px-4 pb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <img 
              src={game.awayTeam.logo} 
              alt={game.awayTeam.name}
              className="w-8 h-8 mr-2" 
              onError={handleImageError}
            />
            <span className="font-semibold text-white">{game.awayTeam.name}</span>
          </div>
          <span className={`text-xl font-bold ${game.awayScore > game.homeScore ? styles.glowText : 'text-white'}`}>
            {game.awayScore}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={game.homeTeam.logo} 
              alt={game.homeTeam.name}
              className="w-8 h-8 mr-2" 
              onError={handleImageError}
            />
            <span className="font-semibold text-white">{game.homeTeam.name}</span>
          </div>
          <span className={`text-xl font-bold ${game.homeScore > game.awayScore ? styles.glowText : 'text-white'}`}>
            {game.homeScore}
          </span>
        </div>
      </div>
      
      {/* Game details for live games */}
      {game.status === 'live' && (
        <div className="bg-gradient-to-r from-gray-900/70 to-black/70 p-4 border-t border-white/10">
          {/* Inning, Outs, Bases */}
          <div className="flex justify-between mb-3">
            <div>
              <span className="text-cyan-400 text-xs font-medium">INNING</span>
              <div className="text-white text-sm font-semibold">
                {game.isTopInning ? 'Top' : 'Bottom'} {game.inning}
              </div>
            </div>
            
            <div>
              <span className="text-cyan-400 text-xs font-medium">OUTS</span>
              <div className="text-white text-sm font-semibold">
                {game.outs}
              </div>
            </div>
            
            <div>
              <span className="text-cyan-400 text-xs font-medium">COUNT</span>
              <div className="text-white text-sm font-semibold">
                {game.balls}-{game.strikes}
              </div>
            </div>
          </div>
          
          {/* Base runners visualization */}
          <div className="mb-3 flex justify-center">
            <div className="relative w-16 h-16">
              {/* Home plate */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/40"></div>
              
              {/* First base */}
              <div className={`absolute top-1/2 right-0 transform translate-y-0 w-3 h-3 ${game.bases.first ? 'bg-emerald-400' : 'bg-white/40'}`}></div>
              
              {/* Second base */}
              <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 ${game.bases.second ? 'bg-emerald-400' : 'bg-white/40'}`}></div>
              
              {/* Third base */}
              <div className={`absolute top-1/2 left-0 transform translate-y-0 w-3 h-3 ${game.bases.third ? 'bg-emerald-400' : 'bg-white/40'}`}></div>
              
              {/* Base paths */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute w-px h-1/2 bg-white/20 left-1/2 top-1/2"></div>
                <div className="absolute w-px h-1/2 bg-white/20 left-1/2 bottom-0 rotate-45 origin-top"></div>
                <div className="absolute w-px h-1/2 bg-white/20 left-1/2 bottom-0 -rotate-45 origin-top"></div>
              </div>
            </div>
          </div>
          
          {/* Pitcher and Batter */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-emerald-400 text-xs font-medium">PITCHER</div>
              <div className="text-white text-sm truncate">{game.pitcher || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-rose-400 text-xs font-medium">BATTER</div>
              <div className="text-white text-sm truncate">{game.batter || 'Unknown'}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer with time and link to full game */}
      <div className="bg-black/40 p-3 border-t border-white/10 flex justify-between items-center">
        <div className="flex items-center text-xs text-white/60">
          <Clock className="w-3 h-3 mr-1" />
          <span>{getTimeElapsed(game.lastUpdate)}</span>
        </div>
        
        <a 
          href={`https://www.mlb.com/gameday/${game.gameId}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center transition-colors"
        >
          Full Game <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  )
} 