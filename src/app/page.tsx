import GameFeature from '@/components/betting/game-feature'
import { AppHero } from '@/components/ui/ui-layout'

export default function Page() {
  return (
    <div>
      <AppHero title="N3XUS Micro-Betting" subtitle="Live Sports Betting on the Blockchain" />
      <GameFeature />
    </div>
  )
}
