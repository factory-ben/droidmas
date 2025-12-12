'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClippyHelper } from '@/components/ClippyHelper'

const prompts = [
  "Fix the bug. Do not add a new dependency. Yes, it's Friday at 4:59pm.",
  "Write a PR title for 1,842 changed lines: 'tiny refactor, no functional changes'.",
  "Explain why 'works on my machine' is not an incident response plan.",
  "Add TypeScript types. No 'any'. No 'as unknown as'. No excuses.",
  "Refactor this function without creating a utils folder called 'final2'.",
  "Debug this: passes locally, fails in CI, and nobody touched it. Sure.",
  "Write unit tests for the thing you just copy-pasted from Stack Overflow.",
  "Rename 'final_final_v3.ts' to something respectable. Commit with shame.",
  "Write a migration. Also write the rollback. Also don't break prod. Thanks.",
  "Review this PR: 'quick change' (submitted 6 minutes before the demo).",
  "Update AGENTS.md so the AI stops adding libraries. It won't listen anyway.",
  "Summarize the outage: 'we upgraded Node and everything exploded'.",
]

const ROUND_SECONDS = 45
const ROUND_MS = ROUND_SECONDS * 1000

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const s = totalSeconds % 60
  const m = Math.floor(totalSeconds / 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDurationMs(ms: number) {
  const seconds = ms / 1000
  return `${seconds.toFixed(2)}s`
}

function pickNextPromptIndex(avoid?: number) {
  if (prompts.length <= 1) return 0
  let idx = Math.floor(Math.random() * prompts.length)
  if (typeof avoid === 'number' && idx === avoid) idx = (idx + 1) % prompts.length
  return idx
}

export default function TypingGame() {
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [now, setNow] = useState<number>(Date.now())

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [promptIndex, setPromptIndex] = useState(0)
  const [completedPrompts, setCompletedPrompts] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [errors, setErrors] = useState(0)
  const [currentPromptMistakes, setCurrentPromptMistakes] = useState(0)

  const startGame = () => {
    const nextIndex = pickNextPromptIndex()
    setCurrentPrompt(prompts[nextIndex])
    setPromptIndex(nextIndex)
    setUserInput('')

    const t = Date.now()
    setNow(t)
    setStartTime(t)
    setEndTime(null)

    setCompletedPrompts(0)
    setTotalChars(0)
    setErrors(0)
    setCurrentPromptMistakes(0)
    setGameState('playing')
  }

  // Initialize a prompt on mount (but don't start the timer yet)
  useEffect(() => {
    const randomIndex = pickNextPromptIndex()
    setCurrentPrompt(prompts[randomIndex])
    setPromptIndex(randomIndex)
  }, [])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || !startTime) return

    setNow(Date.now())
    const interval = setInterval(() => {
      const t = Date.now()
      const elapsed = t - startTime
      if (elapsed >= ROUND_MS) {
        const end = startTime + ROUND_MS
        setNow(end)
        setEndTime(end)
        setGameState('finished')
        clearInterval(interval)
        return
      }
      setNow(t)
    }, 50)

    return () => clearInterval(interval)
  }, [gameState, startTime])

  const timeLeftMs = useMemo(() => {
    if (gameState !== 'playing' || !startTime) return ROUND_MS
    return Math.max(0, ROUND_MS - (now - startTime))
  }, [gameState, now, startTime])

  const handleInputChange = (value: string) => {
    if (gameState !== 'playing') return

    // Track total errors across prompts (delta-based so backspacing doesn't inflate score)
    let mismatches = 0
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentPrompt[i]) mismatches++
    }
    const delta = mismatches - currentPromptMistakes
    if (delta > 0) setErrors(e => e + delta)
    setCurrentPromptMistakes(mismatches)

    setUserInput(value)

    // Check if prompt completed
    if (value === currentPrompt) {
      setCompletedPrompts(c => c + 1)
      setTotalChars(t => t + currentPrompt.length)
      setCurrentPromptMistakes(0)

      const nextIndex = pickNextPromptIndex(promptIndex)
      setCurrentPrompt(prompts[nextIndex])
      setPromptIndex(nextIndex)
      setUserInput('')
    }
  }

  const getCharClass = (index: number) => {
    if (index >= userInput.length) return 'text-zinc-600'
    if (userInput[index] === currentPrompt[index]) return 'text-green-400'
    return 'text-red-500 bg-red-900/30'
  }

  const calculateWPM = () => {
    if (!startTime) return 0
    const minutes = ROUND_MS / 60000
    const words = totalChars / 5
    return Math.round(words / minutes)
  }

  const calculateTokensPerMinute = () => {
    // Rough estimate: 4 chars per token
    return Math.round(calculateWPM() * 5 / 4)
  }

  const getElapsedMs = () => {
    if (!startTime) return 0
    if (!endTime) return 0
    return Math.max(0, endTime - startTime)
  }

  const accuracy = useMemo(() => {
    if (totalChars <= 0) return 0
    const raw = ((totalChars - errors) / totalChars) * 100
    return Math.max(0, Math.min(100, Math.round(raw)))
  }, [errors, totalChars])

  if (gameState === 'ready') {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-8">
        <div className="max-w-xl w-full text-center space-y-6">
          <h1 className="text-4xl font-bold">Prompt Sprint</h1>
          <p className="text-zinc-500">
            You have <span className="text-white font-bold">{ROUND_SECONDS}s</span>. Type as many prompts as you can.
            Exact match or it doesn&apos;t count.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left">
            <p className="text-xs text-zinc-500 mb-2">Example prompt</p>
            <p className="font-mono text-sm text-zinc-200">{currentPrompt}</p>
          </div>

          <button onClick={startGame} className="px-8 py-3 bg-white text-black font-bold rounded-lg">
            START {ROUND_SECONDS}s RUN
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'finished') {
    const wpm = calculateWPM()
    const tpm = calculateTokensPerMinute()
    const timeMs = getElapsedMs()

    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-8">
        <div className="max-w-xl text-center space-y-8">
          <h1 className="text-4xl font-bold">
            {completedPrompts >= 10 ? '🚀 Prompt Goblin!' :
              completedPrompts >= 6 ? '⚡ Shipping Machine' :
                completedPrompts >= 3 ? '👍 Respectable' :
                  '🐢 Warming Up'}
          </h1>

          <div className="bg-zinc-900 p-8 rounded-xl space-y-6">
            <div>
              <p className="text-zinc-500 text-sm">Prompts Completed</p>
              <p className="text-6xl font-mono font-bold text-green-400">{completedPrompts}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-zinc-500 text-sm">Words/Min</p>
                <p className="text-5xl font-mono font-bold text-blue-400">{wpm}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Tokens/Min</p>
                <p className="text-5xl font-mono font-bold text-purple-400">{tpm}</p>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <p className="text-zinc-500 text-sm">Accuracy</p>
              <p className="text-4xl font-mono font-bold">{accuracy}%</p>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <p className="text-zinc-500 text-sm">Time</p>
              <p className="text-4xl font-mono font-bold text-emerald-400">{formatDurationMs(timeMs)}</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 text-sm text-zinc-400">
              <p>At {tpm} tokens/min, a 200k context session would take you:</p>
              <p className="text-2xl font-mono font-bold text-white mt-2">
                {Math.round(200000 / tpm)} minutes
              </p>
              <p className="text-zinc-500">({Math.round(200000 / tpm / 60)} hours of typing)</p>
            </div>
          </div>

          <p className="text-zinc-600 italic">
            {completedPrompts >= 10
              ? '"Congratulations. You are now the human keyboard."'
              : completedPrompts >= 6
                ? '"Ship it. Then immediately hotfix it."'
                : '"The prompts will still be here when you are."'}
          </p>

          <button onClick={startGame} className="px-8 py-3 bg-white text-black font-bold rounded-lg">
            RUN IT BACK
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black text-white flex flex-col">
      <ClippyHelper day={9} speechText={`You have ${ROUND_SECONDS} seconds. Type as many prompts as you can. No excuses.`} hideOnMobile />

      <div className="bg-black/90 border-b border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Prompt Sprint</h1>
          <div className="flex gap-6">
            <div className="text-center">
              <p className={`text-3xl font-mono font-bold ${timeLeftMs <= 10_000 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCountdown(timeLeftMs)}</p>
              <p className="text-xs text-zinc-500">Time Left</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-mono font-bold text-green-400">{completedPrompts}</p>
              <p className="text-xs text-zinc-500">Prompts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-mono font-bold">{userInput.length}/{currentPrompt.length}</p>
              <p className="text-xs text-zinc-500">Chars</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${timeLeftMs <= 10_000 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${(timeLeftMs / ROUND_MS) * 100}%` }}
            />
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 font-mono text-lg leading-relaxed">
            {currentPrompt.split('').map((char, i) => (
              <span key={i} className={getCharClass(i)}>
                {char}
              </span>
            ))}
          </div>

          <textarea
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-lg font-mono focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-factory-orange/60 focus-visible:border-factory-orange/60 resize-none"
            rows={3}
            placeholder="Start typing..."
            autoFocus
          />

          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(userInput.length / currentPrompt.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
