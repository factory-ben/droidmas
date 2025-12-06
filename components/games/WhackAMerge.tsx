'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ClippyHelper } from '@/components/ClippyHelper'

const GAME_DURATION = 40

const teammates = [
  { name: 'The Intern', emoji: '🐣', color: '#fbbf24' },
  { name: 'Senior Dev', emoji: '👴', color: '#60a5fa' },
  { name: 'AI Agent #1', emoji: '🤖', color: '#a78bfa' },
  { name: 'AI Agent #2', emoji: '🦾', color: '#c084fc' },
  { name: 'You (3am)', emoji: '😵', color: '#f87171' },
  { name: 'The PM', emoji: '📋', color: '#4ade80' },
  { name: 'DevOps', emoji: '🔧', color: '#fb923c' },
  { name: 'That Contractor', emoji: '👻', color: '#94a3b8' },
]

interface PowerUp {
  id: number
  x: number
  y: number
  type: 'coffee' | 'gitclean' | 'shield'
  emoji: string
  name: string
  lifetime: number
  age: number
}

const powerUpTypes: Record<PowerUp['type'], { emoji: string; name: string; color: string }> = {
  coffee: { emoji: '☕', name: 'Coffee Rush', color: 'bg-amber-500' },
  gitclean: { emoji: '💣', name: 'Git Clean', color: 'bg-purple-500' },
  shield: { emoji: '🛡️', name: 'CI Shield', color: 'bg-cyan-500' },
}

interface ConflictType {
  name: string
  emoji: string
  files: string[]
  difficulty: 'easy' | 'medium' | 'hard' | 'boss'
  spawnOnMiss: number
  points: number
  lifetime: number
}

const conflictTypes: ConflictType[] = [
  { 
    name: 'Whitespace', 
    emoji: '⚪', 
    files: ['README.md', '.prettierrc', 'style.css'],
    difficulty: 'easy',
    spawnOnMiss: 0,
    points: 5,
    lifetime: 3500
  },
  { 
    name: 'Typo Fix', 
    emoji: '✏️', 
    files: ['constants.ts', 'strings.json', 'copy.md'],
    difficulty: 'easy',
    spawnOnMiss: 0,
    points: 5,
    lifetime: 3500
  },
  { 
    name: 'Feature Branch', 
    emoji: '🌿', 
    files: ['feature.tsx', 'api/route.ts', 'utils.ts', 'hooks/useData.ts'],
    difficulty: 'medium',
    spawnOnMiss: 1,
    points: 10,
    lifetime: 2800
  },
  { 
    name: 'CSS War', 
    emoji: '🎨', 
    files: ['globals.css', 'tailwind.config.js', 'components.css', 'theme.ts'],
    difficulty: 'medium',
    spawnOnMiss: 1,
    points: 10,
    lifetime: 2800
  },
  { 
    name: 'Schema Drift', 
    emoji: '🗄️', 
    files: ['schema.prisma', 'migrations/', 'types.d.ts', 'db.ts'],
    difficulty: 'medium',
    spawnOnMiss: 1,
    points: 15,
    lifetime: 2500
  },
  { 
    name: 'Dependency Hell', 
    emoji: '📦', 
    files: ['package.json', 'package-lock.json', 'yarn.lock', 'node_modules/'],
    difficulty: 'hard',
    spawnOnMiss: 2,
    points: 20,
    lifetime: 1800
  },
  { 
    name: 'Auth Refactor', 
    emoji: '🔐', 
    files: ['auth.ts', 'middleware.ts', 'session.ts', 'jwt.ts'],
    difficulty: 'hard',
    spawnOnMiss: 2,
    points: 25,
    lifetime: 1600
  },
  { 
    name: 'AI Refactor', 
    emoji: '🧠', 
    files: ['*.ts', 'src/**/*', 'lib/**/*', 'components/**/*'],
    difficulty: 'hard',
    spawnOnMiss: 2,
    points: 25,
    lifetime: 1600
  },
  { 
    name: 'FORCE PUSH', 
    emoji: '💀', 
    files: ['* (ENTIRE REPO)'],
    difficulty: 'boss',
    spawnOnMiss: 4,
    points: 50,
    lifetime: 1400
  },
]

