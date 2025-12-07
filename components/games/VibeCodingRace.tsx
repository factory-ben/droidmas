'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ClippyHelper } from '../ClippyHelper'

interface GameEvent {
  id: number
  text: string
  delta: number
  emoji: string
  phase?: number
  isPowerUp?: boolean
  isNew?: boolean
}

interface PowerUp {
  id: string
  name: string
  emoji: string
  description: string
  effect: string
  drawback: string
}

const phase1Success: Omit<GameEvent, 'id'>[] = [
  { text: 'npm install complete', delta: 5, emoji: '📦' },
  { text: 'Vite is ready', delta: 6, emoji: '⚡' },
  { text: 'TypeScript configured', delta: 5, emoji: '📘' },
  { text: 'Git repo initialized', delta: 4, emoji: '🌱' },
  { text: 'ENV file found', delta: 5, emoji: '🔐' },
  { text: 'Node version correct', delta: 4, emoji: '✓' },
  { text: 'Dependencies resolved', delta: 6, emoji: '🔗' },
  { text: 'Dev server running', delta: 5, emoji: '🖥️' },
  { text: 'Hot reload working', delta: 4, emoji: '🔥' },
  { text: 'Tailwind compiling', delta: 5, emoji: '🎨' },
  { text: 'ESLint configured', delta: 4, emoji: '📏' },
  { text: 'Prettier formatting', delta: 3, emoji: '✨' },
  { text: 'Path aliases working', delta: 5, emoji: '🛤️' },
  { text: 'Monorepo structured', delta: 6, emoji: '📁' },
]

const phase1Fail: Omit<GameEvent, 'id'>[] = [
  { text: 'npm install... 47,293 packages', delta: -4, emoji: '📦' },
  { text: 'Wrong Node version', delta: -5, emoji: '🔴' },
  { text: 'Missing peer dependency', delta: -4, emoji: '⚠️' },
  { text: 'EACCES permission denied', delta: -6, emoji: '🚫' },
  { text: '.env.local not found', delta: -5, emoji: '🔍' },
  { text: 'Port 3000 already in use', delta: -4, emoji: '🔌' },
  { text: 'Lockfile conflict', delta: -5, emoji: '🔒' },
  { text: 'PostCSS config missing', delta: -4, emoji: '📋' },
  { text: 'node_modules corrupted', delta: -6, emoji: '💀' },
  { text: 'Package deprecated', delta: -4, emoji: '⚰️' },
  { text: 'Yarn vs npm conflict', delta: -5, emoji: '⚔️' },
  { text: 'tsconfig.json invalid', delta: -4, emoji: '❌' },
]

const phase2Success: Omit<GameEvent, 'id'>[] = [
  { text: 'Component renders!', delta: 6, emoji: '✅' },
  { text: 'Types inferred correctly', delta: 5, emoji: '📘' },
  { text: 'Tests passing', delta: 7, emoji: '🧪' },
  { text: 'Linter is happy', delta: 5, emoji: '✨' },
  { text: 'Clean compile', delta: 6, emoji: '🔨' },
  { text: 'State management working', delta: 5, emoji: '🔄' },
  { text: 'API call succeeded', delta: 6, emoji: '📡' },
  { text: 'CSS looks right', delta: 5, emoji: '💅' },
  { text: 'Hook works perfectly', delta: 6, emoji: '🎣' },
  { text: 'No console errors', delta: 5, emoji: '🧹' },
  { text: 'AI understood perfectly', delta: 7, emoji: '🧠' },
  { text: 'One-shot fix worked', delta: 8, emoji: '🎯' },
  { text: 'Animation smooth', delta: 5, emoji: '🎬' },
  { text: 'Form validation works', delta: 6, emoji: '📝' },
  { text: 'Error boundary caught it', delta: 5, emoji: '🛡️' },
]

const phase2Fail: Omit<GameEvent, 'id'>[] = [
  { text: 'undefined is not a function', delta: -6, emoji: '❌' },
  { text: 'Cannot read property of null', delta: -5, emoji: '💀' },
  { text: 'Infinite re-render detected', delta: -7, emoji: '♾️' },
  { text: "Type 'string' not assignable", delta: -5, emoji: '😤' },
  { text: 'Module not found', delta: -6, emoji: '🔍' },
  { text: 'Unexpected token', delta: -5, emoji: '❓' },
  { text: 'ESLint: 23 problems', delta: -4, emoji: '📏' },
  { text: 'That import is circular', delta: -6, emoji: '🔄' },
  { text: 'useEffect missing dependency', delta: -5, emoji: '⚠️' },
  { text: 'The AI hallucinated', delta: -7, emoji: '👻' },
  { text: 'It works locally...', delta: -6, emoji: '🤷' },
  { text: 'Hydration mismatch', delta: -5, emoji: '💧' },
  { text: 'Key prop missing', delta: -4, emoji: '🔑' },
  { text: 'Async/await forgotten', delta: -5, emoji: '⏳' },
]

