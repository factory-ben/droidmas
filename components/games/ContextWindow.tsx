'use client'

import { useState, useEffect } from 'react'
import { ClippyHelper } from '@/components/ClippyHelper'

interface Item {
  id: string
  name: string
  tokens: number
  category: 'message' | 'memory' | 'system' | 'files' | 'chaos'
  emoji: string
}

const items: Item[] = [
  // Messages
  { id: 'quick-question', name: 'Quick question', tokens: 400, category: 'message', emoji: '💬' },
  { id: 'explain-error', name: 'Explain this error', tokens: 1200, category: 'message', emoji: '❓' },
  { id: 'fix-bug', name: 'Fix this bug', tokens: 900, category: 'message', emoji: '🐛' },
  { id: 'write-function', name: 'Write a function', tokens: 600, category: 'message', emoji: '⚡' },
  { id: 'review-code', name: 'Review my code', tokens: 1000, category: 'message', emoji: '👀' },
  { id: 'add-feature', name: 'Add this feature', tokens: 1800, category: 'message', emoji: '✨' },
  { id: 'refactor', name: 'Refactor this', tokens: 1400, category: 'message', emoji: '🔧' },
  { id: 'make-it-work', name: 'Just make it work', tokens: 500, category: 'message', emoji: '🙏' },
  
  // Memory
  { id: 'earlier-convo', name: 'Earlier in this chat', tokens: 2200, category: 'memory', emoji: '🧠' },
  { id: 'previous-attempt', name: 'My previous attempt', tokens: 1900, category: 'memory', emoji: '📜' },
  { id: 'debug-session', name: 'Debug session history', tokens: 4200, category: 'memory', emoji: '🔍' },
  { id: 'back-forth', name: 'Back and forth', tokens: 3100, category: 'memory', emoji: '🔁' },
  { id: 'yesterday', name: "Yesterday's conversation", tokens: 6000, category: 'memory', emoji: '📅' },
  
  // System
  { id: 'role', name: 'Role definition', tokens: 1000, category: 'system', emoji: '🎭' },
  { id: 'rules', name: 'Coding rules', tokens: 1800, category: 'system', emoji: '📋' },
  { id: 'style', name: 'Style guide', tokens: 2800, category: 'system', emoji: '📐' },
  { id: 'context', name: 'Project context', tokens: 4000, category: 'system', emoji: '📁' },
  { id: 'persona', name: 'Custom persona', tokens: 2100, category: 'system', emoji: '🤖' },
  
  // Files
  { id: 'file', name: 'Paste a file', tokens: 3200, category: 'files', emoji: '📄' },
  { id: 'component', name: 'This component', tokens: 2400, category: 'files', emoji: '🧩' },
  { id: 'error-log', name: 'Error log', tokens: 1600, category: 'files', emoji: '🚨' },
  { id: 'stack-trace', name: 'Stack trace', tokens: 1400, category: 'files', emoji: '📚' },
  { id: 'docs', name: 'Paste the docs', tokens: 7500, category: 'files', emoji: '📖' },
  { id: 'codebase', name: 'Entire codebase', tokens: 42000, category: 'files', emoji: '💀' },
  
  // Chaos
  { id: 'change-back', name: 'Actually change it back', tokens: 2000, category: 'chaos', emoji: '↩️' },
  { id: 'same-question', name: 'Ask the same thing again', tokens: 1200, category: 'chaos', emoji: '🔂' },
  { id: 'just-in-case', name: 'Just in case...', tokens: 4000, category: 'chaos', emoji: '🛡️' },
  { id: 'pm-joins', name: 'PM joins the chat', tokens: 6000, category: 'chaos', emoji: '📊' },
  { id: 'screenshot', name: 'Screenshot of code', tokens: 9000, category: 'chaos', emoji: '📸' },
  { id: 'actually-wait', name: 'Actually wait...', tokens: 800, category: 'chaos', emoji: '✋' },
  { id: 'one-more', name: 'One more thing', tokens: 1100, category: 'chaos', emoji: '➕' },
  { id: 'nevermind', name: 'Nevermind', tokens: 600, category: 'chaos', emoji: '🙅' },
  { id: 'wrong-file', name: 'Wrong file sorry', tokens: 3500, category: 'chaos', emoji: '😅' },
  { id: 'ignore-that', name: 'Ignore that last part', tokens: 900, category: 'chaos', emoji: '🙈' },
  { id: 'start-over', name: "Let's start over", tokens: 1500, category: 'chaos', emoji: '🔄' },
  { id: 'teammate-paste', name: 'Teammate pastes in', tokens: 5500, category: 'chaos', emoji: '👥' },
  { id: 'meeting-notes', name: 'Meeting transcript', tokens: 8000, category: 'chaos', emoji: '🎙️' },
  { id: 'slack-thread', name: 'Slack thread', tokens: 4500, category: 'chaos', emoji: '💬' },
  { id: 'jira-ticket', name: 'Jira ticket', tokens: 3000, category: 'chaos', emoji: '🎫' },
]

