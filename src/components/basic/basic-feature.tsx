'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { useBasicProgram } from './basic-data-access'
import { BasicCreate, BasicProgram } from './basic-ui'

interface Game {
  gameId: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
}

export default function BasicFeature() {
  const { publicKey } = useWallet()
  const { programId } = useBasicProgram()

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true)

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
          <AppHero title="Today's Suite" subtitle={'more buttons to come soon!'}>
            <p className="mb-6">
              <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
            </p>
            <BasicCreate />
          </AppHero>
          <BasicProgram />

          <h2 className="text-xl font-bold mt-6">MLB Games Today</h2>
          {loading ? (
            <p>Loading games...</p>
          ) : (
            <ul>
              {games.map((game: Game) => (
                <li key={game.gameId} className="border p-2 my-2">
                  {game.awayTeam} @ {game.homeTeam} - {game.startTime}
                </li>
              ))}
            </ul>
          )}
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
