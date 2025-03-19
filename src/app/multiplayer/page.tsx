'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../../components/solana/solana-provider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MultiplayerGame {
  id: string
  hostId: string
  hostName: string
  gameType: string
  status: string
  created: string
  guestId: string | null
  guestName: string | null
}

export default function MultiplayerPage() {
  const { publicKey } = useWallet()
  const router = useRouter()
  
  const [availableGames, setAvailableGames] = useState<Record<string, MultiplayerGame>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [gameType, setGameType] = useState('standard')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (publicKey) {
      const storedName = localStorage.getItem('playerName')
      if (storedName) {
        setPlayerName(storedName)
      }
    }
  }, [publicKey])

  useEffect(() => {
    async function fetchAvailableGames() {
      try {
        const response = await fetch('http://127.0.0.1:5000/multiplayer/games')
        if (!response.ok) throw new Error('Failed to fetch available games')
        const data = await response.json()
        setAvailableGames(data)
      } catch (error) {
        console.error('Error fetching available games:', error)
        setError('Could not load available games. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (publicKey) {
      fetchAvailableGames()
      // Refresh games list every 5 seconds
      const interval = setInterval(fetchAvailableGames, 5000)
      return () => clearInterval(interval)
    }
  }, [publicKey])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleCreateGame = async () => {
    if (!publicKey || !playerName.trim()) return
    
    setIsCreating(true)
    
    try {
      localStorage.setItem('playerName', playerName)
      
      const response = await fetch('http://127.0.0.1:5000/multiplayer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostId: publicKey.toString(),
          hostName: playerName,
          gameType
        })
      })
      
      if (!response.ok) throw new Error('Failed to create game')
      
      const data = await response.json()
      router.push(`/multiplayer/game/${data.gameId}`)
    } catch (error) {
      console.error('Error creating game:', error)
      setError('Failed to create game. Please try again.')
    } finally {
      setIsCreating(false)
      setShowCreateModal(false)
    }
  }

  const handleJoinGame = async (gameId: string) => {
    if (!publicKey || !playerName.trim()) {
      setShowCreateModal(true)
      return
    }
    
    try {
      localStorage.setItem('playerName', playerName)
      
      const response = await fetch(`http://127.0.0.1:5000/multiplayer/join/${gameId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guestId: publicKey.toString(),
          guestName: playerName
        })
      })
      
      if (!response.ok) throw new Error('Failed to join game')
      
      router.push(`/multiplayer/game/${gameId}`)
    } catch (error) {
      console.error('Error joining game:', error)
      setError('Failed to join game. Please try again.')
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <div>
              <h1 className="text-3xl font-bold mb-6">Connect your wallet to play multiplayer</h1>
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
        <h1 className="text-3xl font-bold">Multiplayer Games</h1>
        <div className="flex gap-4 mt-4 md:mt-0">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Game
          </button>
          <Link 
            href="/leaderboard"
            className="btn btn-outline"
          >
            View Leaderboard
          </Link>
          <Link 
            href="/"
            className="btn btn-outline"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
      )}

      {/* Player info form if no name set */}
      {!playerName && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-blue-700 mb-2">Please enter your name to join or create games.</p>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  className="input input-bordered w-full max-w-xs"
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => localStorage.setItem('playerName', playerName)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : Object.keys(availableGames).length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No games available</h2>
          <p className="text-gray-600 mb-6">Create a new game and invite a friend to play!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(availableGames).map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)} Game</h3>
                  <span className="text-sm text-gray-500">{formatDate(game.created)}</span>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700">
                    <span className="font-medium">Host:</span> {game.hostName}
                  </p>
                </div>
                
                <button
                  onClick={() => handleJoinGame(game.id)}
                  className="w-full btn btn-primary"
                  disabled={game.hostId === publicKey.toString()}
                >
                  {game.hostId === publicKey.toString() ? 'Your Game' : 'Join Game'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Game Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create a New Game</h2>
            
            {!playerName.trim() && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="input input-bordered w-full"
                />
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Game Type
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
                <option value="timed">Timed</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGame}
                className="btn btn-primary"
                disabled={isCreating || !playerName.trim()}
              >
                {isCreating ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Creating...
                  </>
                ) : (
                  'Create Game'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 