const chaosMessages = [
  { trigger: 'spawn', messages: [
    '🚨 Your teammate just shipped a PR!',
    '⚠️ Agent pushed to main!',
    '💥 Someone ran npm install',
    '🔥 PR merged without review!',
    '😱 Force push detected!',
    '🤖 AI agent went rogue!',
    '📦 Dependencies updated upstream!',
    '🎯 Hotfix incoming!',
    '⚡ Three devs, one file!',
    '🌀 Git history is chaos!',
    '🏃 Friday 4:59pm deploy!',
    '🐛 "Quick fix" landed!',
    '📋 PM changed requirements!',
    '🎨 Designer pushed directly!',
  ]},
  { trigger: 'miss', messages: [
    '💢 Conflict multiplied!',
    '🔀 Branch diverged further!',
    '⛓️ Dependency chain broke!',
    '🌋 Cascade failure!',
    '📈 Entropy increasing!',
  ]},
  { trigger: 'boss', messages: [
    '☠️ FORCE PUSH DETECTED!',
    '🚨 CRITICAL: Main branch corrupted!',
    '💀 Someone rewrote history!',
  ]},
]

interface Conflict {
  id: number
  x: number
  y: number
  type: ConflictType
  file: string
  causedBy: typeof teammates[0]
  age: number
  isExploding: boolean
  isSplitting: boolean
  spawnedFrom?: { x: number; y: number }
}

interface FloatingScore {
  id: number
  x: number
  y: number
  points: number
  combo: number
}