const phase3Success: Omit<GameEvent, 'id'>[] = [
  { text: 'PR approved!', delta: 6, emoji: '✅' },
  { text: 'Code review passed', delta: 5, emoji: '👀' },
  { text: 'Stakeholder likes it', delta: 7, emoji: '👍' },
  { text: 'Edge case handled', delta: 6, emoji: '🛡️' },
  { text: 'Documentation updated', delta: 5, emoji: '📝' },
  { text: 'Tests cover edge cases', delta: 6, emoji: '🧪' },
  { text: 'Performance optimized', delta: 5, emoji: '🚀' },
  { text: 'Accessibility audit passed', delta: 6, emoji: '♿' },
  { text: 'Mobile responsive', delta: 5, emoji: '📱' },
  { text: 'No merge conflicts', delta: 7, emoji: '🙏' },
  { text: 'CI pipeline green', delta: 6, emoji: '🟢' },
  { text: 'Bundle size reduced', delta: 5, emoji: '📉' },
  { text: 'Lighthouse score: 100', delta: 7, emoji: '💯' },
]

const phase3Fail: Omit<GameEvent, 'id'>[] = [
  { text: "Stakeholder wants a 'quick call'", delta: -5, emoji: '📅' },
  { text: 'Can we make it pop more?', delta: -6, emoji: '🎨' },
  { text: 'Legal needs to review', delta: -7, emoji: '⚖️' },
  { text: 'Designer changed the Figma', delta: -5, emoji: '🖼️' },
  { text: 'Sprint planning time!', delta: -4, emoji: '📋' },
  { text: 'Scope creep detected', delta: -6, emoji: '🐙' },
  { text: 'PM changed requirements', delta: -7, emoji: '🔄' },
  { text: 'QA found edge cases', delta: -5, emoji: '🔍' },
  { text: 'Security review needed', delta: -6, emoji: '🔒' },
  { text: 'Merge conflict appeared', delta: -8, emoji: '⚔️' },
  { text: 'Someone force-pushed main', delta: -7, emoji: '💥' },
  { text: 'Flaky test blocking merge', delta: -5, emoji: '🎲' },
  { text: 'Tech debt meeting scheduled', delta: -4, emoji: '💳' },
]

const phase4Success: Omit<GameEvent, 'id'>[] = [
  { text: 'Build succeeded!', delta: 7, emoji: '🏗️' },
  { text: 'Deploy pipeline green', delta: 8, emoji: '🟢' },
  { text: 'Staging looks good', delta: 6, emoji: '✅' },
  { text: 'Load test passed', delta: 7, emoji: '📊' },
  { text: 'Feature flag enabled', delta: 6, emoji: '🚩' },
  { text: 'Monitoring configured', delta: 5, emoji: '📈' },
  { text: 'Rollback plan ready', delta: 6, emoji: '↩️' },
  { text: 'CEO gave thumbs up', delta: 8, emoji: '👔' },
  { text: 'Users love it!', delta: 9, emoji: '❤️' },
  { text: 'Zero errors in prod', delta: 8, emoji: '🎉' },
  { text: 'Canary deploy successful', delta: 7, emoji: '🐤' },
  { text: 'All regions healthy', delta: 6, emoji: '🌍' },
]

const phase4Fail: Omit<GameEvent, 'id'>[] = [
  { text: 'Build failed in CI', delta: -6, emoji: '🔴' },
  { text: 'Production database hiccup', delta: -7, emoji: '🗄️' },
  { text: 'CEO is watching the deploy', delta: -5, emoji: '👀' },
  { text: 'Rollback button glowing', delta: -8, emoji: '🔙' },
  { text: 'Users already found a bug', delta: -6, emoji: '🐛' },
  { text: 'Memory spike in prod', delta: -7, emoji: '📈' },
  { text: 'CDN cache poisoned', delta: -6, emoji: '☠️' },
  { text: 'SSL cert expired', delta: -8, emoji: '🔐' },
  { text: 'Rate limiter triggered', delta: -5, emoji: '🚫' },
  { text: 'Sentry going crazy', delta: -7, emoji: '🚨' },
  { text: 'PagerDuty alert fired', delta: -6, emoji: '📟' },
  { text: 'Customers tweeting issues', delta: -8, emoji: '🐦' },
]

const backgroundChaos: Omit<GameEvent, 'id'>[] = [
  { text: 'Slack notification', delta: -2, emoji: '💬' },
  { text: 'Email from management', delta: -3, emoji: '📧' },
  { text: 'Calendar reminder', delta: -2, emoji: '📅' },
  { text: 'Teammate needs help', delta: -3, emoji: '🤝' },
  { text: 'Coffee getting cold', delta: -2, emoji: '☕' },
  { text: 'Context switching...', delta: -3, emoji: '🔀' },
  { text: 'Browser tab crashed', delta: -4, emoji: '💥' },
  { text: 'WiFi stuttered', delta: -2, emoji: '📶' },
  { text: 'Standup in 5 minutes', delta: -3, emoji: '⏰' },
  { text: 'Zoom link not working', delta: -2, emoji: '🔗' },
]

