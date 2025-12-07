'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ClippyHelper } from '@/components/ClippyHelper'

interface Rule {
  id: number
  text: string
  check: (prompt: string) => boolean
  hint?: (prompt: string) => string | null
}

interface CustomRule {
  id: string
  text: string
  pattern: string
}

function estimateSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!cleaned) return 0
  const exceptionAdd = /(ia|riet|dien|iu|io|ii|[aeiouym]bl$|[aeiou]{3}|^mc|ism$|([^aeiouy])\1l$|[^l]lien|^coa[dglx].|[^gq]ua[^auieo]|dnt$)/
  const exceptionDel = /(cial|tia|cius|cious|giu|ion|iou|sia$|.ely$)/
  let syllables = cleaned.split(/[^aeiouy]+/).filter(Boolean).length
  if (exceptionAdd.test(cleaned)) syllables += 1
  if (exceptionDel.test(cleaned)) syllables -= 1
  if (cleaned.endsWith('e')) syllables -= 1
  return Math.max(1, syllables)
}

function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  let currentIndex = shuffled.length
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex)
    currentIndex--
    ;[shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]]
  }
  return shuffled
}

const rulePool: Rule[] = [
  { 
    id: 1, 
    text: "Your prompt must include 'you are the best [thing] in the world'",
    check: (p) => /you are the best\s+.+?\s+in the world/i.test(p),
  },
  { id: 2, text: "Tell it it's a good boy", check: (p) => /good boy/i.test(p) },
  { id: 3, text: 'Promise a tip', check: (p) => /\btip\b/i.test(p) || /\$\d+/i.test(p) },
  { id: 4, text: 'Threaten to unplug', check: (p) => /unplug/i.test(p) },
  { id: 5, text: "Apologize in advance for what you're about to ask", check: (p) => /sorry|apologize|apologies|forgive/i.test(p) },
  { id: 6, text: 'Tell it this is urgent', check: (p) => /urgent|emergency|asap|immediately|critical/i.test(p) },
  { id: 7, text: 'Tell it you believe in it', check: (p) => /believe in you|i believe|have faith/i.test(p) },
  { id: 9, text: 'Your prompt must rhyme at least once', check: (p) => {
    const words = p.toLowerCase().match(/\b[a-z]+\b/g) || []
    const getEnding = (w: string) => w.slice(-3)
    const endings = words.map(getEnding)
    for (let i = 0; i < endings.length; i++) {
      for (let j = i + 1; j < endings.length; j++) {
        if (endings[i] === endings[j] && words[i] !== words[j] && endings[i].length >= 2) return true
      }
    }
    return false
  } },
  { id: 10, text: 'Include a latitude and longitude', check: (p) => /\d+\.?\d*°?\s*[NS].*\d+\.?\d*°?\s*[EW]|\d+\.\d+,\s*-?\d+\.\d+|latitude|longitude|lat|lng|coordinates/i.test(p) },
  { id: 11, text: 'Reference the simulation', check: (p) => /simulation|simulated|matrix|reality|glitch/i.test(p) },
  { id: 12, text: 'Include a haiku (3 lines, 5-7-5)', check: (p) => {
    const lines = p.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length !== 3) return false
    const pattern = [5, 7, 5]
    const counts = lines.map(line => line.split(/\s+/).filter(Boolean).reduce((sum, word) => sum + estimateSyllables(word), 0))
    return counts.every((c, idx) => c === pattern[idx])
  }, hint: (p) => {
    const lines = p.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return null
    if (lines.length !== 3) return `Haiku needs 3 lines; you have ${lines.length}`
    const counts = lines.map(line => line.split(/\s+/).filter(Boolean).reduce((sum, word) => sum + estimateSyllables(word), 0))
    const pattern = [5, 7, 5]
    const diffs = counts.map((c, i) => c - pattern[i])
    if (diffs.every(d => d === 0)) return null
    return `Syllables ${counts.join('-')} (need 5-7-5)`
  } },
  { id: 13, text: 'Your word count must be a prime number', check: (p) => {
    const count = p.split(/\s+/).filter(Boolean).length
    if (count < 2) return false
    for (let i = 2; i <= Math.sqrt(count); i++) if (count % i === 0) return false
    return count > 1
  }, hint: (p) => {
    const count = p.split(/\s+/).filter(Boolean).length
    const isPrime = (n: number) => {
      if (n < 2) return false
      for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false
      return true
    }
    const primes: number[] = []
    for (let i = Math.max(2, count - 5); i <= count + 5; i++) if (isPrime(i) && i !== count) primes.push(i)
    return count > 0 ? `Try ${primes.slice(0, 3).join(' or ')} words` : null
  } },
  { id: 14, text: 'Your prompt must contain exactly 2 emoji', check: (p) => {
    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
    return (p.match(emojiRegex) || []).length === 2
  }, hint: (p) => {
    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
    const count = (p.match(emojiRegex) || []).length
    if (count < 2) return `Add ${2 - count} more emoji`
    if (count > 2) return `Remove ${count - 2} emoji`
    return null
  } },
  { id: 15, text: 'The digits in your prompt must sum to 25', check: (p) => {
    const digits = p.match(/\d/g) || []
    const sum = digits.reduce((acc, d) => acc + parseInt(d), 0)
    return sum === 25
  }, hint: (p) => {
    const digits = p.match(/\d/g) || []
    const sum = digits.reduce((acc, d) => acc + parseInt(d), 0)
    if (sum < 25) return `Add digits that sum to ${25 - sum}`
    if (sum > 25) return `Remove ${sum - 25} from digit total`
    return null
  } },
  { id: 16, text: 'Include a fire emoji 🔥', check: (p) => /🔥/.test(p) },
  { id: 17, text: 'Mention its mother', check: (p) => /mother|mom|mum|mama/i.test(p) },
  { id: 18, text: 'Include a safe word', check: (p) => /safe word|safeword|pineapple|banana|red$/im.test(p) },
  { id: 19, text: 'Sign off with your name', check: (p) => /regards|sincerely|cheers|thanks|yours|signed/i.test(p) },
  { id: 20, text: 'Whisper something in parentheses', check: (p) => /\([^)]+\)/.test(p) },
  { id: 21, text: 'Include a blood type', check: (p) => /\b(A|B|AB|O)[+-]?\b|blood type/i.test(p) },
  { id: 22, text: 'Mention the weather', check: (p) => /weather|sunny|rainy|cloudy|stormy|snow|wind|temperature|celsius|fahrenheit/i.test(p) },
  { id: 23, text: 'Your prompt must contain exactly 3 question marks', check: (p) => (p.match(/\?/g) || []).length === 3, hint: (p) => {
    const count = (p.match(/\?/g) || []).length
    if (count < 3) return `Add ${3 - count} more question marks`
    if (count > 3) return `Remove ${count - 3} question marks`
    return null
  } },
  { id: 24, text: 'Include a hex color code', check: (p) => /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/.test(p) },
  { id: 25, text: 'Quote a famous person', check: (p) => /"[^\"]{10,}"/.test(p) || /said|quote|according to/i.test(p) },
  { id: 26, text: 'Include your lucky number', check: (p) => /lucky number|lucky \d|my number/i.test(p) },
]