const CONTEXT_LIMIT = 200000
const FIRE_THRESHOLD = 400000

const categoryLabels: Record<string, string> = {
  message: 'Messages',
  memory: 'Memory',
  system: 'System',
  files: 'Files',
  chaos: 'Chaos',
}

const categoryOrder = ['message', 'memory', 'system', 'files', 'chaos']

function getVerdict(cart: Record<string, number>, total: number): { title: string; roast: string } {
  const codebaseCount = cart['codebase'] || 0
  const screenshotCount = cart['screenshot'] || 0
  const chaosTotal = items
    .filter(i => i.category === 'chaos')
    .reduce((sum, i) => sum + (cart[i.id] || 0) * i.tokens, 0)
  const chaosPercent = total > 0 ? (chaosTotal / total) * 100 : 0
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0)

  if (total >= FIRE_THRESHOLD) {
    return { title: 'ARSONIST', roast: 'You did this on purpose. You wanted to watch it burn.' }
  }
  if (codebaseCount >= 2) {
    return { title: 'Context Destroyer', roast: 'You pasted your ENTIRE CODEBASE. Twice. Why.' }
  }
  if (codebaseCount >= 1) {
    return { title: 'The Nuclear Option', roast: "You pasted your entire codebase. That's 42K tokens for one paste." }
  }
  if (screenshotCount >= 2) {
    return { title: 'Screenshot Criminal', roast: "Screenshots of code. Multiple times. That's OCR'd badly into 18K tokens." }
  }
  if (screenshotCount >= 1) {
    return { title: 'Screenshot Andy', roast: 'A screenshot of code. 9K tokens for something you could have copy-pasted.' }
  }
  if (chaosPercent > 50) {
    return { title: 'Chaos Agent', roast: 'More than half your context was pure chaos. Relatable.' }
  }
  if (chaosPercent > 30) {
    return { title: 'Entropy Enthusiast', roast: "A healthy dose of chaos. 'Actually wait...' is your catchphrase." }
  }
  if (itemCount > 30) {
    return { title: 'Death by 1000 Prompts', roast: 'So many small things. Each one felt harmless. Together: devastation.' }
  }
  if (total < CONTEXT_LIMIT) {
    return { title: 'Impossibly Efficient', roast: "You... didn't overflow? Are you even a real developer?" }
  }
  return { title: 'Context Goblin', roast: 'You kept adding things. Now look what happened.' }
}

function formatTokens(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  }
  return n.toLocaleString()
}

