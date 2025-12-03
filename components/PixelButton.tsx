'use client'

import React from 'react'
import Link from 'next/link'

interface PixelButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
  buttonColor?: string
  shadowColor?: string
  className?: string
}

export function PixelButton({ 
  children, 
  onClick, 
  href, 
  disabled = false,
  buttonColor = 'bg-orange-500 hover:bg-orange-400', 
  shadowColor = 'bg-orange-700', 
  className = '' 
}: PixelButtonProps) {
  const pixelClip = 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))'

  const content = (
    <div className={`relative group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div 
        className={`absolute inset-0 ${disabled ? 'bg-zinc-700' : shadowColor} translate-x-1 translate-y-1`}
        style={{ clipPath: pixelClip }}
      />
      <div 
        className={`relative px-8 py-3 ${disabled ? 'bg-zinc-600 text-zinc-400' : buttonColor + ' text-black'} font-bold text-lg transition-all ${!disabled && 'group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-1 group-active:translate-y-1'} ${className}`}
        style={{ clipPath: pixelClip }}
      >
        {children}
      </div>
    </div>
  )

  if (disabled) {
    return <div className="inline-block">{content}</div>
  }

  if (href) {
    return (
      <Link href={href} className="inline-block cursor-pointer">
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className="inline-block cursor-pointer">
      {content}
    </button>
  )
}
