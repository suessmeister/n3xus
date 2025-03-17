'use client'

import { useState, useEffect } from 'react'
import { mockGameState, type GameState, type Bet } from './game-data'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-hot-toast'
import UserStats from './user-stats'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Trophy, CircleDot, Timer, Sparkles } from 'lucide-react'
import { AuroraBackground } from '../ui/aurora-background'
require('@solana/wallet-adapter-react-ui/styles.css')

// Modern color palette
const colors = {
  primary: 'from-emerald-400 to-cyan-400',
  secondary: 'from-violet-500 to-purple-500',
  accent: 'from-pink-500 to-rose-500',
  muted: 'from-gray-700/90 to-gray-800/90',
  diamond: 'from-green-600 to-green-700',
  base: 'from-amber-700 to-amber-800'
}

const styles = {
  glassCard: 'backdrop-blur-xl bg-black/20 border border-white/10',
  glowText: 'bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent',
  hoverGlow: 'hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300'
}

export default function GameFeature() {
  const [gameState, setGameState] = useState<GameState>(mockGameState)
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [stake, setStake] = useState<number>(1)
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()

  // Update game state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would fetch from your backend
      setGameState(prevState => ({
        ...prevState,
        activeBets: prevState.activeBets.map(bet => ({
          ...bet,
          expiresAt: bet.expiresAt - 1000
        })).filter(bet => bet.expiresAt > Date.now())
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const placeBet = async (bet: Bet, option: string, betAmount: number) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return
    }
    
    try {
      // Here you would call your smart contract
      toast.success('Bet placed successfully!')
      setSelectedBet(null)
      setSelectedOption('')
      setStake(1)
    } catch (error) {
      toast.error('Failed to place bet')
      console.error(error)
    }
  }

  return (
    <AuroraBackground>
      {/* Glassmorphism NavBar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Trophy className="w-7 h-7 text-emerald-400 animate-pulse" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
                  BaseBET
                </h1>
                <p className="text-xs text-emerald-400/80">Web3 Sports Betting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 backdrop-blur-xl">
                  <span className="text-sm text-emerald-400">Live Betting</span>
                </div>
              </div>
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {/* Game Stats Card */}

        <UserStats />

        {/* Game State */}
        <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-6 mb-6 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${colors.primary}`}>
                {gameState.homeTeam} vs {gameState.awayTeam}
              </h2>
              <div className="text-2xl font-semibold mt-1">
                {gameState.homeScore} - {gameState.awayScore}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-medium bg-gradient-to-r bg-clip-text text-transparent ${colors.secondary}`}>
                {gameState.isTopInning ? 'Top' : 'Bottom'} {gameState.inning}
              </div>
              <div className="flex items-center justify-end mt-1 text-gray-400">
                <CircleDot className="w-4 h-4 mr-1" />
                {gameState.outs} out{gameState.outs !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Baseball Diamond */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.base} rounded-full transform rotate-45`}>
              <div className={`absolute inset-4 bg-gradient-to-br ${colors.diamond}`}></div>
            </div>
            {/* Bases */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br ${gameState.bases.second ? colors.accent : colors.muted} rounded-sm transform -rotate-45 transition-colors duration-300`}></div>
            <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-6 h-6 bg-gradient-to-br ${gameState.bases.third ? colors.accent : colors.muted} rounded-sm transform -rotate-45 transition-colors duration-300`}></div>
            <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-6 h-6 bg-gradient-to-br ${gameState.bases.first ? colors.accent : colors.muted} rounded-sm transform -rotate-45 transition-colors duration-300`}></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-sm transform -rotate-45"></div>
          </div>

          {/* Current At Bat */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-lg bg-gradient-to-br ${colors.muted}`}>
              <div className="text-sm text-gray-400">Pitcher</div>
              <div className="text-lg font-medium">{gameState.pitcher}</div>
            </div>
            <div className={`p-4 rounded-lg bg-gradient-to-br ${colors.muted}`}>
              <div className="text-sm text-gray-400">Batter</div>
              <div className="text-lg font-medium">{gameState.batter}</div>
            </div>
          </div>

          {/* Count */}
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Balls</div>
              <div className="flex space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < gameState.balls ? 'bg-emerald-500' : 'bg-gray-600'} transition-colors duration-300`}></div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Strikes</div>
              <div className="flex space-x-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < gameState.strikes ? 'bg-rose-500' : 'bg-gray-600'} transition-colors duration-300`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Active Bets */}
      <div className="grid gap-4 lg:grid-cols-3">
        {gameState.activeBets.map((bet) => (
          <div
            key={bet.id}
            className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-6 group hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
            onClick={() => setSelectedBet(bet)}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${colors.secondary}`}>
                {bet.type}
              </h3>
              <div className={`flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${colors.muted} text-sm`}>
                <Timer className="w-4 h-4 mr-1" />
                {Math.max(0, Math.floor((bet.expiresAt - Date.now()) / 1000))}s
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {bet.options.map((option, index) => (
                <div 
                  key={option} 
                  className={`p-3 rounded-lg bg-gradient-to-br ${colors.muted} group-hover:from-gray-700 group-hover:to-gray-600 transition-all duration-300`}
                >
                  <div className="font-medium">{option}</div>
                  <div className={`text-sm bg-gradient-to-r bg-clip-text text-transparent ${colors.primary}`}>x{bet.odds[index]}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bet Placement Modal */}
      {selectedBet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-6 max-w-md w-full hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
            <h3 className={`text-2xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent ${colors.primary}`}>{selectedBet.type}</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {selectedBet.options.map((option) => (
                  <button
                    key={option}
                    className={`group relative overflow-hidden rounded-lg p-4 transition-all duration-300 ${selectedOption === option
                      ? 'bg-gradient-to-r ' + colors.primary
                      : 'bg-gradient-to-br ' + colors.muted + ' hover:from-gray-600 hover:to-gray-500'
                    }`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <div className="relative z-10">
                      <div className="font-medium">{option}</div>
                      <div className="text-sm text-gray-300 group-hover:text-white">
                        x{selectedBet.odds[selectedBet.options.indexOf(option)]}
                      </div>
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Stake Amount (SOL)</label>
                <input
                  type="number"
                  min={selectedBet.minStake}
                  max={selectedBet.maxStake}
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className={`w-full bg-gradient-to-br ${colors.muted} rounded-lg p-3 border border-gray-600 focus:outline-none focus:border-gray-500`}
                />
              </div>

              {selectedOption && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colors.muted}`}>
                      <div className="text-sm text-gray-400">Your Selection</div>
                      <div className="font-medium">{selectedOption}</div>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colors.muted}`}>
                      <div className="text-sm text-gray-400">Odds</div>
                      <div className={`font-medium bg-gradient-to-r bg-clip-text text-transparent ${colors.primary}`}>
                        x{selectedBet.odds[selectedBet.options.indexOf(selectedOption)]}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg bg-gradient-to-br ${colors.muted}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Potential Payout</div>
                        <div className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${colors.accent}`}>
                          {(stake * selectedBet.odds[selectedBet.options.indexOf(selectedOption)]).toFixed(2)} SOL
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Stake</div>
                        <div className="font-medium">{stake} SOL</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-2">
                <button
                  className={`px-6 py-3 rounded-lg bg-gradient-to-br ${colors.muted} hover:from-gray-600 hover:to-gray-500 transition-all duration-300`}
                  onClick={() => {
                    setSelectedBet(null)
                    setSelectedOption('')
                    setStake(1)
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-3 rounded-lg bg-gradient-to-r ${colors.primary} hover:opacity-90 transition-all duration-300 disabled:opacity-50`}
                  disabled={!selectedOption || stake < selectedBet.minStake || stake > selectedBet.maxStake}
                  onClick={() => placeBet(selectedBet, selectedOption, stake)}
                >
                  Place Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </AuroraBackground>
  )
}