const powerUps: PowerUp[] = [
  { id: 'mcp', name: 'Add MCP', emoji: '🔌', description: '+15%', effect: 'Boost', drawback: '' },
  { id: 'skills', name: 'Skills', emoji: '🎯', description: '+10%', effect: 'Buff', drawback: '' },
  { id: 'opensource', name: 'Open Source', emoji: '📚', description: '+12%', effect: 'Progress', drawback: '' },
  { id: 'coffee', name: 'Coffee', emoji: '☕', description: '+18%', effect: 'Delayed', drawback: '' },
  { id: 'touchgrass', name: 'Touch Grass', emoji: '🌱', description: '+20%', effect: 'Delayed', drawback: '' },
  { id: 'copilot', name: 'Copilot', emoji: '🤖', description: '+12%', effect: 'Auto', drawback: '' },
  { id: 'stackoverflow', name: 'Stack Overflow', emoji: '📋', description: '+8%', effect: 'Quick', drawback: '' },
]

const mcpConsequences: Omit<GameEvent, 'id'>[] = [
  { text: '🔌 MCP payback: Context window 80% full', delta: -8, emoji: '🗜️' },
  { text: '🔌 MCP payback: Response getting slow...', delta: -6, emoji: '🐌' },
  { text: '🔌 MCP payback: Context limit hit!', delta: -10, emoji: '⚠️' },
]

const opensourceConsequences: Omit<GameEvent, 'id'>[] = [
  { text: '📚 OSS payback: Vulnerability found!', delta: -12, emoji: '🔓' },
  { text: '📚 OSS payback: License incompatible', delta: -8, emoji: '⚖️' },
]

const copilotConsequences: Omit<GameEvent, 'id'>[] = [
  { text: '🤖 Copilot payback: Hallucinated badly', delta: -10, emoji: '👻' },
  { text: '🤖 Copilot payback: Deprecated API used', delta: -8, emoji: '📛' },
]

const stackoverflowConsequence: Omit<GameEvent, 'id'> = {
  text: '📋 Stack Overflow: Answer outdated', delta: -16, emoji: '📉',
}

const touchgrassConsequences: Omit<GameEvent, 'id'>[] = [
  { text: '🌱 Grass payback: Lost your flow state', delta: -12, emoji: '😵' },
  { text: '🌱 Grass payback: Forgot what you were doing', delta: -10, emoji: '🤔' },
]

const phases = [
  { name: 'Getting Started', threshold: 0, color: 'text-blue-400', bg: 'bg-blue-500' },
  { name: 'Actually Coding', threshold: 25, color: 'text-purple-400', bg: 'bg-purple-500' },
  { name: 'The Grind', threshold: 50, color: 'text-orange-400', bg: 'bg-orange-500' },
  { name: 'Ship It!', threshold: 75, color: 'text-green-400', bg: 'bg-green-500' },
]

const buttonTexts = ['Start building', 'Fix it', 'Try again', 'Please work', 'Come on...', 'Almost...', 'One more']

