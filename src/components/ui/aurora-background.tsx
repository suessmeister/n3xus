'use client'

import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode
  showRadialGradient?: boolean
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div className="min-h-screen w-full bg-black">
      <div
        className={cn(
          'relative min-h-screen w-full bg-transparent',
          className
        )}
        {...props}
      >
        <div className="fixed inset-0 overflow-hidden">
          <div
            className={cn(
              `absolute inset-0 w-full h-full
              [--aurora:repeating-linear-gradient(100deg,var(--emerald-500)_10%,var(--cyan-400)_15%,var(--blue-500)_20%,var(--violet-500)_25%,var(--emerald-400)_30%)]
              [background-image:var(--aurora)]
              [background-size:300%_300%]
              [background-position:50%_50%]
              after:absolute after:inset-0 after:bg-black/40
              after:backdrop-blur-3xl
              animate-aurora`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_5%,transparent_70%)]`
            )}
          />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