export default function ContextWindow() {
  const [gameState, setGameState] = useState<'playing' | 'sending' | 'receipt'>('playing')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [wiggling, setWiggling] = useState<string | null>(null)

  const totalTokens = Object.entries(cart).reduce((total, [id, count]) => {
    const item = items.find(i => i.id === id)
    return total + (item?.tokens || 0) * count
  }, 0)

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)

  const addItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    
    const newCount = (cart[itemId] || 0) + 1
    const newTotal = totalTokens + item.tokens
    
    setCart(prev => ({ ...prev, [itemId]: newCount }))
    setWiggling(itemId)
    setTimeout(() => setWiggling(null), 200)
    
    if (newTotal >= CONTEXT_LIMIT && totalTokens < CONTEXT_LIMIT) {
      setTimeout(() => setGameState('sending'), 300)
    }
  }

  const removeItem = (itemId: string) => {
    if (cart[itemId] > 0) {
      setCart(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    }
  }

  useEffect(() => {
    if (gameState === 'sending') {
      const timer = setTimeout(() => {
        setGameState('receipt')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [gameState])

  const reset = () => {
    setCart({})
    setGameState('playing')
  }

  if (gameState === 'sending') {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center overflow-hidden">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-mono">Sending...</p>
          <p className="text-zinc-500 mt-2">Processing {totalItems} items...</p>
        </div>
      </div>
    )
  }

  if (gameState === 'receipt') {
    const overflow = totalTokens - CONTEXT_LIMIT
    const isOverflow = overflow > 0
    const isOnFire = totalTokens >= FIRE_THRESHOLD
    const verdict = getVerdict(cart, totalTokens)
    
    const breakdown = Object.entries(cart)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => {
        const item = items.find(i => i.id === id)!
        return { ...item, count, subtotal: item.tokens * count }
      })
      .sort((a, b) => b.subtotal - a.subtotal)

    const biggestItem = breakdown[0]
    const chaosTotal = breakdown
      .filter(i => i.category === 'chaos')
      .reduce((sum, i) => sum + i.subtotal, 0)
    const chaosPercent = totalTokens > 0 ? Math.round((chaosTotal / totalTokens) * 100) : 0

    return (
      <div className={`h-full text-white p-4 overflow-auto relative ${isOnFire ? 'bg-orange-950' : 'bg-black'}`}>
        {isOnFire && (
          <>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-orange-500/40 via-red-500/20 to-transparent animate-pulse" />
              <div className="absolute bottom-0 left-1/4 text-8xl animate-bounce" style={{ animationDuration: '0.5s' }}>🔥</div>
              <div className="absolute bottom-0 right-1/4 text-8xl animate-bounce" style={{ animationDuration: '0.7s' }}>🔥</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-9xl animate-bounce" style={{ animationDuration: '0.6s' }}>🔥</div>
              <div className="absolute bottom-20 left-10 text-6xl animate-bounce" style={{ animationDuration: '0.8s' }}>🔥</div>
              <div className="absolute bottom-20 right-10 text-6xl animate-bounce" style={{ animationDuration: '0.55s' }}>🔥</div>
              <div className="absolute top-10 left-5 text-4xl animate-pulse">🔥</div>
              <div className="absolute top-20 right-8 text-4xl animate-pulse" style={{ animationDelay: '0.3s' }}>🔥</div>
            </div>
          </>
        )}
        
        <div className="max-w-md mx-auto relative z-10">
          {isOnFire && (
            <div className="text-center mb-6">
              <div className="text-6xl mb-2 animate-bounce">🔥💀🔥</div>
              <h1 className="text-3xl font-bold text-orange-400 animate-pulse">EVERYTHING IS ON FIRE</h1>
              <p className="text-orange-300 text-sm">+{formatTokens(overflow)} tokens over limit (2x capacity!)</p>
            </div>
          )}
          {isOverflow && !isOnFire && (
            <div className="text-center mb-6 animate-pulse">
              <div className="text-5xl mb-2">💥</div>
              <h1 className="text-3xl font-bold text-red-500">CONTEXT OVERFLOW</h1>
              <p className="text-red-400 text-sm">+{formatTokens(overflow)} tokens over limit</p>
            </div>
          )}
          {!isOverflow && (
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">✅</div>
              <h1 className="text-3xl font-bold text-green-500">IT FIT!</h1>
              <p className="text-green-400 text-sm">{formatTokens(CONTEXT_LIMIT - totalTokens)} tokens to spare</p>
            </div>
          )}

          <div 
            className="bg-zinc-100 text-black rounded-sm p-4 font-mono text-sm shadow-lg"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)'
            }}
          >
            <div className="text-center border-b border-dashed border-zinc-400 pb-3 mb-3">
              <p className="font-bold text-lg">CONTEXT WINDOW</p>
              <p className="text-xs text-zinc-500">200K TOKEN LIMIT</p>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto mb-3 border-b border-dashed border-zinc-400 pb-3">
              {breakdown.map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-zinc-700 truncate mr-2">
                    {item.emoji} {item.name} {item.count > 1 && `×${item.count}`}
                  </span>
                  <span className="font-bold whitespace-nowrap">{item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>{totalTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>LIMIT</span>
                <span>{CONTEXT_LIMIT.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between font-bold text-lg pt-2 border-t border-zinc-300 ${isOverflow ? 'text-red-600' : 'text-green-600'}`}>
                <span>{isOverflow ? 'OVERFLOW' : 'REMAINING'}</span>
                <span>{isOverflow ? '+' : ''}{Math.abs(overflow).toLocaleString()}</span>
              </div>
            </div>

            {biggestItem && (
              <div className="mt-4 pt-3 border-t border-dashed border-zinc-400 text-center">
                <p className="text-xs text-zinc-500">BIGGEST CONTEXT HOG</p>
                <p className="font-bold">{biggestItem.emoji} {biggestItem.name}</p>
                <p className="text-xs text-zinc-600">{biggestItem.subtotal.toLocaleString()} tokens ({Math.round((biggestItem.subtotal / totalTokens) * 100)}% of total)</p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-dashed border-zinc-400 text-center">
              <p className="text-xs text-zinc-500 mb-1">VERDICT</p>
              <p className="font-bold text-lg">{verdict.title}</p>
              <p className="text-xs text-zinc-600 italic mt-1">"{verdict.roast}"</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-zinc-900 p-3 rounded-lg text-center">
              <p className="text-xl font-bold">{totalItems}</p>
              <p className="text-xs text-zinc-500">Items</p>
            </div>
            <div className="bg-zinc-900 p-3 rounded-lg text-center">
              <p className="text-xl font-bold text-orange-400">{chaosPercent}%</p>
              <p className="text-xs text-zinc-500">Chaos</p>
            </div>
            <div className="bg-zinc-900 p-3 rounded-lg text-center">
              <p className="text-xl font-bold text-purple-400">{breakdown.length}</p>
              <p className="text-xs text-zinc-500">Unique</p>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full mt-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const groupedItems = categoryOrder.map(cat => ({
    category: cat,
    label: categoryLabels[cat],
    items: items.filter(i => i.category === cat)
  }))

  return (
    <div className="h-full bg-black text-white overflow-auto">
      <ClippyHelper day={6} speechText="Keep adding things to your context window until it's full. Messages, files, chaos... what will fill your 200K tokens first?" hideOnMobile />
      <div className="sticky top-0 bg-black/95 backdrop-blur border-b border-zinc-800 p-4 z-50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">Add to Context</h1>
            <p className="text-zinc-500 text-xs">Keep adding things...</p>
          </div>
          <div className="bg-zinc-900 px-4 py-2 rounded-full">
            <span className="text-lg font-mono font-bold">{totalItems}</span>
            <span className="text-zinc-500 text-sm ml-1">items</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-8">
        {groupedItems.map(group => (
          <div key={group.category} className="mb-6">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 px-1">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map(item => {
                const count = cart[item.id] || 0
                const isWiggling = wiggling === item.id
                return (
                  <div
                    key={item.id}
                    className={`bg-zinc-900 border border-zinc-800 rounded-lg p-3 transition-all ${
                      count > 0 ? 'border-zinc-600 bg-zinc-800' : ''
                    } ${isWiggling ? 'scale-105' : ''}`}
                    style={{ transition: 'transform 0.1s ease-out, background-color 0.2s, border-color 0.2s' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-sm truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={count === 0}
                          className={`w-8 h-8 rounded-lg font-bold text-lg transition-colors ${
                            count === 0 
                              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                              : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                          }`}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-mono font-bold">{count}</span>
                        <button
                          onClick={() => addItem(item.id)}
                          className="w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-lg transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
