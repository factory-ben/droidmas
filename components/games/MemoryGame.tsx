'use client'

import { useState, useEffect, useCallback } from 'react'
import { ClippyHelper } from '@/components/ClippyHelper'

interface Card {
  id: number
  content: string
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const pairs = [
  { content: 'GPT', emoji: '🤖' },
  { content: 'Claude', emoji: '🧠' },
  { content: 'Tokens', emoji: '🎫' },
  { content: 'Context', emoji: '📝' },
  { content: 'Hallucination', emoji: '👻' },
  { content: 'Fine-tune', emoji: '🎯' },
  { content: 'Embeddings', emoji: '🔮' },
  { content: 'RAG', emoji: '📚' },
  { content: 'Prompt', emoji: '💬' },
  { content: 'Agent', emoji: '🕵️' },
  { content: 'Inference', emoji: '⚡' },
  { content: 'Training', emoji: '🏋️' },
]

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [contextUsed, setContextUsed] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [message, setMessage] = useState('')

  const MAX_CONTEXT = 100000
  const CONTEXT_PER_FLIP = 2500

  const initGame = useCallback(() => {
    const cardPairs: Card[] = []
    pairs.forEach((pair, index) => {
      cardPairs.push({ id: index * 2, ...pair, isFlipped: false, isMatched: false })
      cardPairs.push({ id: index * 2 + 1, ...pair, isFlipped: false, isMatched: false })
    })
    setCards(shuffleArray(cardPairs))
    setFlippedCards([])
    setMoves(0)
    setContextUsed(0)
    setMessage('')
    setGameState('playing')
  }, [])

  const contextMessages = [
    { threshold: 20, msg: "Context looking good. You remember everything." },
    { threshold: 40, msg: "Context stable. Keep going." },
    { threshold: 50, msg: "Context getting cozy." },
    { threshold: 60, msg: "The AI is starting to forget earlier flips..." },
    { threshold: 70, msg: "Context compaction initiated." },
    { threshold: 80, msg: "Earlier memories fading..." },
    { threshold: 90, msg: "CRITICAL: Context nearly full!" },
    { threshold: 95, msg: "💀 Context overflow imminent!" },
  ]

  useEffect(() => {
    const percent = (contextUsed / MAX_CONTEXT) * 100
    const msg = [...contextMessages].reverse().find(m => percent >= m.threshold)
    if (msg) setMessage(msg.msg)
  }, [contextUsed])

  useEffect(() => {
    initGame()
  }, [initGame])

  const flipCard = (id: number) => {
    if (gameState !== 'playing') return
    if (flippedCards.length >= 2) return
    if (cards.find(c => c.id === id)?.isFlipped) return
    if (cards.find(c => c.id === id)?.isMatched) return

    const newContext = contextUsed + CONTEXT_PER_FLIP
    setContextUsed(newContext)
    
    if (newContext >= MAX_CONTEXT) {
      setGameState('lost')
      return
    }

    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c))
    setFlippedCards(prev => [...prev, id])
  }

  useEffect(() => {
    if (flippedCards.length !== 2) return
    
    setMoves(m => m + 1)
    
    const [first, second] = flippedCards
    const firstCard = cards.find(c => c.id === first)!
    const secondCard = cards.find(c => c.id === second)!
    
    if (firstCard.content === secondCard.content) {
      setCards(prev => prev.map(c => 
        c.id === first || c.id === second ? { ...c, isMatched: true } : c
      ))
      setFlippedCards([])
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          c.id === first || c.id === second ? { ...c, isFlipped: false } : c
        ))
        setFlippedCards([])
      }, 1000)
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (gameState !== 'playing') return
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      setGameState('won')
    }
  }, [cards, gameState])

  const contextPercent = (contextUsed / MAX_CONTEXT) * 100
  const matchedCount = cards.filter(c => c.isMatched).length / 2

  if (gameState === 'won') {
    const efficiency = Math.round((pairs.length * 2 / moves) * 100)
    
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-8">
        <div className="max-w-xl text-center space-y-8">
          <h1 className="text-5xl font-bold text-green-500">🎉 You Won!</h1>
          
          <div className="bg-zinc-900 p-8 rounded-xl space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-zinc-500 text-sm">Moves</p>
                <p className="text-4xl font-mono font-bold">{moves}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Context Used</p>
                <p className="text-4xl font-mono font-bold">{(contextUsed / 1000).toFixed(0)}k</p>
              </div>
            </div>
            
            <div>
              <p className="text-zinc-500 text-sm">Efficiency</p>
              <p className="text-5xl font-mono font-bold">{efficiency}%</p>
            </div>
          </div>
          
          <p className="text-zinc-600 italic">
            {efficiency >= 100 
              ? '"Perfect memory. Are you an AI?"'
              : efficiency >= 70
                ? '"Good context management."'
                : '"Context was struggling but you made it."'}
          </p>
          
          <button onClick={initGame} className="px-8 py-3 bg-white text-black font-bold rounded-lg">
            PLAY AGAIN
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'lost') {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-8">
        <div className="max-w-xl text-center space-y-8">
          <h1 className="text-5xl font-bold text-red-500">💀 Context Overflow!</h1>
          <p className="text-zinc-400">The AI forgot what game it was playing.</p>
          
          <div className="bg-zinc-900 p-8 rounded-xl space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-zinc-500 text-sm">Pairs Found</p>
                <p className="text-4xl font-mono font-bold">{matchedCount}/{pairs.length}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Moves</p>
                <p className="text-4xl font-mono font-bold">{moves}</p>
              </div>
            </div>
          </div>
          
          <p className="text-zinc-600 italic">&quot;You used 100k tokens on a memory game.&quot;</p>
          
          <button onClick={initGame} className="px-8 py-3 bg-white text-black font-bold rounded-lg">
            TRY AGAIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black text-white flex flex-col">
      <ClippyHelper day={8} speechText="Flip cards to find matching AI terms. Each flip costs tokens. Run out of context and you lose. How efficient is your memory?" hideOnMobile />
      {/* Header */}
      <div className="bg-black/90 border-b border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-green-400">{matchedCount}</p>
                <p className="text-xs text-zinc-500">Matched</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold">{moves}</p>
                <p className="text-xs text-zinc-500">Moves</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono">
                <span className={contextPercent > 80 ? 'text-red-400' : contextPercent > 60 ? 'text-yellow-400' : 'text-green-400'}>
                  {(contextUsed / 1000).toFixed(0)}k
                </span>
                <span className="text-zinc-600"> / 100k</span>
              </p>
              <p className="text-xs text-zinc-500">Context</p>
            </div>
          </div>
          
          {/* Context Bar */}
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                contextPercent > 80 ? 'bg-red-500 animate-pulse' : 
                contextPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${contextPercent}%` }}
            />
          </div>
          
          <p className={`text-sm text-center ${contextPercent > 80 ? 'text-red-400' : 'text-zinc-500'}`}>
            {message}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-w-3xl w-full">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              disabled={card.isFlipped || card.isMatched}
              className={`aspect-square rounded-xl text-3xl transition-all transform ${
                card.isMatched 
                  ? 'bg-green-900/50 border-2 border-green-600 scale-95' 
                  : card.isFlipped
                    ? 'bg-zinc-800 border-2 border-blue-500'
                    : 'bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
              }`}
            >
              {(card.isFlipped || card.isMatched) ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-2xl">{card.emoji}</span>
                  <span className="text-[10px] text-zinc-400 mt-1">{card.content}</span>
                </div>
              ) : (
                <span className="text-zinc-600">?</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
