'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { useBasicProgram } from './basic-data-access'
import { BasicCreate, BasicProgram } from './basic-ui'
import { useRouter } from 'next/navigation'

interface Game {
  gameId: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
}

// MLB team logo mapping
const MLB_TEAM_LOGOS: { [key: string]: string } = {
  'Arizona Diamondbacks': 'https://www.mlbstatic.com/team-logos/109.svg',
  'Atlanta Braves': 'https://www.mlbstatic.com/team-logos/144.svg',
  'Baltimore Orioles': 'https://www.mlbstatic.com/team-logos/110.svg',
  'Boston Red Sox': 'https://www.mlbstatic.com/team-logos/111.svg',
  'Chicago Cubs': 'https://www.mlbstatic.com/team-logos/112.svg',
  'Chicago White Sox': 'https://www.mlbstatic.com/team-logos/145.svg',
  'Cincinnati Reds': 'https://www.mlbstatic.com/team-logos/113.svg',
  'Cleveland Guardians': 'https://www.mlbstatic.com/team-logos/114.svg',
  'Colorado Rockies': 'https://www.mlbstatic.com/team-logos/115.svg',
  'Detroit Tigers': 'https://www.mlbstatic.com/team-logos/116.svg',
  'Houston Astros': 'https://www.mlbstatic.com/team-logos/117.svg',
  'Kansas City Royals': 'https://www.mlbstatic.com/team-logos/118.svg',
  'Los Angeles Angels': 'https://www.mlbstatic.com/team-logos/108.svg',
  'Los Angeles Dodgers': 'https://www.mlbstatic.com/team-logos/119.svg',
  'Miami Marlins': 'https://www.mlbstatic.com/team-logos/146.svg',
  'Milwaukee Brewers': 'https://www.mlbstatic.com/team-logos/158.svg',
  'Minnesota Twins': 'https://www.mlbstatic.com/team-logos/142.svg',
  'New York Mets': 'https://www.mlbstatic.com/team-logos/121.svg',
  'New York Yankees': 'https://www.mlbstatic.com/team-logos/147.svg',
  'Athletics': 'https://www.mlbstatic.com/team-logos/133.svg',
  'Philadelphia Phillies': 'https://www.mlbstatic.com/team-logos/143.svg',
  'Pittsburgh Pirates': 'https://www.mlbstatic.com/team-logos/134.svg',
  'San Diego Padres': 'https://www.mlbstatic.com/team-logos/135.svg',
  'San Francisco Giants': 'https://www.mlbstatic.com/team-logos/137.svg',
  'Seattle Mariners': 'https://www.mlbstatic.com/team-logos/136.svg',
  'St. Louis Cardinals': 'https://www.mlbstatic.com/team-logos/138.svg',
  'Tampa Bay Rays': 'https://www.mlbstatic.com/team-logos/139.svg',
  'Texas Rangers': 'https://www.mlbstatic.com/team-logos/140.svg',
  'Toronto Blue Jays': 'https://www.mlbstatic.com/team-logos/141.svg',
  'Washington Nationals': 'https://www.mlbstatic.com/team-logos/120.svg',
};

const CST_TIME = (timeStr: string) => {

  const date = new Date(timeStr)
  console.log(date)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })


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

const GameStatusIndicator = ({ status }: { status: string }) => {
  const statusConfig = {
    'live': {
      dotColor: 'bg-red-500',
      text: 'Live',
      animate: true
    },
    'finished': {
      dotColor: 'bg-green-500',
      text: 'Finished',
      animate: false
    },
    'not-started': {
      dotColor: 'bg-gray-400',
      text: 'Not Started',
      animate: false
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <div className="flex items-center space-x-2">
      <div className={`
        h-2 w-2 rounded-full ${config.dotColor}
        ${config.animate ? 'animate-pulse' : ''}
      `}></div>
      <span className="text-sm">{config.text}</span>
    </div>
  );
};

export default function BasicFeature() {
  const { publicKey } = useWallet()
  const { programId } = useBasicProgram()
  const router = useRouter()

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true)

  const handleGameClick = (gameId: number) => {
    router.push(`/game/${gameId}`)
  }

  // Fetch MLB games from the backend API
  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch('http://127.0.0.1:5000/games')
        if (!response.ok) throw new Error('Failed to fetch MLB games oh no')
        const data: Game[] = await response.json()
        setGames(data)
      } catch (error) {
        console.error('Error fetching MLB games:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  return (
    <div>
      {publicKey ? (
        <>
          {/* <AppHero title="Today's Suite" subtitle={''}> */}
            {/* These contained the solana docs stuff. Uncomment later?  */}
            {/* <p className="mb-6">
              <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
            </p> */}
            {/* <BasicCreate /> */}
          {/* </AppHero> */} 
          {/* /* <BasicProgram /> */}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">MLB Games Today</h2>
              <span className="text-sm text-gray-500">All times in CST</span>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game: Game) => (
                  <div
                    key={game.gameId}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleGameClick(game.gameId)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={MLB_TEAM_LOGOS[game.awayTeam]}
                            alt={`${game.awayTeam} logo`}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://www.mlbstatic.com/team-logos/league-on-dark.svg'
                            }}
                          />
                          <div className="text-lg font-semibold">{game.awayTeam}</div>
                        </div>
                        <GameStatusIndicator status={getGameStatus(game.startTime)} />
                      </div>

                      <div className="flex justify-center items-center my-4">
                        <div className="text-xl font-bold">@</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={MLB_TEAM_LOGOS[game.homeTeam]}
                            alt={`${game.homeTeam} logo`}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://www.mlbstatic.com/team-logos/league-on-dark.svg'
                            }}
                          />
                          <div className="text-lg font-semibold">{game.homeTeam}</div>
                        </div>
                      </div>

                      <div className="mt-4 text-center text-gray-600">
                        <time> {CST_TIME(game.startTime)} </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="hero py-[64px]">
            <div className="hero-content text-center">
              <WalletButton className="btn btn-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
