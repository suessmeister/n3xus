'use client'

import React, { useEffect } from 'react'

interface EnhancedAuroraProps {
  children: React.ReactNode
}

export const EnhancedAurora = ({ children }: EnhancedAuroraProps) => {
  // Force a re-render on component mount to ensure styles are applied
  useEffect(() => {
    // Add class to document element
    document.documentElement.classList.add('has-aurora');
    
    return () => {
      document.documentElement.classList.remove('has-aurora');
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* SVG filter for better glow effects */}
      <svg className="fixed top-0 left-0 w-0 h-0">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Primary large aurora from top */}
      <div 
        className="fixed -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-70 -z-10" 
        style={{ 
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.5) 0%, rgba(6, 182, 212, 0.3) 25%, rgba(5, 150, 105, 0.2) 50%, transparent 70%)',
          transform: 'rotate(-10deg)',
          filter: 'blur(60px)',
          animation: 'aurora-pulse 8s ease-in-out infinite alternate'
        }} 
      />

      {/* Secondary aurora from right */}
      <div 
        className="fixed -top-1/4 -right-1/4 w-[100%] h-[150%] opacity-60 -z-10" 
        style={{ 
          background: 'radial-gradient(circle at 100% 30%, rgba(16, 185, 129, 0.6) 0%, rgba(6, 182, 212, 0.3) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'aurora-pulse 12s ease-in-out infinite alternate-reverse' 
        }} 
      />

      {/* Horizontal wave aurora */}
      <div 
        className="fixed top-[30%] -left-1/2 w-[200%] h-[40%] opacity-60 -z-10" 
        style={{ 
          background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.4) 20%, rgba(6, 182, 212, 0.5) 40%, rgba(236, 72, 153, 0.4) 60%, transparent 80%)',
          filter: 'blur(60px)',
          animation: 'aurora-wave 20s linear infinite'
        }} 
      />

      {/* Moving aurora from bottom */}
      <div 
        className="fixed -bottom-1/2 -left-1/4 w-[150%] h-[100%] opacity-80 -z-10" 
        style={{ 
          background: 'radial-gradient(ellipse at 50% 100%, rgba(16, 185, 129, 0.5) 0%, rgba(6, 182, 212, 0.3) 30%, rgba(139, 92, 246, 0.2) 60%, transparent 80%)',
          filter: 'blur(70px)',
          animation: 'aurora-pulse-reverse 15s ease-in-out infinite alternate'
        }} 
      />

      {/* Animated star-like particles */}
      <div className="fixed inset-0 -z-10">
        {Array.from({ length: 100 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${3 + Math.random() * 7}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-0 min-h-screen">
        {children}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes aurora-pulse {
          0% { opacity: 0.5; transform: scale(1) rotate(-10deg); }
          100% { opacity: 0.7; transform: scale(1.05) rotate(-10deg); }
        }
        
        @keyframes aurora-pulse-reverse {
          0% { opacity: 0.5; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes aurora-wave {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(10%); }
        }
        
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.8); filter: blur(0px); }
          50% { opacity: 0.9; transform: scale(1.3); filter: blur(1px); }
          100% { opacity: 0.3; transform: scale(0.8); filter: blur(0px); }
        }
      `}</style>
    </div>
  )
} 