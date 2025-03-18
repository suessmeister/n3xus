'use client'

import { useParams, useRouter } from 'next/navigation'
import StrikeZone from '../../../components/basic/strike_zone'
import { useEffect, useState } from 'react'

interface Game {
   gameId: number;
   homeTeam: string;
   awayTeam: string;
   startTime: string;
}

export default function GamePage() {
   const params = useParams()
   const router = useRouter()
   const [game, setGame] = useState<Game | null>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(false)

   useEffect(() => {
      async function fetchGame() {
         try {
            const response = await fetch(`http://127.0.0.1:5000/games/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch game details')
            const text = await response.json()
            if (text['error'] === 'Game not found') { //from the backend API 
               setError(true)
               return
            }
            setGame(text)
         } catch (error) {
            console.error('Error fetching game:', error)
            setError(true)
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

   if (error || !game) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
               <div className="flex">
                  <div className="flex-shrink-0">
                     <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <div className="ml-3">
                     <p className="text-red-700">Game not found</p>
                  </div>
               </div>
            </div>
            <button
               onClick={() => router.push('/lineup')}
               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
               Return to Games
            </button>
         </div>
      )
   }

   return <StrikeZone{...game} />
} 