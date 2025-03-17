'use client'

import { useParams } from 'next/navigation'
import GameBetting from '../../../components/basic/GameBetting'
import { useEffect, useState } from 'react'

interface Game {
   gameId: number;
   homeTeam: string;
   awayTeam: string;
   startTime: string;
}

export default function GamePage() {
   const params = useParams()
   const [game, setGame] = useState<Game | null>(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      async function fetchGame() {
         try {
            const response = await fetch(`http://127.0.0.1:5000/games/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch game details')
            const data = await response.json()
            setGame(data)
         } catch (error) {
            console.error('Error fetching game:', error)
         } finally {
            setLoading(false)
         }
      }

      fetchGame()
   }, [params.id])

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
         </div>
      )
   }

   if (!game) {
      return <div>Game not found</div>
   }

   return <GameBetting {...game} />
} 