export default function WhackAMerge() {
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [score, setScore] = useState(0)
  const [resolved, setResolved] = useState(0)
  const [missed, setMissed] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing')
  const [spawnRate, setSpawnRate] = useState(2000)
  const [lastMessage, setLastMessage] = useState('')
  const [ciStatus, setCiStatus] = useState(100)
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [screenFlash, setScreenFlash] = useState(false)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [activePowerUp, setActivePowerUp] = useState<{ type: string; endsAt: number } | null>(null)
  const [coffeeSlowdown, setCoffeeSlowdown] = useState(false)
  const [ciShield, setCiShield] = useState(false)
  const [clutchResolves, setClutchResolves] = useState(0)
  const [totalResolveTime, setTotalResolveTime] = useState(0)
  const [konamiIndex, setKonamiIndex] = useState(0)
  const [godMode, setGodMode] = useState(false)
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

  const idCounter = useRef(0)
  const powerUpIdCounter = useRef(0)
  const gameStateRef = useRef<'playing' | 'ended'>('playing')
  const spawnConflictRef = useRef<(fromPosition?: { x: number; y: number }, forceType?: ConflictType) => void>(() => {})
  const timeLeftRef = useRef(GAME_DURATION)

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    setLastMessage('🚀 Sprint started! Conflicts incoming...')
    setTimeout(() => {
      for (let i = 0; i < 2; i++) {
        setTimeout(() => spawnConflictRef.current(), i * 300)
      }
    }, 200)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const expectedKey = konamiCode[konamiIndex]
      if (e.code === expectedKey) {
        const newIndex = konamiIndex + 1
        setKonamiIndex(newIndex)
        
        if (newIndex === konamiCode.length) {
          setGodMode(true)
          setKonamiIndex(0)
          setMilestone('🌈 GOD MODE ACTIVATED!')
          setLastMessage('🎮 Secret unlocked!')
          setCiStatus(100)
          setCiShield(true)
          setScreenFlash(true)
          setTimeout(() => setScreenFlash(false), 300)
          setTimeout(() => setMilestone(null), 2000)
        }
      } else {
        setKonamiIndex(0)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [konamiIndex, konamiCode])

  useEffect(() => {
    if (ciShield) return
    const activeCount = conflicts.length
    const degradation = Math.min(activeCount * 2, 50)
    setCiStatus(Math.max(0, 100 - missed * 4 - degradation))
  }, [conflicts.length, missed, ciShield])

  const getRandomConflictType = useCallback((): ConflictType => {
    const elapsed = GAME_DURATION - timeLeftRef.current
    const hardWeight = Math.min(elapsed / 25, 0.7)
    
    const rand = Math.random()
    if (rand < 0.03 && elapsed > 15) {
      return conflictTypes.find(c => c.difficulty === 'boss')!
    } else if (rand < hardWeight) {
      const hard = conflictTypes.filter(c => c.difficulty === 'hard')
      return hard[Math.floor(Math.random() * hard.length)]
    } else if (rand < 0.5) {
      const medium = conflictTypes.filter(c => c.difficulty === 'medium')
      return medium[Math.floor(Math.random() * medium.length)]
    } else {
      const easy = conflictTypes.filter(c => c.difficulty === 'easy')
      return easy[Math.floor(Math.random() * easy.length)]
    }
  }, [])

  const MAX_CONFLICTS = 40

  const spawnConflict = useCallback((fromPosition?: { x: number; y: number }, forceType?: ConflictType) => {
    if (gameStateRef.current !== 'playing') return
    
    const type = forceType || getRandomConflictType()
    const file = type.files[Math.floor(Math.random() * type.files.length)]
    const causedBy = teammates[Math.floor(Math.random() * teammates.length)]
    
    const x = 5 + Math.random() * 90
    const y = 5 + Math.random() * 75
    
    const newConflict: Conflict = {
      id: idCounter.current++,
      x,
      y,
      type,
      file,
      causedBy,
      age: 0,
      isExploding: false,
      isSplitting: false,
      spawnedFrom: fromPosition,
    }
    
    setConflicts(prev => {
      const activeCount = prev.filter(c => !c.isExploding && !c.isSplitting).length
      if (activeCount >= MAX_CONFLICTS) return prev
      return [...prev, newConflict]
    })
    
    if (type.difficulty === 'boss') {
      const msgs = chaosMessages.find(m => m.trigger === 'boss')!.messages
      setLastMessage(msgs[Math.floor(Math.random() * msgs.length)])
    } else if (!fromPosition) {
      const msgs = chaosMessages.find(m => m.trigger === 'spawn')!.messages
      setLastMessage(msgs[Math.floor(Math.random() * msgs.length)])
    }
  }, [getRandomConflictType])

  useEffect(() => {
    spawnConflictRef.current = spawnConflict
  }, [spawnConflict])

  useEffect(() => {
    if (gameState !== 'playing') return
    
    const spawnPowerUp = () => {
      const types: Array<PowerUp['type']> = ['coffee', 'gitclean', 'shield']
      const type = types[Math.floor(Math.random() * types.length)]
      const config = powerUpTypes[type]
      
      const powerUp: PowerUp = {
        id: powerUpIdCounter.current++,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 60,
        type,
        emoji: config.emoji,
        name: config.name,
        lifetime: 4000,
        age: 0,
      }
      
      setPowerUps(prev => [...prev, powerUp])
    }
    
    const initialTimeout = setTimeout(spawnPowerUp, 8000)
    const interval = setInterval(spawnPowerUp, 10000 + Math.random() * 4000)
    
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return
    
    const interval = setInterval(() => {
      setPowerUps(prev => prev
        .map(p => ({ ...p, age: p.age + 100 }))
        .filter(p => p.age < p.lifetime)
      )
    }, 100)
    
    return () => clearInterval(interval)
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return
    const activeConflicts = conflicts.filter(c => !c.isExploding && !c.isSplitting).length
    if (activeConflicts > 0) return

    const timeout = setTimeout(() => spawnConflictRef.current(), 300)
    return () => clearTimeout(timeout)
  }, [conflicts, gameState])

  useEffect(() => {
    if (gameState !== 'playing') return
    const interval = setInterval(() => spawnConflictRef.current(), spawnRate)
    return () => clearInterval(interval)
  }, [gameState, spawnRate])

  useEffect(() => {
    if (gameState !== 'playing') return
    
    const TICK_MS = 100
    const slowdownMultiplier = godMode ? 0.15 : coffeeSlowdown ? 0.3 : 1
    
    const interval = setInterval(() => {
      setConflicts(prev => {
        const updated: Conflict[] = []
        const toSpawn: { x: number; y: number; count: number }[] = []
        let missedCount = 0
        
        prev.forEach(c => {
          if (c.isExploding || c.isSplitting) {
            if (c.age < c.type.lifetime + 200) {
              updated.push({ ...c, age: c.age + TICK_MS })
            }
            return
          }
          
          const aged = { ...c, age: c.age + (TICK_MS * slowdownMultiplier) }
          
          if (aged.age >= c.type.lifetime) {
            missedCount++
            updated.push({ ...aged, isSplitting: true })
            toSpawn.push({ x: c.x, y: c.y, count: c.type.spawnOnMiss })
            return
          }
          
          updated.push(aged)
        })
        
        if (missedCount > 0) {
          setMissed(m => m + missedCount)
          setCombo(0)
          const msgs = chaosMessages.find(m => m.trigger === 'miss')!.messages
          setLastMessage(msgs[Math.floor(Math.random() * msgs.length)])
        }
        
        toSpawn.forEach(({ x, y, count }) => {
          for (let i = 0; i < count; i++) {
            spawnConflictRef.current({ x, y })
          }
        })
        
        return updated.filter(c => !c.isSplitting || c.age < c.type.lifetime + 200)
      })
    }, TICK_MS)
    
    return () => clearInterval(interval)
  }, [gameState, coffeeSlowdown, godMode])

  useEffect(() => {
    if (gameState !== 'playing') return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('ended')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return
    const interval = setInterval(() => {
      setSpawnRate(r => Math.max(1000, r - 200))
    }, 5000)
    return () => clearInterval(interval)
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return
    const elapsed = GAME_DURATION - timeLeft
    
    if (elapsed === 15) {
      setLastMessage('⚡ CONFLICT STORM!')
      setMilestone('⚡ CONFLICT STORM!')
      for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnConflictRef.current(), i * 150)
      }
      setTimeout(() => setMilestone(null), 1500)
    }
    
    if (timeLeft === 15) {
      setLastMessage('☠️ BOSS WAVE INCOMING!')
      const bossType = conflictTypes.find(c => c.difficulty === 'boss')!
      setTimeout(() => spawnConflictRef.current(undefined, bossType), 500)
    }
    
    if (elapsed === 10) {
      setLastMessage('🔥 Things are heating up!')
      for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnConflictRef.current(), i * 200)
      }
    }
  }, [timeLeft, gameState])

  useEffect(() => {
    if (resolved === 10) {
      setMilestone('🔥 10 RESOLVED!')
      setTimeout(() => setMilestone(null), 1500)
    } else if (resolved === 20) {
      setMilestone('💪 20 RESOLVED!')
      setTimeout(() => setMilestone(null), 1500)
    } else if (resolved === 30) {
      setMilestone('🏆 30 RESOLVED!')
      setTimeout(() => setMilestone(null), 1500)
    }
  }, [resolved])

  useEffect(() => {
    if (floatingScores.length === 0) return
    const timeout = setTimeout(() => {
      setFloatingScores(prev => prev.slice(1))
    }, 800)
    return () => clearTimeout(timeout)
  }, [floatingScores])

  const collectPowerUp = (powerUp: PowerUp) => {
    setPowerUps(prev => prev.filter(p => p.id !== powerUp.id))
    
    const config = powerUpTypes[powerUp.type]
    setLastMessage(`${config.emoji} ${config.name}!`)
    setActivePowerUp({ type: powerUp.type, endsAt: Date.now() + 3000 })
    
    if (powerUp.type === 'coffee') {
      setCoffeeSlowdown(true)
      setTimeout(() => setCoffeeSlowdown(false), 3000)
    } else if (powerUp.type === 'gitclean') {
      setConflicts(prev => prev.map(c => ({ ...c, isExploding: true })))
      const clearedCount = conflicts.filter(c => !c.isExploding && !c.isSplitting).length
      setScore(s => s + clearedCount * 5)
      setResolved(r => r + clearedCount)
      setTimeout(() => setConflicts([]), 200)
      setScreenFlash(true)
      setTimeout(() => setScreenFlash(false), 150)
    } else if (powerUp.type === 'shield') {
      setCiShield(true)
      setCiStatus(Math.min(100, ciStatus + 20))
      setTimeout(() => setCiShield(false), 5000)
    }
    
    setTimeout(() => setActivePowerUp(null), 3000)
  }

  const whackConflict = (id: number) => {
    const conflict = conflicts.find(c => c.id === id)
    if (!conflict || conflict.isExploding || conflict.isSplitting) return
    
    const wasClutch = conflict.age / conflict.type.lifetime > 0.8
    
    setConflicts(prev => prev.map(c => 
      c.id === id ? { ...c, isExploding: true } : c
    ))
    
    setTimeout(() => {
      setConflicts(prev => prev.filter(c => c.id !== id))
    }, 200)
    
    const newCombo = combo + 1
    setCombo(newCombo)
    setMaxCombo(m => Math.max(m, newCombo))
    
    const comboMultiplier = 1 + Math.floor(newCombo / 5) * 0.5
    const points = Math.round(conflict.type.points * comboMultiplier)
    setScore(s => s + points)
    setResolved(r => r + 1)
    
    setTotalResolveTime(t => t + conflict.age)
    if (timeLeft <= 10) {
      setClutchResolves(c => c + 1)
    }
    
    setFloatingScores(prev => [...prev, {
      id: Date.now(),
      x: conflict.x,
      y: conflict.y,
      points,
      combo: newCombo
    }])
    
    if (newCombo >= 5 && newCombo % 5 === 0) {
      setScreenFlash(true)
      setTimeout(() => setScreenFlash(false), 100)
      setMilestone(`🔥 ${newCombo}x COMBO!`)
      setTimeout(() => setMilestone(null), 1000)
    }
    
    if (wasClutch) {
      setLastMessage('😰 CLOSE CALL!')
    }
  }

  const startGame = () => {
    setConflicts([])
    setPowerUps([])
    setFloatingScores([])
    setScore(0)
    setResolved(0)
    setMissed(0)
    setCombo(0)
    setMaxCombo(0)
    setTimeLeft(GAME_DURATION)
    setSpawnRate(2000)
    setLastMessage('🚀 Sprint started! Conflicts incoming...')
    setCiStatus(100)
    setMilestone(null)
    setActivePowerUp(null)
    setCoffeeSlowdown(false)
    setCiShield(false)
    setClutchResolves(0)
    setTotalResolveTime(0)
    setGodMode(false)
    setKonamiIndex(0)
    gameStateRef.current = 'playing'
    setGameState('playing')
    
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnConflictRef.current(), i * 250)
      }
    }, 200)
  }

  const getConflictColor = (conflict: Conflict) => {
    if (conflict.isExploding) return 'bg-green-500 scale-150 opacity-0'
    if (conflict.isSplitting) return 'bg-red-600 scale-125 opacity-50'
    
    const progress = conflict.age / conflict.type.lifetime
    if (conflict.type.difficulty === 'boss') return 'bg-red-600 border-red-400 animate-pulse shadow-red-500/50 shadow-lg'
    if (progress < 0.4) return 'bg-yellow-500 border-yellow-400 shadow-yellow-500/30'
    if (progress < 0.7) return 'bg-orange-500 border-orange-400 shadow-orange-500/30'
    return 'bg-red-500 border-red-400 shadow-red-500/30 animate-pulse'
  }

  const getCIColor = () => {
    if (ciShield) return 'bg-cyan-400 animate-pulse'
    if (ciStatus > 70) return 'bg-green-500'
    if (ciStatus > 40) return 'bg-yellow-500'
    if (ciStatus > 20) return 'bg-orange-500'
    return 'bg-red-500 animate-pulse'
  }

  const getPersonalityTitle = () => {
    const avgResolveTime = resolved > 0 ? totalResolveTime / resolved : 999999
    const clutchRatio = resolved > 0 ? clutchResolves / resolved : 0
    
    if (godMode) return { title: '🌈 Konami Legend', desc: 'You found the secret' }
    if (maxCombo >= 15) return { title: '🔥 Combo God', desc: 'Your combo game is unmatched' }
    if (avgResolveTime < 800 && resolved > 15) return { title: '⚡ Speed Demon', desc: 'Lightning-fast reflexes' }
    if (clutchRatio > 0.3 && resolved > 10) return { title: '😎 Clutch Master', desc: 'Thrives under pressure' }
    if (missed === 0 && resolved > 10) return { title: '🎯 Perfectionist', desc: 'Not a single miss' }
    if (missed > resolved) return { title: '🌪️ Chaos Survivor', desc: 'Somehow made it through' }
    if (resolved > 25) return { title: '💪 Merge Machine', desc: 'Conflict resolution expert' }
    return { title: '🔧 Resolver', desc: 'Gets the job done' }
  }

  if (gameState === 'ended') {
    const total = resolved + missed
    const resolveRate = total > 0 ? Math.round((resolved / total) * 100) : 0
    const grade = resolveRate >= 90 ? 'S' : resolveRate >= 80 ? 'A' : resolveRate >= 70 ? 'B' : resolveRate >= 60 ? 'C' : resolveRate >= 50 ? 'D' : 'F'
    const personality = getPersonalityTitle()
    
    return (
      <div className="min-h-full bg-black text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {resolveRate >= 70 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                {['🎉', '✨', '🏆', '💪'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        )}
        
        <div className="max-w-xl text-center space-y-6 relative z-10">
          <h1 className="text-4xl font-bold">
            {resolveRate >= 80 ? '🏆 Merge Master!' : 
             resolveRate >= 60 ? '👍 Decent Resolver' :
             resolveRate >= 40 ? '😅 Conflict Chaos' :
             '💀 git reset --hard'}
          </h1>
          
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl">
            <div className="text-3xl mb-1">{personality.title}</div>
            <div className="text-sm text-white/80">{personality.desc}</div>
          </div>
          
          <div className="bg-zinc-900 p-6 rounded-xl space-y-5">
            <div className="text-center">
              <div className={`text-7xl font-mono font-bold ${
                grade === 'S' ? 'text-yellow-400' :
                grade === 'A' ? 'text-green-400' :
                grade === 'B' ? 'text-blue-400' :
                grade === 'C' ? 'text-orange-400' :
                'text-red-400'
              }`}>{grade}</div>
              <p className="text-zinc-500 text-sm">Grade</p>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-zinc-800 p-3 rounded-lg text-center">
                <p className="text-2xl font-mono font-bold text-blue-400">{score}</p>
                <p className="text-xs text-zinc-500">Score</p>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg text-center">
                <p className="text-2xl font-mono font-bold text-green-400">{resolved}</p>
                <p className="text-xs text-zinc-500">Resolved</p>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg text-center">
                <p className="text-2xl font-mono font-bold text-red-400">{missed}</p>
                <p className="text-xs text-zinc-500">Missed</p>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg text-center">
                <p className="text-2xl font-mono font-bold text-yellow-400">{maxCombo}x</p>
                <p className="text-xs text-zinc-500">Max Combo</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-3xl font-mono font-bold">{resolveRate}%</p>
                <p className="text-xs text-zinc-500">Resolve Rate</p>
              </div>
              <div className="text-center">
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`h-full ${ciStatus > 50 ? 'bg-green-500' : ciStatus > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${ciStatus}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">CI: {ciStatus > 70 ? '✅' : ciStatus > 40 ? '⚠️' : ciStatus > 0 ? '❌' : '💀'}</p>
              </div>
            </div>
          </div>
          
          <p className="text-zinc-600 italic text-sm">
            {resolveRate >= 80 
              ? '"This dev can handle 10 parallel agents."'
              : resolveRate >= 60
                ? '"Maybe 5 agents max."'
                : resolveRate >= 40
                  ? '"Just spin up more agents, they said."'
                  : '"The repo never recovered."'}
          </p>
          
          <button
            onClick={startGame}
            className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all hover:scale-105"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-full bg-black text-white flex flex-col overflow-hidden relative ${timeLeft <= 10 ? 'animate-pulse-border' : ''}`}>
      <ClippyHelper day={3} speechText="Conflicts are popping up everywhere! Click them before they expire. Miss one and it multiplies. 40 seconds to survive the chaos." hideOnMobile />
      {screenFlash && (
        <div className="absolute inset-0 bg-white/30 z-[100] pointer-events-none" />
      )}
      
      {timeLeft <= 5 && timeLeft > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[90] pointer-events-none">
          <div className="text-[150px] font-mono font-bold text-white/20 animate-ping">
            {timeLeft}
          </div>
        </div>
      )}
      
      {milestone && (
        <div className="absolute inset-0 flex items-center justify-center z-[80] pointer-events-none">
          <div className="text-4xl font-bold text-yellow-400 animate-bounce bg-black/80 px-8 py-4 rounded-2xl">
            {milestone}
          </div>
        </div>
      )}
      
      {activePowerUp && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[70] pointer-events-none">
          <div className={`px-4 py-2 rounded-full text-white font-bold animate-pulse ${
            activePowerUp.type === 'coffee' ? 'bg-amber-500' :
            activePowerUp.type === 'shield' ? 'bg-cyan-500' : 'bg-purple-500'
          }`}>
            {powerUpTypes[activePowerUp.type as keyof typeof powerUpTypes].emoji} {powerUpTypes[activePowerUp.type as keyof typeof powerUpTypes].name} Active!
          </div>
        </div>
      )}
      
      <div className="bg-black/90 backdrop-blur border-b border-zinc-800 p-3 z-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-blue-400">{score}</div>
                <div className="text-xs text-zinc-500">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-green-400">{resolved}</div>
                <div className="text-xs text-zinc-500">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-red-400">{missed}</div>
                <div className="text-xs text-zinc-500">Missed</div>
              </div>
              {combo > 2 && (
                <div className="text-center animate-pulse">
                  <div className={`text-2xl font-mono font-bold ${combo >= 10 ? 'text-orange-400' : 'text-yellow-400'}`}>{combo}x</div>
                  <div className={`text-xs ${combo >= 10 ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {combo >= 10 ? '🔥 ON FIRE!' : 'COMBO!'}
                  </div>
                </div>
              )}
              {godMode && (
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-pulse">GOD</div>
                  <div className="text-xs text-purple-400">🌈 MODE</div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-orange-400">{conflicts.filter(c => !c.isExploding && !c.isSplitting).length}</div>
                <div className="text-xs text-zinc-500">Active</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-mono font-bold ${
                  timeLeft <= 5 ? 'text-red-500 animate-pulse scale-125' : 
                  timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''
                }`}>
                  {timeLeft}s
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">CI{ciShield ? ' 🛡️' : ''}:</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getCIColor()}`}
                style={{ width: `${ciStatus}%` }}
              />
            </div>
            <span className={`text-xs font-mono ${
              ciShield ? 'text-cyan-400' :
              ciStatus > 70 ? 'text-green-400' : 
              ciStatus > 40 ? 'text-yellow-400' : 
              ciStatus > 20 ? 'text-orange-400' : 'text-red-400'
            }`}>
              {ciShield ? '🛡️ Protected' :
               ciStatus > 70 ? '✓ Passing' : 
               ciStatus > 40 ? '⚠ Degraded' : 
               ciStatus > 20 ? '✗ Failing' : '💀 Dead'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(239, 68, 68, ${Math.min(conflicts.length / 25, 0.4)}) 100%)`,
          }}
        />
        
        {coffeeSlowdown && (
          <div className="absolute inset-0 pointer-events-none bg-amber-500/10 animate-pulse" />
        )}
        
        {godMode && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 animate-pulse"
            style={{
              background: 'linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3)',
              backgroundSize: '400% 400%',
              animation: 'rainbow 3s ease infinite',
            }}
          />
        )}
        
        {timeLeft <= 10 && (
          <div className="absolute inset-0 pointer-events-none border-4 border-red-500/50 animate-pulse" />
        )}
        
        {lastMessage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <p className={`text-xl font-bold px-6 py-3 rounded-lg bg-black/80 backdrop-blur-sm ${
              lastMessage.includes('💀') || lastMessage.includes('☠️') 
                ? 'text-red-400' 
                : lastMessage.includes('☕') || lastMessage.includes('💣') || lastMessage.includes('🛡️')
                  ? 'text-cyan-400'
                  : 'text-zinc-200'
            }`}>
              {lastMessage}
            </p>
          </div>
        )}
        
        {floatingScores.map(fs => (
          <div
            key={fs.id}
            className="absolute pointer-events-none z-[60] animate-float-up"
            style={{ left: `${fs.x}%`, top: `${fs.y}%` }}
          >
            <div className={`font-mono font-bold text-xl ${fs.combo >= 5 ? 'text-orange-400' : 'text-green-400'}`}>
              +{fs.points}
              {fs.combo >= 5 && <span className="text-sm ml-1">🔥</span>}
            </div>
          </div>
        ))}
        
        {powerUps.map(powerUp => (
          <button
            key={powerUp.id}
            onClick={() => collectPowerUp(powerUp)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 
              ${powerUpTypes[powerUp.type].color}
              rounded-full border-2 border-white cursor-pointer
              w-14 h-14 flex items-center justify-center
              animate-bounce shadow-lg hover:scale-110 transition-transform`}
            style={{
              left: `${powerUp.x}%`,
              top: `${powerUp.y}%`,
            }}
          >
            <span className="text-2xl">{powerUp.emoji}</span>
          </button>
        ))}
        
        {conflicts.map(conflict => (
          <button
            key={conflict.id}
            onClick={() => whackConflict(conflict.id)}
            disabled={conflict.isExploding || conflict.isSplitting}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 
              ${getConflictColor(conflict)} 
              rounded-xl border-2 cursor-pointer
              active:scale-90 transition-all duration-75
              flex flex-col items-center p-2 min-w-[80px]
              ${conflict.isSplitting ? 'pointer-events-none' : ''}`}
            style={{
              left: `${conflict.x}%`,
              top: `${conflict.y}%`,
            }}
          >
            <div 
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-black"
              style={{ backgroundColor: conflict.causedBy.color }}
            >
              {conflict.causedBy.emoji}
            </div>
            
            <span className="text-2xl">{conflict.type.emoji}</span>
            
            <span className="text-[10px] font-mono text-black font-bold truncate max-w-[70px]">
              {conflict.file}
            </span>
            
            {!conflict.isExploding && !conflict.isSplitting && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-xl overflow-hidden">
                <div 
                  className="h-full bg-black/50"
                  style={{ 
                    width: `${100 - (conflict.age / conflict.type.lifetime) * 100}%`,
                  }}
                />
              </div>
            )}
            
            {conflict.isSplitting && (
              <>
                <div className="absolute inset-0 animate-ping bg-red-500 rounded-xl opacity-50" />
                <span className="absolute -bottom-6 text-xs text-red-400 font-bold whitespace-nowrap">
                  +{conflict.type.spawnOnMiss} conflicts!
                </span>
              </>
            )}
          </button>
        ))}
        
        {conflicts.filter(c => !c.isExploding && !c.isSplitting).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-zinc-700 text-lg animate-pulse">Watching the repo...</p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes float-up {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -150%) scale(1.5); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
        @keyframes rainbow {
          0% { background-position: 0% 82%; }
          50% { background-position: 100% 19%; }
          100% { background-position: 0% 82%; }
        }
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-pulse-border {
          animation: pulse-border 1.5s ease-out infinite;
        }
      `}</style>
    </div>
  )
}
