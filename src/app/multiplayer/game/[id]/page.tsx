'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../../../../components/solana/solana-provider'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface MultiplayerGame {
  id: string
  hostId: string
  hostName: string
  gameType: string
  status: string
  guestId: string | null
  guestName: string | null
  currentTurn: string
  created: string
  lastUpdated: string
  gameState: {
    points: {
      host: number
      guest: number
    }
    currentPitch: {
      playerId: string
      coordinates: [number, number]
      result: string
      points: number
    } | null
  }
  winnerId?: string
}

interface PitchResult {
  coordinates: [number, number]
  result: string
  points: number
}

export default function MultiplayerGamePage() {
  const { publicKey } = useWallet()
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string
  
  const [game, setGame] = useState<MultiplayerGame | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isThrowingPitch, setIsThrowingPitch] = useState(false)
  const [lastResult, setLastResult] = useState<PitchResult | null>(null)
  const [gameCompleted, setGameCompleted] = useState(false)
  
  const strikeZoneRef = useRef<HTMLDivElement>(null)
  
  // Fetch game data on initial load and set up polling
  useEffect(() => {
    async function fetchGameData() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/multiplayer/game/${gameId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Game not found')
            return
          }
          throw new Error('Failed to fetch game data')
        }
        
        const data = await response.json()
        setGame(data)
        
        // Check if it's the current player's turn
        if (publicKey && data.currentTurn === publicKey.toString()) {
          setIsMyTurn(true)
        } else {
          setIsMyTurn(false)
        }
        
        // Check if game is completed
        if (data.status === 'completed') {
          setGameCompleted(true)
          
          // Record game results to leaderboard if it just completed
          const isPlayerInGame = publicKey && (data.hostId === publicKey.toString() || data.guestId === publicKey.toString())
          
          if (isPlayerInGame && !gameCompleted && data.status === 'completed') {
            recordGameResult(data)
          }
        }
        
      } catch (error) {
        console.error('Error fetching game data:', error)
        setError('Failed to load game data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    if (publicKey) {
      fetchGameData()
      // Refresh game data every 2 seconds
      const interval = setInterval(fetchGameData, 2000)
      return () => clearInterval(interval)
    }
  }, [publicKey, gameId, gameCompleted])
  
  // Record game result to leaderboard when game completes
  const recordGameResult = async (gameData: MultiplayerGame) => {
    if (!gameData.winnerId || !gameData.hostId || !gameData.guestId) return
    
    try {
      await fetch('http://127.0.0.1:5000/games/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player1Id: gameData.hostId,
          player1Name: gameData.hostName,
          player2Id: gameData.guestId,
          player2Name: gameData.guestName,
          winnerId: gameData.winnerId
        })
      })
    } catch (error) {
      console.error('Error recording game result:', error)
    }
  }
  
  // Handle click on strike zone to select pitch location
  const handleStrikeZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMyTurn || !strikeZoneRef.current || isThrowingPitch) return
    
    const rect = strikeZoneRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    // Clamp values between 0 and 1
    const coordinates: [number, number] = [
      Math.max(0, Math.min(1, x)),
      Math.max(0, Math.min(1, y))
    ]
    
    throwPitch(coordinates)
  }
  
  // Send pitch to the server
  const throwPitch = async (coordinates: [number, number]) => {
    if (!publicKey || !game) return
    
    setIsThrowingPitch(true)
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/multiplayer/game/${gameId}/throw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId: publicKey.toString(),
          pitchCoordinates: coordinates
        })
      })
      
      if (!response.ok) throw new Error('Failed to throw pitch')
      
      const data = await response.json()
      setGame(data)
      
      // Update last result
      if (data.gameState.currentPitch) {
        const result = {
          coordinates: data.gameState.currentPitch.coordinates,
          result: data.gameState.currentPitch.result,
          points: data.gameState.currentPitch.points
        }
        setLastResult(result)
        
        // Show toast notification with result
        toast.success(`${result.result}: +${result.points} points`)
      }
      
      setIsMyTurn(false)
    } catch (error) {
      console.error('Error throwing pitch:', error)
      toast.error('Failed to throw pitch. Please try again.')
    } finally {
      setIsThrowingPitch(false)
      setIsSelecting(false)
    }
  }
  
  // Calculate player role and score
  const getPlayerInfo = () => {
    if (!game || !publicKey) return { isHost: false, myScore: 0, opponentScore: 0, myName: '', opponentName: '' }
    
    const isHost = game.hostId === publicKey.toString()
    let myScore = 0
    let opponentScore = 0
    let myName = ''
    let opponentName = ''
    
    if (isHost) {
      myScore = game.gameState.points.host
      opponentScore = game.gameState.points.guest
      myName = game.hostName
      opponentName = game.guestName || 'Waiting for opponent...'
    } else {
      myScore = game.gameState.points.guest
      opponentScore = game.gameState.points.host
      myName = game.guestName || ''
      opponentName = game.hostName
    }
    
    return { isHost, myScore, opponentScore, myName, opponentName }
  }
  
  // Get status message
  const getStatusMessage = () => {
    if (!game) return ''
    
    if (game.status === 'waiting') {
      return 'Waiting for opponent to join...'
    } else if (game.status === 'completed') {
      const { isHost } = getPlayerInfo()
      const isWinner = (isHost && game.winnerId === game.hostId) || (!isHost && game.winnerId === game.guestId)
      return isWinner ? 'You won!' : 'You lost!'
    } else {
      return isMyTurn ? 'Your turn' : "Opponent's turn"
    }
  }
  
  // Get coordinate display
  const formatCoordinates = (coords: [number, number]) => {
    return `(${(coords[0] * 100).toFixed(1)}%, ${(coords[1] * 100).toFixed(1)}%)`
  }
  
  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <div>
              <h1 className="text-3xl font-bold mb-6">Connect your wallet to play</h1>
              <WalletButton className="btn btn-primary" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
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
              <p className="text-red-700">{error || 'Game not found'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Link href="/multiplayer" className="btn btn-primary">
            Back to Multiplayer Games
          </Link>
        </div>
      </div>
    )
  }
  
  const { isHost, myScore, opponentScore, myName, opponentName } = getPlayerInfo()
  const statusMessage = getStatusMessage()
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Game header */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)} Game</h1>
          <div className="flex gap-4">
            <Link href="/multiplayer" className="btn btn-outline">
              Back to Games
            </Link>
            <Link href="/leaderboard" className="btn btn-outline">
              Leaderboard
            </Link>
          </div>
        </div>
        
        {/* Game status */}
        <div className={`
          p-3 rounded-lg text-center text-white font-semibold mb-6
          ${game.status === 'waiting' ? 'bg-blue-500' : 
            game.status === 'completed' ? 'bg-green-600' : 
            isMyTurn ? 'bg-purple-600' : 'bg-orange-500'}
        `}>
          {statusMessage}
        </div>
      </div>
      
      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <div className="font-bold text-xl mb-1">You</div>
          <div className="text-gray-700">{myName}</div>
          <div className="text-3xl font-bold mt-2">{myScore}</div>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-3xl font-bold">vs</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-xl mb-1">Opponent</div>
          <div className="text-gray-700">{opponentName}</div>
          <div className="text-3xl font-bold mt-2">{opponentScore}</div>
        </div>
      </div>
      
      {/* Last pitch result */}
      {game.gameState.currentPitch && (
        <div className={`
          p-4 rounded-lg mb-6 text-center 
          ${game.gameState.currentPitch.result.includes('Strike') ? 
            (game.gameState.currentPitch.result.includes('Corner') ? 'bg-green-100 border border-green-500' : 
             game.gameState.currentPitch.result.includes('Edge') ? 'bg-blue-100 border border-blue-500' : 
             'bg-yellow-100 border border-yellow-500') : 
            'bg-red-100 border border-red-500'}
        `}>
          <div className="font-semibold mb-1">
            {game.gameState.currentPitch.playerId === publicKey.toString() ? 'Your' : 'Opponent\'s'} last pitch
          </div>
          <div className="text-xl font-bold">
            {game.gameState.currentPitch.result}
          </div>
          <div className="mt-1">
            Position: {formatCoordinates(game.gameState.currentPitch.coordinates)}
          </div>
          <div className="mt-1 font-semibold">
            +{game.gameState.currentPitch.points} points
          </div>
        </div>
      )}
      
      {/* Strike Zone */}
      <div className="max-w-md mx-auto mb-8">
        <div className="mb-4 text-center text-lg font-semibold">
          {isMyTurn && game.status === 'active' ? 'Click on the strike zone to throw a pitch' : 'Strike Zone'}
        </div>
        
        <div 
          ref={strikeZoneRef}
          className={`
            aspect-[3/4] relative border-4 border-gray-700 rounded-lg overflow-hidden cursor-crosshair
            ${isMyTurn && game.status === 'active' ? 'hover:bg-gray-50' : ''}
          `}
          onClick={handleStrikeZoneClick}
        >
          {/* Horizontal lines */}
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gray-700"></div>
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-gray-700"></div>
          
          {/* Vertical lines */}
          <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gray-700"></div>
          <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-gray-700"></div>
          
          {/* Points labels */}
          <div className="absolute top-[5px] left-[5px] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">3</div>
          <div className="absolute top-[5px] left-[calc(50%-8px)] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">2</div>
          <div className="absolute top-[5px] right-[5px] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">3</div>
          
          <div className="absolute top-[calc(50%-8px)] left-[5px] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">2</div>
          <div className="absolute top-[calc(50%-8px)] left-[calc(50%-8px)] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">1</div>
          <div className="absolute top-[calc(50%-8px)] right-[5px] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">2</div>
          
          <div className="absolute bottom-[5px] left-[5px] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">3</div>
          <div className="absolute bottom-[5px] left-[calc(50%-8px)] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">2</div>
          <div className="absolute bottom-[5px] right-[5px] text-xs font-semibold bg-white bg-opacity-70 px-1 rounded">3</div>
          
          {/* Last pitch marker */}
          {game.gameState.currentPitch && (
            <div 
              className={`
                absolute h-3 w-3 rounded-full transform -translate-x-1/2 -translate-y-1/2
                ${game.gameState.currentPitch.result.includes('Strike') ? 
                  (game.gameState.currentPitch.result.includes('Corner') ? 'bg-green-500' : 
                  game.gameState.currentPitch.result.includes('Edge') ? 'bg-blue-500' : 
                  'bg-yellow-500') : 
                  'bg-red-500'}
              `}
              style={{
                left: `${game.gameState.currentPitch.coordinates[0] * 100}%`,
                top: `${game.gameState.currentPitch.coordinates[1] * 100}%`
              }}
            ></div>
          )}
        </div>
      </div>
      
      {/* Game explanation */}
      <div className="max-w-lg mx-auto p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">Game Rules:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Players take turns throwing pitches in the strike zone</li>
          <li>Points are awarded based on where your pitch lands:</li>
          <ul className="list-disc pl-5 mt-1">
            <li><strong>Corner Strike (3 pts):</strong> Most difficult placement</li>
            <li><strong>Edge Strike (2 pts):</strong> Medium difficulty placement</li>
            <li><strong>Center Strike (1 pt):</strong> Easiest placement</li>
            <li><strong>Ball (0 pts):</strong> Miss the strike zone</li>
          </ul>
          <li>First player to reach 10 points wins the game</li>
        </ul>
      </div>
    </div>
  )
} 