'use client'

import { useState, useEffect } from 'react'
import { DAY_COLORS } from './PixelStartScreen'

interface ClippyHelperProps {
  day: number
  speechText: string
  avatarSrc?: string
  hideOnMobile?: boolean
}

const DAY_AVATAR_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#8b5cf6', '#ef4444', '#0ea5e9', '#d946ef']
const DAY_AVATAR_EMOJIS = ['🤖', '🎯', '🧠', '🚀', '🎮', '🎨', '🧪', '🛠️', '🕹️', '📈', '🧩', '⚡']
const FALLBACK_AVATAR = 'https://pbs.twimg.com/profile_images/1927385934024105985/dbNOM1In_400x400.png'

function getAvatarSrc(day: number, override?: string) {
  if (override) return override

  const color = DAY_AVATAR_COLORS[(day - 1 + DAY_AVATAR_COLORS.length) % DAY_AVATAR_COLORS.length]
  const emoji = DAY_AVATAR_EMOJIS[(day - 1 + DAY_AVATAR_EMOJIS.length) % DAY_AVATAR_EMOJIS.length]
  const label = `Day ${day}`

  try {
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
        <rect width='64' height='64' rx='10' fill='${color}' />
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-size='22'>${emoji}</text>
        <text x='50%' y='84%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10' fill='white' opacity='0.9'>${label}</text>
      </svg>
    `
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  } catch {
    return FALLBACK_AVATAR
  }
}

export function ClippyHelper({ day, speechText, avatarSrc: avatarOverride, hideOnMobile }: ClippyHelperProps) {
  const [isOpen, setIsOpen] = useState(true)
  const gradientColors = DAY_COLORS[day] || DAY_COLORS[1]
  const avatarSrc = getAvatarSrc(day, avatarOverride)

  // Auto-hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false)
    }, 10000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 ${hideOnMobile ? 'hidden md:flex' : ''}`}>
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
