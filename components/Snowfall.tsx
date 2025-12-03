'use client'

import { useEffect, useMemo, useState } from 'react'

type SnowflakeProps = {
  left: number
  size: number
  opacity: number
  fallDuration: number
  driftDuration: number
  delay: number
}

function Snowflake({ left, size, opacity, fallDuration, driftDuration, delay }: SnowflakeProps) {
  return (
    <div
      className="snowflake"
      style={{
        left: `${left}%`,
        animationDuration: `${driftDuration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="snowflake-dot"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          opacity,
          animationDuration: `${fallDuration}s`,
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  )
}

const SNOWFLAKE_COUNT = 90

export default function Snowfall() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsEnabled(false)
    }
    setMounted(true)
  }, [])

  const snowflakes = useMemo(() => {
    if (!mounted) return []
    return Array.from({ length: SNOWFLAKE_COUNT }).map((_, idx) => {
      const size = 2 + Math.random() * 4.5
      return {
        id: idx,
        left: Math.random() * 100,
        size,
        opacity: 0.35 + Math.random() * 0.5,
        fallDuration: 8 + Math.random() * 10,
        driftDuration: 6 + Math.random() * 6,
        delay: Math.random() * 8,
      }
    })
  }, [mounted])

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      {isEnabled && mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {snowflakes.map((flake) => (
            <Snowflake key={flake.id} {...flake} />
          ))}
        </div>
      )}

      <div className="pointer-events-auto absolute right-4 top-4 z-20">
        <button
          type="button"
          onClick={() => setIsEnabled((prev) => !prev)}
          className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs font-mono text-white shadow-sm shadow-black/30 backdrop-blur transition hover:border-white/35 hover:bg-white/10"
          aria-pressed={isEnabled}
        >
          {isEnabled ? 'Snow: on' : 'Snow: off'}
        </button>
      </div>

      <style jsx global>{`
        .snowflake {
          position: absolute;
          top: -12%;
          animation-name: snow-drift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          will-change: transform;
        }

        .snowflake-dot {
          position: relative;
          display: block;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.9);
          animation-name: snow-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.4));
        }

        @keyframes snow-fall {
          0% { transform: translateY(-10vh); }
          100% { transform: translateY(110vh); }
        }

        @keyframes snow-drift {
          0% { transform: translateX(-8px); }
          100% { transform: translateX(8px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .snowflake,
          .snowflake-dot {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
