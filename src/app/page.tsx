'use client'

import { useState, useEffect } from 'react'
import GameFeature from '@/components/betting/game-feature'
import { AppHero } from '@/components/ui/ui-layout'
import LiveGames from '@/components/live/live-games'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function Page() {
  const [mounted, setMounted] = useState(false)

  // Force refresh to ensure aurora background is visible
  useEffect(() => {
    setMounted(true)
    
    // Add class to body to ensure proper background styling
    document.body.classList.add('bg-black');
    
    return () => {
      document.body.classList.remove('bg-black');
    };
  }, [])

  return (
    <AuroraBackground>
      <AppHero title="Welcome to BaseBET!" subtitle="Live Sports Betting on the Blockchain" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <Tabs defaultValue="livegames" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/30 backdrop-blur-xl border border-white/10 p-1">
              <TabsTrigger 
                value="livegames" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
              >
                Live Games
              </TabsTrigger>
              <TabsTrigger 
                value="betting"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
              >
                Betting
              </TabsTrigger>
              <TabsTrigger 
                value="stats"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white"
              >
                Player Stats
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="livegames" className="pt-6">
              <LiveGames />
            </TabsContent>
            
            <TabsContent value="betting" className="pt-6">
              <div className="backdrop-blur-xl bg-black/20 border border-white/10 rounded-xl p-6">
                <GameFeature />
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="pt-6">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-2xl font-bold glow-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent mb-6">
                  MLB Player Statistics
                </h2>
                <p className="text-white/70">Connect your wallet to view player statistics</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuroraBackground>
  )
}