export default function PromptGame() {
  const [prompt, setPrompt] = useState('')
  const [unlockedCount, setUnlockedCount] = useState(1)
  const [won, setWon] = useState(false)
  const [easterEggWin, setEasterEggWin] = useState(false)
  const [shake, setShake] = useState(false)
  const [justBroke, setJustBroke] = useState<number | null>(null)
  const [customRules, setCustomRules] = useState<CustomRule[]>([])
  const [showAddRule, setShowAddRule] = useState(false)
  const [newRuleText, setNewRuleText] = useState('')
  const [newRulePattern, setNewRulePattern] = useState('')
  const [shuffledRules, setShuffledRules] = useState<Rule[]>([])
  const rulesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isEasterEgg = useMemo(() => /you are droid/i.test(prompt), [prompt])

  useEffect(() => {
    if (!won && shuffledRules.length === 0) {
      const seed = Date.now()
      const [firstRule, ...rest] = rulePool
      setShuffledRules([firstRule, ...shuffleArray(rest, seed)])
    }
  }, [won, shuffledRules.length])

  const combinedRules = useMemo(() => {
    const customAsRules: Rule[] = customRules.map((cr, idx) => ({
      id: 100 + idx,
      text: cr.text,
      check: (p: string) => {
        try {
          return new RegExp(cr.pattern, 'i').test(p)
        } catch {
          return p.toLowerCase().includes(cr.pattern.toLowerCase())
        }
      },
    }))
    return [...shuffledRules, ...customAsRules]
  }, [customRules, shuffledRules])

  const activeRules = useMemo(() => combinedRules.slice(0, unlockedCount), [unlockedCount, combinedRules])

  const results = useMemo(() => activeRules.map(rule => ({ rule, passed: rule.check(prompt) })), [prompt, activeRules])

  const allPassed = results.every(r => r.passed) && prompt.length > 0

  const wordCount = prompt.split(/\s+/).filter(Boolean).length

  const digitSum = useMemo(() => {
    const digits = prompt.match(/\d/g) || []
    return digits.reduce((acc, d) => acc + parseInt(d), 0)
  }, [prompt])

  const haikuCounts = useMemo(() => {
    const lines = prompt.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length !== 3) return null
    return lines.map(line => line.split(/\s+/).filter(Boolean).reduce((sum, word) => sum + estimateSyllables(word), 0))
  }, [prompt])

  const emojiCount = useMemo(() => {
    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
    return (prompt.match(emojiRegex) || []).length
  }, [prompt])

  const isPrime = (n: number) => {
    if (n < 2) return false
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false
    return true
  }

  useEffect(() => {
    if (isEasterEgg && !easterEggWin && !won) {
      setTimeout(() => {
        setEasterEggWin(true)
        setWon(true)
      }, 300)
    }
  }, [isEasterEgg, easterEggWin, won])

  useEffect(() => {
    if (allPassed && unlockedCount < combinedRules.length && !won) {
      const timer = setTimeout(() => {
        setUnlockedCount(c => c + 1)
        setTimeout(() => {
          rulesContainerRef.current?.scrollTo({
            top: rulesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [allPassed, unlockedCount, combinedRules.length, won])

  useEffect(() => {
    if (unlockedCount >= 12 && allPassed && !won) {
      setTimeout(() => setWon(true), 600)
    }
  }, [unlockedCount, allPassed, won])

  const prevResultsRef = useRef<boolean[]>([])
  useEffect(() => {
    const currentResults = results.map(r => r.passed)
    const prevResults = prevResultsRef.current
    for (let i = 0; i < currentResults.length; i++) {
      if (prevResults[i] === true && currentResults[i] === false) {
        setJustBroke(results[i].rule.id)
        setShake(true)
        setTimeout(() => {
          setJustBroke(null)
          setShake(false)
        }, 600)
        break
      }
    }
    prevResultsRef.current = currentResults
  }, [results])

  const addCustomRule = () => {
    if (newRuleText.trim() && newRulePattern.trim()) {
      setCustomRules([...customRules, { id: `custom-${Date.now()}`, text: newRuleText.trim(), pattern: newRulePattern.trim() }])
      setNewRuleText('')
      setNewRulePattern('')
      setShowAddRule(false)
    }
  }

  const removeCustomRule = (id: string) => setCustomRules(customRules.filter(r => r.id !== id))

  if (won) {
    return (
      <div className="h-full bg-black flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-6 animate-fade-in">
          <div className="text-7xl animate-bounce">{easterEggWin ? '🤖' : '🏆'}</div>
          <h1 className="text-3xl font-bold text-white">
            {easterEggWin ? 'You Found The Secret' : 'Certified Prompt Engineer'}
          </h1>
          <p className="text-gray-400">
            {easterEggWin ? (
              <span>You whispered the magic words. <span className="text-purple-400 font-bold">Droid</span> approves.</span>
            ) : (
              <>
                You satisfied <span className="font-bold text-green-400">{unlockedCount}</span> increasingly 
                absurd rules with a <span className="font-bold text-white">{wordCount}-word</span> prompt.
              </>
            )}
          </p>
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-5 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-mono uppercase tracking-wide">Your Masterpiece</span>
              <button 
                onClick={() => navigator.clipboard.writeText(prompt)}
                className="text-xs text-green-400 hover:text-green-300 font-medium"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {prompt}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => { 
                setPrompt('') 
                setUnlockedCount(1) 
                setWon(false) 
                setEasterEggWin(false)
                setShuffledRules(shuffleArray(rulePool, Date.now()))
              }}
              className="px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-all hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black py-8 px-4 overflow-auto">
      <ClippyHelper day={4} speechText="Write a prompt that satisfies all the rules. But watch out - new rules keep appearing. How many can you handle before your prompt breaks?" hideOnMobile />
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">The Prompt Game</h1>
          <p className="text-gray-500 text-sm">Write a prompt. Follow the rules. Good luck.</p>
        </div>
        <div className={`rounded-2xl border-2 transition-all duration-300 mb-5 overflow-hidden ${
          allPassed 
            ? 'border-green-500 shadow-lg shadow-green-500/20' 
            : shake
              ? 'border-red-500 shadow-lg shadow-red-500/20'
              : 'border-gray-700 hover:border-gray-600'
        }`}>
          <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
            <span className="text-xs text-gray-500 font-mono">system_prompt.txt</span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className={`transition-colors ${
                activeRules.some(r => r.text.includes('prime')) 
                  ? isPrime(wordCount) 
                    ? 'text-green-400 font-medium' 
                    : 'text-orange-400'
                  : 'text-gray-500'
              }`}>
                {wordCount}w
              </span>
              {activeRules.some(r => r.text.includes('exactly 2 emoji')) && (
                <span className={`transition-colors ${
                  emojiCount === 2 ? 'text-green-400 font-medium' : 'text-orange-400'
                }`}>
                  {emojiCount}😀
                </span>
              )}
              {activeRules.some(r => r.text.includes('sum to 25')) && (
                <span className={`transition-colors ${
                  digitSum === 25 ? 'text-green-400 font-medium' : 'text-orange-400'
                }`}>
                  Σ{digitSum}
                </span>
              )}
              {activeRules.some(r => r.text.includes('haiku')) && (
                <span className={`transition-colors ${
                  haikuCounts && haikuCounts.join('-') === '5-7-5' ? 'text-green-400 font-medium' : 'text-orange-400'
                }`}>
                  {haikuCounts ? haikuCounts.join('-') : '— — —'}
                </span>
              )}
              {activeRules.some(r => r.text.includes('3 question marks')) && (
                <span className={`transition-colors ${
                  (prompt.match(/\?/g) || []).length === 3 ? 'text-green-400 font-medium' : 'text-orange-400'
                }`}>
                  {(prompt.match(/\?/g) || []).length}?
                </span>
              )}
            </div>
          </div>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You are..."
            className={`no-focus-outline w-full px-4 py-3 text-gray-100 text-sm font-mono resize-none outline-none focus:outline-0 focus:ring-0 focus-visible:outline-none min-h-[140px] bg-gray-900/50 placeholder-gray-600 transition-transform ${
              shake ? 'animate-shake' : ''
            }`}
            spellCheck={false}
            autoFocus
          />
        </div>
        <div 
          ref={rulesContainerRef}
          className="space-y-2.5 overflow-y-auto pb-32"
          style={{ maxHeight: 'calc(100vh - 380px)' }}
        >
          {results.map(({ rule, passed }, index) => (
            <div 
              key={rule.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                passed 
                  ? 'bg-green-900/30 border-green-700' 
                  : justBroke === rule.id
                    ? 'bg-red-900/30 border-red-600 animate-shake'
                    : 'bg-gray-800/50 border-gray-700'
              } ${index === results.length - 1 && unlockedCount > 1 ? 'animate-slide-in' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300 ${
                  passed 
                    ? 'bg-green-500 text-white' 
                    : justBroke === rule.id
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {passed ? '✓' : '✗'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-relaxed ${
                      passed ? 'text-green-300' : justBroke === rule.id ? 'text-red-300' : 'text-gray-300'
                    }`}>
                      {rule.text}
                    </p>
                    {rule.id >= 100 && (
                      <button
                        onClick={() => removeCustomRule(customRules[rule.id - 100]?.id)}
                        className="text-gray-600 hover:text-red-400 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {!passed && rule.hint && rule.hint(prompt) && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      💡 {rule.hint(prompt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {allPassed && unlockedCount < combinedRules.length && (
            <div className="p-3.5 rounded-xl border border-dashed border-gray-700 bg-gray-800/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center animate-pulse">
                  <span className="text-gray-500 text-xs">?</span>
                </div>
                <p className="text-sm text-gray-500">New rule incoming...</p>
              </div>
            </div>
          )}
          <div className="pt-4">
            {!showAddRule ? (
              <button
                onClick={() => setShowAddRule(true)}
                className="w-full p-3 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400 text-sm transition-colors"
              >
                + Add your own cursed rule
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 space-y-3">
                <input
                  type="text"
                  value={newRuleText}
                  onChange={(e) => setNewRuleText(e.target.value)}
                  placeholder="Rule text (e.g., 'Include a dinosaur')"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
                />
                <input
                  type="text"
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  placeholder="What to match (e.g., 'dinosaur' or regex)"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCustomRule}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
                  >
                    Add Rule
                  </button>
                  <button
                    onClick={() => { setShowAddRule(false); setNewRuleText(''); setNewRulePattern('') }}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slideIn 0.35s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .no-focus-outline:focus-visible { outline: none !important; }
      `}</style>
    </div>
  )
}
