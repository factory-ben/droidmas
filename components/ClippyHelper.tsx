'use client'

import { useState, useEffect } from 'react'
import { DAY_COLORS } from './PixelStartScreen'

interface ClippyHelperProps {
  day: number
  speechText: string
}

export function ClippyHelper({ day, speechText }: ClippyHelperProps) {
  const [isOpen, setIsOpen] = useState(true)
  const gradientColors = DAY_COLORS[day] || DAY_COLORS[1]
  const avatarSrc = 'https://pbs.twimg.com/profile_images/1927385934024105985/dbNOM1In_400x400.png'

  // Auto-hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false)
    }, 10000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div 
            className="bg-white text-black p-3 max-w-[200px] font-mono text-xs leading-relaxed"
            style={{
              clipPath: 'polygon(0 6px, 6px 6px, 6px 0, calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px))',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
            }}
          >
            <p>{speechText}</p>
          </div>
          <div 
            className="absolute -bottom-3 right-4"
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '12px solid white'
            }}
          />
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
        style={{ width: 56, height: 56 }}
      >
        <div 
          className={`absolute -inset-0.5 bg-gradient-to-br ${gradientColors} opacity-75 transition-opacity group-hover:opacity-100`}
          style={{ 
            clipPath: 'polygon(0 6px, 6px 6px, 6px 0, calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px))'
          }} 
        />
        <div 
          className="absolute inset-0 bg-black"
          style={{ 
            clipPath: 'polygon(0 6px, 6px 6px, 6px 0, calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px))'
          }} 
        />
        <img 
          src={avatarSrc} 
          alt="Helper"
          className="absolute inset-1 object-cover"
          style={{ 
            imageRendering: 'pixelated',
            filter: 'contrast(1.1) saturate(1.2)',
            clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))'
          }}
        />
        <div 
          className="absolute inset-1 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
            clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))'
          }}
        />
      </button>
    </div>
  )
}
