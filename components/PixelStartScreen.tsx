'use client'

import React from 'react'

interface PixelAvatarProps {
  src: string
  alt: string
  size?: number
  gradientColors?: string
}

export function PixelAvatar({ src, alt, size = 80, gradientColors = 'from-green-400 via-cyan-400 to-purple-500' }: PixelAvatarProps) {
  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
    >
      <div 
        className={`absolute -inset-1 bg-gradient-to-br ${gradientColors} opacity-75`}
        style={{ 
          clipPath: 'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))'
        }} 
      />
      <div 
        className="absolute inset-0 bg-black"
        style={{ 
          clipPath: 'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))'
        }} 
      />
      <img 
        src={src} 
        alt={alt}
        className="absolute inset-1 object-cover"
        style={{ 
          imageRendering: 'pixelated',
          filter: 'contrast(1.1) saturate(1.2)',
          clipPath: 'polygon(0 6px, 6px 6px, 6px 0, calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px))'
        }}
      />
      <div 
        className="absolute inset-1 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          clipPath: 'polygon(0 6px, 6px 6px, 6px 0, calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px))'
        }}
      />
    </div>
  )
}

interface SpeechBubbleProps {
  children: React.ReactNode
  direction?: 'left' | 'right'
}

export function SpeechBubble({ children, direction = 'right' }: SpeechBubbleProps) {
  return (
    <div className="relative">
      <div 
        className="bg-white text-black p-4 max-w-sm font-mono text-sm leading-relaxed"
        style={{
          clipPath: 'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.3)'
        }}
      >
        {children}
      </div>
      <div 
        className={`absolute top-1/2 -translate-y-1/2 ${direction === 'left' ? '-left-4' : '-right-4'}`}
        style={{
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          ...(direction === 'left' 
            ? { borderRight: '16px solid white' }
            : { borderLeft: '16px solid white' }
          )
        }}
      />
    </div>
  )
}

interface PixelButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  buttonColor?: string
  shadowColor?: string
  className?: string
}

export function PixelButton({ children, onClick, href, buttonColor = 'bg-orange-500 hover:bg-orange-400', shadowColor = 'bg-orange-700', className = '' }: PixelButtonProps) {
  const pixelClip = 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))'

  const content = (
    <div className="relative group">
      <div 
        className={`absolute inset-0 ${shadowColor} translate-x-1 translate-y-1`}
        style={{ clipPath: pixelClip }}
      />
      <div 
        className={`relative px-12 py-4 ${buttonColor} text-black font-bold text-xl transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-1 group-active:translate-y-1 ${className}`}
        style={{ clipPath: pixelClip }}
      >
        {children}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="inline-block cursor-pointer">
        {content}
      </a>
    )
  }

  return (
    <button onClick={onClick} className="inline-block cursor-pointer">
      {content}
    </button>
  )
}

interface PixelStartScreenProps {
  title: string
  subtitle?: string
  avatarSrc: string
  avatarAlt?: string
  speechText: string
  onStart: () => void
  gradientColors?: string
  buttonText?: string
}

export function PixelStartScreen({
  title,
  subtitle,
  avatarSrc,
  avatarAlt = 'Character',
  speechText,
  onStart,
  gradientColors = 'from-green-400 via-cyan-400 to-purple-500',
  buttonText = 'START'
}: PixelStartScreenProps) {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Decorative pixels - contained within main area */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-green-400 animate-pulse" />
      <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-10 right-10 w-2 h-2 bg-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <div className="max-w-2xl w-full">
        {/* Retro Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 tracking-tight">
            <span className="text-green-400">🎮</span> {title}
          </h1>
          <div className={`h-1 w-32 mx-auto bg-gradient-to-r ${gradientColors}`} />
          {subtitle && <p className="text-zinc-400 mt-3">{subtitle}</p>}
        </div>

        {/* Character + Speech Bubble */}
        <div className="flex items-center justify-center gap-6 mb-10 pl-8">
          <PixelAvatar 
            src={avatarSrc} 
            alt={avatarAlt}
            size={96}
            gradientColors={gradientColors}
          />
          <SpeechBubble direction="left">
            <p className="mb-3">{speechText}</p>
          </SpeechBubble>
        </div>
        
        {/* Start Button - Retro Style */}
        <div className="text-center">
          <PixelButton onClick={onStart}>
            ▶ {buttonText}
          </PixelButton>
          
          <p className="text-zinc-600 text-xs mt-6 font-mono">
            Press {buttonText} to begin
          </p>
        </div>
      </div>
    </div>
  )
}

export const DAY_COLORS: Record<number, string> = {
  1: 'from-green-400 via-cyan-400 to-blue-500',
  2: 'from-red-400 via-orange-400 to-yellow-500',
  3: 'from-cyan-400 via-purple-400 to-pink-500',
  4: 'from-yellow-400 via-green-400 to-emerald-500',
  5: 'from-purple-400 via-pink-400 to-rose-500',
  6: 'from-blue-400 via-purple-400 to-violet-500',
  7: 'from-green-400 via-teal-400 to-cyan-500',
  8: 'from-orange-400 via-red-400 to-rose-500',
  9: 'from-pink-400 via-cyan-400 to-blue-500',
  10: 'from-teal-400 via-green-400 to-emerald-500',
  11: 'from-cyan-400 via-blue-400 to-indigo-500',
  12: 'from-pink-400 via-purple-400 to-violet-500',
}
