'use client'

import { useRouter } from 'next/router'

interface StrikeZoneProps {
   gameId: number;
   homeTeam: string;
   awayTeam: string;
   startTime: string;
}

const getGameStatus = (startTime: string) => {
   const now = new Date();
   const gameTime = new Date(startTime);
   const hoursSinceStart = (now.getTime() - gameTime.getTime()) / (1000 * 60 * 60);

   if (hoursSinceStart >= 4) {
      return 'finished';
   } else if (hoursSinceStart >= 0) {
      return 'live';
   } else {
      return 'not-started';
   }
};

export default function StrikeZone({ gameId, homeTeam, awayTeam, startTime }: StrikeZoneProps) {
   const status = getGameStatus(startTime);

   const statuses= {
      'live': {
         color: 'bg-red-600',
         text: 'Game In Progress'
      },
      'finished': {
         color: 'bg-green-600',
         text: 'Game Finished'
      },
      'not-started': {
         color: 'bg-gray-600',
         text: 'Game Starting Soon'
      }
   };

   return (
      <div className="container mx-auto px-4 py-8">
         <div className={`${statuses[status].color} text-white p-4 mb-6 rounded-lg text-center`}>
            {statuses[status].text}
         </div>
         <div className="mb-8">
            <h1 className="text-2xl text-center font-bold mb-2">{awayTeam} @ {homeTeam}</h1>
         </div>

         {/* Strike Zone Container */}
         <div className="max-w-md mx-auto aspect-[3/4] relative border-4 border-white rounded-lg">
            {/* horizontal lines */}
            <div className="absolute top-1/3 left-0 right-0 h-1 bg-white"></div>
            <div className="absolute top-2/3 left-0 right-0 h-1 bg-white"></div>


            {/* vertical lines */}
            <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-white"></div>
            <div className="absolute top-0 bottom-0 left-2/3 w-1 bg-white"></div>

         </div>
      </div>
   )
} 