export default function VibeCodingRace() {
  const [progress, setProgress] = useState(0)
  const [peakProgress, setPeakProgress] = useState(0)
  const [events, setEvents] = useState<GameEvent[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing')
  const [clickHistory, setClickHistory] = useState<number[]>([])
  const [fixAttempts, setFixAttempts] = useState(0)
  const [successfulFixes, setSuccessfulFixes] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [highestPhase, setHighestPhase] = useState(0)
  const [panicLevel, setPanicLevel] = useState(0)
  const [stats, setStats] = useState({ bugs: 0, meetings: 0, deploys: 0, powerUps: 0 })
  const idCounter = useRef(0)
  const [showMilestone, setShowMilestone] = useState<string | null>(null)
  const [failStreak, setFailStreak] = useState(0)

  const [usedEvents, setUsedEvents] = useState<Set<string>>(new Set())
  const [activePowerUps, setActivePowerUps] = useState<string[]>([])
  const [usedPowerUps, setUsedPowerUps] = useState<Set<string>>(new Set())
  const [clickLocked, setClickLocked] = useState(false)
  const [lockTimeLeft, setLockTimeLeft] = useState(0)
  const [lockReason, setLockReason] = useState<'rate-limit' | 'coffee' | 'grass' | 'skills' | null>(null)
  const [gameElapsed, setGameElapsed] = useState(0)
  const [skillsBoost, setSkillsBoost] = useState(0)
  const [mcpPenaltyChance, setMcpPenaltyChance] = useState(0)
  const [autoProgress, setAutoProgress] = useState(false)
  const [copilotHallucinationChance, setCopilotHallucinationChance] = useState(0)
  const [stackoverflowNextHit, setStackoverflowNextHit] = useState(false)
  const [opensourcePenaltyChance, setOpensourcePenaltyChance] = useState(0)
  const [touchgrassPenaltyChance, setTouchgrassPenaltyChance] = useState(0)

  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const typedCharsRef = useRef('')
  const [usedCheatCode, setUsedCheatCode] = useState(false)
  const [discoveredEvents, setDiscoveredEvents] = useState<Set<string>>(new Set())
  const [timesRateLimited, setTimesRateLimited] = useState(0)
  const [peakPanic, setPeakPanic] = useState(0)
  const [powerUpsBackfired, setPowerUpsBackfired] = useState(0)

  const getPhase = useCallback((p: number) => {
    if (p >= 75) return 3
    if (p >= 50) return 2
    if (p >= 25) return 1
    return 0
  }, [])

  const getPhaseFloor = useCallback((phase: number) => phases[phase]?.threshold ?? 0, [])

  const getUniqueEvent = useCallback(
    (pool: Omit<GameEvent, 'id'>[]): Omit<GameEvent, 'id'> | null => {
      const available = pool.filter(e => !usedEvents.has(e.text))
      if (available.length === 0) return null
      return available[Math.floor(Math.random() * available.length)]
    },
    [usedEvents]
  )

  const addEvent = useCallback(
    (event: Omit<GameEvent, 'id'>, isPowerUp = false) => {
      const isNewDiscovery = !discoveredEvents.has(event.text)
      const newEvent: GameEvent = { ...event, id: idCounter.current++, isPowerUp, isNew: isNewDiscovery }
      setEvents(prev => [newEvent, ...prev].slice(0, 30))
      setUsedEvents(prev => new Set(prev).add(event.text))
      if (isNewDiscovery) {
        setDiscoveredEvents(prev => new Set(prev).add(event.text))
      }
      return newEvent
    },
    [discoveredEvents]
  )

  const activatePowerUp = useCallback(
    (powerUp: PowerUp) => {
      if (usedPowerUps.has(powerUp.id)) return
      if (clickLocked) return
      if (gameElapsed < 5) return

      const floor = getPhaseFloor(highestPhase)
      setUsedPowerUps(prev => new Set(prev).add(powerUp.id))
      setActivePowerUps(prev => [...prev, powerUp.id])
      setStats(s => ({ ...s, powerUps: s.powerUps + 1 }))

      switch (powerUp.id) {
        case 'mcp':
          setProgress(p => Math.min(100, p + 15))
          addEvent({ text: 'MCP connected! +15%', delta: 15, emoji: '🔌' }, true)
          setMcpPenaltyChance(0.4)
          break

        case 'skills':
          setProgress(p => Math.min(100, p + 10))
          addEvent({ text: 'Skills loaded! +10%', delta: 10, emoji: '🎯' }, true)
          setSkillsBoost(5)
          setTimeout(() => {
            setClickLocked(true)
            setLockTimeLeft(3)
            setLockReason('skills')
            addEvent({ text: '🎯 Skills cooldown...', delta: 0, emoji: '⏳' }, true)
          }, 8000)
          break

        case 'opensource':
          setProgress(p => Math.min(100, p + 12))
          addEvent({ text: 'npm install awesome-lib +12%', delta: 12, emoji: '📚' }, true)
          setOpensourcePenaltyChance(0.3)
          break

        case 'coffee':
          setClickLocked(true)
          setLockTimeLeft(5)
          setLockReason('coffee')
          addEvent({ text: 'Taking a coffee break...', delta: 0, emoji: '☕' }, true)
          setTimeout(() => {
            setClickLocked(false)
            setLockReason(null)
            setProgress(p => Math.min(100, p + 18))
            setPanicLevel(0)
            addEvent({ text: 'Refreshed! +18%', delta: 18, emoji: '☕' }, true)
          }, 5000)
          break

        case 'touchgrass':
          setClickLocked(true)
          setLockTimeLeft(6)
          setLockReason('grass')
          addEvent({ text: 'Going outside for a bit...', delta: 0, emoji: '🌱' }, true)
          setTimeout(() => {
            setClickLocked(false)
            setLockReason(null)
            setProgress(p => Math.min(100, p + 20))
            setPanicLevel(0)
            addEvent({ text: 'Fresh air! +20%', delta: 20, emoji: '🌱' }, true)
            setTouchgrassPenaltyChance(0.35)
          }, 6000)
          break

        case 'copilot':
          setAutoProgress(true)
          setCopilotHallucinationChance(0.35)
          addEvent({ text: 'AI Copilot activated', delta: 0, emoji: '🤖' }, true)
          let ticks = 0
          const copilotInterval = setInterval(() => {
            ticks++
            if (ticks >= 4) {
              clearInterval(copilotInterval)
              setAutoProgress(false)
              setCopilotHallucinationChance(0)
              addEvent({ text: 'Copilot session complete +12%', delta: 0, emoji: '🤖' }, true)
            } else {
              setProgress(p => Math.min(100, Math.max(floor, p + 3)))
              addEvent({ text: `Copilot completing... (${ticks}/3)`, delta: 3, emoji: '🤖' }, true)
            }
          }, 2000)
          break

        case 'stackoverflow':
          setProgress(p => Math.min(100, p + 8))
          addEvent({ text: 'Copied from accepted answer +8%', delta: 8, emoji: '📋' }, true)
          setStackoverflowNextHit(true)
          break
      }
    },
    [highestPhase, getPhaseFloor, addEvent, usedPowerUps, clickLocked, gameElapsed]
  )

  useEffect(() => {
    const newPhase = getPhase(progress)
    if (newPhase > currentPhase) {
      setCurrentPhase(newPhase)
      if (newPhase > highestPhase) {
        setHighestPhase(newPhase)
        setShowMilestone(phases[newPhase].name)
        setTimeout(() => setShowMilestone(null), 2000)
      }
    }
    if (progress > peakProgress) {
      setPeakProgress(progress)
    }
  }, [progress, currentPhase, highestPhase, peakProgress, getPhase])

  useEffect(() => {
    if (gameState !== 'playing') return
    const interval = setInterval(() => {
      setGameElapsed(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState])

  useEffect(() => {
    const interval = setInterval(() => {
      setClickHistory(prev => prev.filter(t => Date.now() - t < 3000))
      setPanicLevel(l => Math.max(0, l - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!clickLocked || lockTimeLeft <= 0) return
    const interval = setInterval(() => {
      setLockTimeLeft(t => {
        if (t <= 1) {
          setClickLocked(false)
          setLockReason(null)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [clickLocked, lockTimeLeft])

  useEffect(() => {
    if (gameState !== 'playing') return

    const interval = setInterval(() => {
      if (progress > 15 && Math.random() < 0.2) {
        const event = getUniqueEvent(backgroundChaos)
        if (event) {
          const floor = getPhaseFloor(highestPhase)
          addEvent(event)
          setProgress(p => Math.max(floor, p + event.delta))
        }
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [gameState, progress, highestPhase, getPhaseFloor, getUniqueEvent, addEvent])

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
    if (progress >= 100 && gameState === 'playing') {
      setGameState('ended')
    }
  }, [progress, gameState])

  const getPhaseEvents = useCallback((phase: number) => {
    switch (phase) {
      case 0:
        return { success: phase1Success, fail: phase1Fail }
      case 1:
        return { success: phase2Success, fail: phase2Fail }
      case 2:
        return { success: phase3Success, fail: phase3Fail }
      case 3:
        return { success: phase4Success, fail: phase4Fail }
      default:
        return { success: phase1Success, fail: phase1Fail }
    }
  }, [])

  const pushProgress = useCallback(() => {
    if (gameState !== 'playing') return
    if (clickLocked) return

    const now = Date.now()
    setClickHistory(prev => [...prev, now])
    setFixAttempts(f => f + 1)

    const recentClicks = clickHistory.filter(t => now - t < 2000).length
    const floor = getPhaseFloor(highestPhase)
    const shouldForcePositive = failStreak >= 4

    if (shouldForcePositive) {
      const phaseEvents = getPhaseEvents(currentPhase)
      const event = getUniqueEvent(phaseEvents.success) || phaseEvents.success[Math.floor(Math.random() * phaseEvents.success.length)]
      addEvent(event)
      setProgress(p => Math.min(100, p + event.delta))
      setSuccessfulFixes(s => s + 1)
      setFailStreak(0)
      setCombo(c => {
        const newCombo = c + 1
        if (newCombo > maxCombo) setMaxCombo(newCombo)
        return newCombo
      })
      if (event.text.toLowerCase().includes('deploy') || event.text.toLowerCase().includes('build')) {
        setStats(s => ({ ...s, deploys: s.deploys + 1 }))
      }
      return
    }

    if (mcpPenaltyChance > 0 && Math.random() < mcpPenaltyChance) {
      const event = mcpConsequences[Math.floor(Math.random() * mcpConsequences.length)]
      addEvent(event)
      setProgress(p => Math.max(floor, p + event.delta))
      setMcpPenaltyChance(c => c - 0.15)
      setCombo(0)
      setFailStreak(s => s + 1)
      setPowerUpsBackfired(p => p + 1)
      return
    }

    if (opensourcePenaltyChance > 0 && Math.random() < opensourcePenaltyChance) {
      const event = opensourceConsequences[Math.floor(Math.random() * opensourceConsequences.length)]
      addEvent(event)
      setProgress(p => Math.max(floor, p + event.delta))
      setOpensourcePenaltyChance(0)
      setCombo(0)
      setFailStreak(s => s + 1)
      setPowerUpsBackfired(p => p + 1)
      return
    }

    if (copilotHallucinationChance > 0 && Math.random() < copilotHallucinationChance) {
      const event = copilotConsequences[Math.floor(Math.random() * copilotConsequences.length)]
      addEvent(event)
      setProgress(p => Math.max(floor, p + event.delta))
      setCombo(0)
      setFailStreak(s => s + 1)
      setPowerUpsBackfired(p => p + 1)
      return
    }

    if (stackoverflowNextHit) {
      setStackoverflowNextHit(false)
      addEvent(stackoverflowConsequence)
      setProgress(p => Math.max(floor, p + stackoverflowConsequence.delta))
      setCombo(0)
      setFailStreak(s => s + 1)
      setPowerUpsBackfired(p => p + 1)
      return
    }

    if (touchgrassPenaltyChance > 0 && Math.random() < touchgrassPenaltyChance) {
      const event = touchgrassConsequences[Math.floor(Math.random() * touchgrassConsequences.length)]
      addEvent(event)
      setProgress(p => Math.max(floor, p + event.delta))
      setTouchgrassPenaltyChance(0)
      setCombo(0)
      setFailStreak(s => s + 1)
      setPowerUpsBackfired(p => p + 1)
      return
    }

    if (recentClicks >= 3) {
      setPanicLevel(l => l + 1)
      setPeakPanic(p => Math.max(p, panicLevel + 1))
      if (panicLevel >= 1) {
        setClickLocked(true)
        setLockTimeLeft(3)
        setLockReason('rate-limit')
        setTimesRateLimited(t => t + 1)
        setCombo(0)
        return
      }
    }

    let successRate = 0.65 - recentClicks * 0.08
    if (skillsBoost > 0) {
      successRate += 0.15
      setSkillsBoost(s => s - 1)
    }
    successRate = Math.max(0.35, Math.min(0.85, successRate))

    const phaseEvents = getPhaseEvents(currentPhase)

    if (Math.random() < successRate) {
      const event = getUniqueEvent(phaseEvents.success) || phaseEvents.success[Math.floor(Math.random() * phaseEvents.success.length)]
      addEvent(event)
      setProgress(p => Math.min(100, p + event.delta))
      setSuccessfulFixes(s => s + 1)
      setFailStreak(0)
      setCombo(c => {
        const newCombo = c + 1
        if (newCombo > maxCombo) setMaxCombo(newCombo)
        return newCombo
      })

      if (event.text.toLowerCase().includes('deploy') || event.text.toLowerCase().includes('build')) {
        setStats(s => ({ ...s, deploys: s.deploys + 1 }))
      }
    } else {
      const event = getUniqueEvent(phaseEvents.fail) || phaseEvents.fail[Math.floor(Math.random() * phaseEvents.fail.length)]
      addEvent(event)
      setProgress(p => Math.max(floor, p + event.delta))
      setCombo(0)
      setFailStreak(s => s + 1)

      if (event.text.toLowerCase().includes('bug') || event.emoji === '🐛') {
        setStats(s => ({ ...s, bugs: s.bugs + 1 }))
      }
      if (event.text.toLowerCase().includes('meeting') || event.text.toLowerCase().includes('call')) {
        setStats(s => ({ ...s, meetings: s.meetings + 1 }))
      }
    }
  }, [gameState, clickLocked, clickHistory, currentPhase, highestPhase, panicLevel, skillsBoost, mcpPenaltyChance, opensourcePenaltyChance, copilotHallucinationChance, stackoverflowNextHit, touchgrassPenaltyChance, failStreak, getPhaseEvents, getPhaseFloor, getUniqueEvent, addEvent, maxCombo])

  useEffect(() => {
    if (gameState !== 'playing') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        pushProgress()
      }
      const key = e.key.toLowerCase()
      if ('ship'.includes(key)) {
        const next = (typedCharsRef.current + key).slice(-10)
        typedCharsRef.current = next
        if (next.includes('ship') && !usedCheatCode) {
          setUsedCheatCode(true)
          setProgress(100)
          addEvent({ text: 'CHEAT CODE ACTIVATED!', delta: 100, emoji: '🎮' }, true)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, pushProgress, usedCheatCode, addEvent])

  const startGame = () => {
    setProgress(0)
    setPeakProgress(0)
    setEvents([])
    setTimeLeft(60)
    setClickHistory([])
    setFixAttempts(0)
    setSuccessfulFixes(0)
    setCurrentPhase(0)
    setHighestPhase(0)
    setPanicLevel(0)
    setStats({ bugs: 0, meetings: 0, deploys: 0, powerUps: 0 })
    setShowMilestone(null)
    setUsedEvents(new Set())
    setActivePowerUps([])
    setUsedPowerUps(new Set())
    setClickLocked(false)
    setLockTimeLeft(0)
    setLockReason(null)
    setGameElapsed(0)
    setSkillsBoost(0)
    setMcpPenaltyChance(0)
    setAutoProgress(false)
    setCopilotHallucinationChance(0)
    setStackoverflowNextHit(false)
    setOpensourcePenaltyChance(0)
    setTouchgrassPenaltyChance(0)
    setCombo(0)
    setMaxCombo(0)
    typedCharsRef.current = ''
    setUsedCheatCode(false)
    setTimesRateLimited(0)
    setPeakPanic(0)
    setPowerUpsBackfired(0)
    setFailStreak(0)
    setGameState('playing')
  }

  const getButtonText = () => {
    if (autoProgress) return 'AI working...'
    const index = Math.min(Math.floor(fixAttempts / 10), buttonTexts.length - 1)
    return buttonTexts[index]
  }

  if (gameState === 'ended') {
    const won = progress >= 100
    const peak = Math.round(peakProgress)
    const successRate = fixAttempts > 0 ? Math.round((successfulFixes / fixAttempts) * 100) : 0

    return (
      <div className="h-full bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-xl text-center space-y-6">
          <h1 className="text-5xl font-bold">
            {usedCheatCode ? '🎮 CHEATER!' : won ? '🚀 SHIPPED!' : phases[highestPhase]?.name ?? 'Started'}
          </h1>
          <p className={`text-xl ${phases[highestPhase]?.color ?? 'text-blue-400'}`}>
            {usedCheatCode ? 'Real devs ship. You found the shortcut!' : won ? 'You actually shipped it!' : `Made it to "${phases[highestPhase]?.name}"`}
          </p>

          <div className="bg-zinc-900 p-6 rounded-xl space-y-6">
            <div className="text-center">
              <p className="text-zinc-500 text-sm">Peak Progress</p>
              <p className={`text-6xl font-mono font-bold ${won ? 'text-green-400' : phases[highestPhase]?.color}`}>
                {peak}%
              </p>
            </div>

            <div className="relative">
              <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${won ? 'bg-green-500' : phases[highestPhase]?.bg} transition-all`} style={{ width: `${Math.round(progress)}%` }} />
              </div>
              <div className="absolute top-0 left-0 right-0 h-4 flex">
                {phases.slice(1).map((p, i) => (
                  <div key={i} className="absolute top-0 bottom-0 w-0.5 bg-zinc-600" style={{ left: `${p.threshold}%` }} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-center">
              <div>
                <p className="text-zinc-500 text-xs">Fix Attempts</p>
                <p className="text-2xl font-mono">{fixAttempts}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Success Rate</p>
                <p className="text-2xl font-mono">{successRate}%</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs mb-3 uppercase tracking-wider">The Journey</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-zinc-800 rounded-lg p-2">
                  <p className="text-xl">🐛</p>
                  <p className="text-sm font-mono">{stats.bugs}</p>
                  <p className="text-xs text-zinc-500">Bugs</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-2">
                  <p className="text-xl">📅</p>
                  <p className="text-sm font-mono">{stats.meetings}</p>
                  <p className="text-xs text-zinc-500">Interrupts</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-2">
                  <p className="text-xl">🚀</p>
                  <p className="text-sm font-mono">{stats.deploys}</p>
                  <p className="text-xs text-zinc-500">Deploys</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-2">
                  <p className="text-xl">⚡</p>
                  <p className="text-sm font-mono">{stats.powerUps}</p>
                  <p className="text-xs text-zinc-500">Boosts</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs mb-3 uppercase tracking-wider">The Stats</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-zinc-800 rounded-lg p-2">
                  <p className="text-xl">🔥</p>
                  <p className="text-sm font-mono">{maxCombo}</p>
                  <p className="text-xs text-zinc-500">Best Combo</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-2">
                  <p className="text-xl">😰</p>
                  <p className="text-sm font-mono">{peakPanic}</p>
                  <p className="text-xs text-zinc-500">Peak Panic</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-2">
                  <p className="text-xl">🚫</p>
                  <p className="text-sm font-mono">{timesRateLimited}</p>
                  <p className="text-xs text-zinc-500">Rate Limited</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-2">
                  <p className="text-xl">💥</p>
                  <p className="text-sm font-mono">{powerUpsBackfired}</p>
                  <p className="text-xs text-zinc-500">Backfired</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={startGame} className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors">
            TRY AGAIN
          </button>
        </div>
      </div>
    )
  }

  const phase = phases[currentPhase]
  const floor = getPhaseFloor(highestPhase)

  return (
    <div className="h-screen bg-black text-white flex flex-col relative">
      <ClippyHelper day={5} speechText="Click to fix bugs and make progress. Use power-ups wisely - every boost has a cost. 60 seconds to ship. How far can you get?" hideOnMobile />

      {showMilestone && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className={`${phase?.bg} px-8 py-4 rounded-2xl animate-bounce shadow-2xl`}>
            <p className="text-2xl font-bold">🎉 {showMilestone}!</p>
          </div>
        </div>
      )}

      <div className="bg-black/90 backdrop-blur border-b border-zinc-800 p-4 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Phase {currentPhase + 1}</p>
              <p className={`text-lg font-bold ${phase?.color}`}>{phase?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              {activePowerUps.length > 0 && (
                <div className="flex gap-1">
                  {activePowerUps.slice(-3).map((id, i) => {
                    const pu = powerUps.find(p => p.id === id)
                    return (
                      <span key={i} className="text-lg opacity-60">
                        {pu?.emoji}
                      </span>
                    )
                  })}
                </div>
              )}
              <div className={`text-4xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
                {timeLeft}s
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <span className={`text-4xl font-mono font-bold ${phase?.color}`}>{Math.round(progress)}%</span>
            <div className="flex-1">
              <div
                className={`h-6 bg-zinc-800 rounded-full overflow-hidden relative transition-shadow duration-300 ${
                  combo >= 3 ? 'shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''
                } ${combo >= 5 ? 'shadow-[0_0_25px_rgba(249,115,22,0.5)]' : ''} ${combo >= 10 ? 'shadow-[0_0_30px_rgba(234,179,8,0.6)]' : ''}`}
              >
                {floor > 0 && <div className="absolute top-0 bottom-0 bg-zinc-700/50" style={{ width: `${floor}%` }} />}
                <div
                  className={`h-full ${phase?.bg} transition-all duration-300 relative z-10 ${combo >= 3 ? 'animate-pulse' : ''}`}
                  style={{ width: `${progress}%` }}
                />
                {phases.slice(1).map((p, i) => (
                  <div
                    key={i}
                    className={`absolute top-0 bottom-0 w-0.5 ${progress >= p.threshold ? 'bg-white/30' : 'bg-zinc-600'}`}
                    style={{ left: `${p.threshold}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs text-zinc-500">
            <span>{fixAttempts} fixes</span>
            {combo >= 2 && (
              <span
                className={`font-bold ${
                  combo >= 10 ? 'text-yellow-400 animate-pulse' : combo >= 5 ? 'text-orange-400' : combo >= 3 ? 'text-green-400' : 'text-zinc-400'
                }`}
              >
                {combo >= 10 ? `🔥 x${combo} UNSTOPPABLE` : combo >= 5 ? `🔥 x${combo} FLOW STATE` : combo >= 3 ? `x${combo} 🔥` : `x${combo}`}
              </span>
            )}
            {skillsBoost > 0 && <span className="text-green-400">🎯 Skills: {skillsBoost}</span>}
            {autoProgress && <span className="text-blue-400">🤖 Copilot active</span>}
            <span>{successfulFixes} successful</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-hidden">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 h-full flex flex-col">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider flex justify-between">
            <span>Event Log</span>
            {clickLocked && lockReason === 'rate-limit' && <span className="text-red-400">🚫 Rate limited</span>}
            {clickLocked && lockReason === 'coffee' && <span className="text-amber-400">☕ Taking a break...</span>}
            {clickLocked && lockReason === 'grass' && <span className="text-green-400">🌱 Outside...</span>}
            {clickLocked && lockReason === 'skills' && <span className="text-purple-400">🎯 Cooldown...</span>}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <div className="text-zinc-600 text-center py-12">
                Click to start coding...
                <br />
                <span className="text-xs text-zinc-700">Find your rhythm</span>
              </div>
            ) : (
              events.map(event => (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    event.isPowerUp
                      ? 'bg-purple-900/30 border border-purple-500/30'
                      : event.delta > 0
                        ? 'bg-green-900/20'
                        : event.delta < 0
                          ? 'bg-red-900/20'
                          : 'bg-zinc-800/50'
                  }`}
                >
                  <span className="text-2xl">{event.emoji}</span>
                  <span
                    className={`flex-1 ${
                      event.isPowerUp ? 'text-purple-300' : event.delta > 0 ? 'text-green-400' : event.delta < 0 ? 'text-red-400' : 'text-zinc-400'
                    }`}
                  >
                    {event.text}
                    {event.isNew && <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">NEW</span>}
                  </span>
                  {event.delta !== 0 && (
                    <span className={`font-mono font-bold text-sm ${event.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {event.delta > 0 ? '+' : ''}
                      {event.delta}%
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-black border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="px-4 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {powerUps.map(powerUp => {
                const isUsed = usedPowerUps.has(powerUp.id)
                const isLocked = gameElapsed < 5 || clickLocked
                const canUse = !isUsed && !isLocked

                return (
                  <button
                    key={powerUp.id}
                    onClick={() => canUse && activatePowerUp(powerUp)}
                    disabled={!canUse}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      isUsed
                        ? 'bg-zinc-900/50 border-zinc-800 opacity-40 cursor-not-allowed'
                        : isLocked
                          ? 'bg-zinc-900/50 border-zinc-700 opacity-60 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/50 hover:border-purple-400 hover:scale-105 cursor-pointer'
                    }`}
                  >
                    <span className="text-xl">{powerUp.emoji}</span>
                    <div className="text-left">
                      <p
                        className={`text-xs font-medium ${
                          isUsed ? 'text-zinc-600 line-through' : isLocked ? 'text-zinc-500' : 'text-purple-300'
                        }`}
                      >
                        {powerUp.name}
                      </p>
                      <p className={`text-xs ${isUsed ? 'text-zinc-700' : isLocked ? 'text-zinc-600' : 'text-green-400'}`}>{powerUp.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            {gameElapsed < 5 && <p className="text-xs text-zinc-600 text-center">Power-ups unlock in {5 - gameElapsed}s</p>}
          </div>

          <div className="p-4 pt-2">
            {clickLocked ? (
              <div className="w-full py-6 bg-zinc-900 border border-zinc-700 rounded-xl font-bold text-2xl text-center text-zinc-500">
                {lockTimeLeft > 0 ? `⏳ ${lockTimeLeft}s` : '⏳ Wait...'}
              </div>
            ) : (
              <button
                onClick={pushProgress}
                disabled={clickLocked}
                className={`w-full py-6 ${skillsBoost > 0 ? 'bg-purple-600 hover:bg-purple-500' : 'bg-zinc-800 hover:bg-zinc-700'} rounded-xl font-bold text-2xl active:scale-[0.98] transition-all`}
              >
                {getButtonText()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
