'use client'

import { useRouter } from 'next/router'

interface GameBettingProps {
   gameId: number;
   homeTeam: string;
   awayTeam: string;
   startTime: string;
}

export default function GameBetting({ gameId, homeTeam, awayTeam, startTime }: GameBettingProps) {
   return (
      <div className="container mx-auto px-4 py-8">
         <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{awayTeam} @ {homeTeam}</h1>
            <p className="text-gray-600">Game Time: {startTime}</p>
         </div>

         {/* Strike Zone Container */}
         <div className="max-w-md mx-auto aspect-[3/4] relative border-4 border-black rounded-lg">
            {/* Horizontal divider */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-black"></div>

            {/* Vertical divider */}
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-black"></div>

            {/* Quadrant Labels */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 flex items-center justify-center">
               <span className="text-lg font-bold">1</span>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-1/2 flex items-center justify-center">
               <span className="text-lg font-bold">2</span>
            </div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 flex items-center justify-center">
               <span className="text-lg font-bold">3</span>
            </div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 flex items-center justify-center">
               <span className="text-lg font-bold">4</span>
            </div>
         </div>
      </div>
   )
} 