'use client'

import { useState, useEffect, useRef } from 'react'
import { ClippyHelper } from '@/components/ClippyHelper'

const STARTING_MONEY = 10_000_000_000 // $10 billion

interface Item {
  id: string
  name: string
  price: number
  category: 'talent' | 'hardware' | 'companies' | 'training' | 'misc'
  emoji: string
  description?: string
  unbuyable?: boolean
  rejectMessage?: string
  maxQuantity?: number
}

const items: Item[] = [
  // Misc - Cheap stuff
  { id: 'linkedin', name: 'LinkedIn Premium', price: 60, category: 'misc', emoji: '💼', description: 'For recruiting' },
  { id: 'chatgpt', name: 'ChatGPT Plus', price: 200, category: 'misc', emoji: '🤖', description: 'For "research"' },
  { id: 'midjourney', name: 'Midjourney Sub', price: 200, category: 'misc', emoji: '🎨', description: 'AI art research' },
  { id: 'twitter-bot', name: 'AI Twitter Influencer', price: 10_000, category: 'misc', emoji: '🐦', description: 'Will shill Llama' },
  
  // Hardware - GPUs
  { id: 'h100', name: 'H100 GPU', price: 40_000, category: 'hardware', emoji: '🎮' },
  { id: 'b200', name: 'B200 GPU', price: 50_000, category: 'hardware', emoji: '⚡' },
  { id: 'meditation', name: 'AI Safety Retreat', price: 50_000, category: 'misc', emoji: '🧘', description: 'For the researchers' },
  
  // Talent - Lower tier
  { id: 'junior-ml', name: 'Junior ML Engineer', price: 300_000, category: 'talent', emoji: '👨‍💻' },
  { id: 'pizza', name: 'Free Pizza Fridays', price: 1_000_000, category: 'misc', emoji: '🍕', description: '1 year supply' },
  { id: 'senior-ai', name: 'Senior AI Researcher', price: 2_000_000, category: 'talent', emoji: '🧑‍🔬' },
  { id: 'cooling', name: 'Data Center Cooling', price: 5_000_000, category: 'hardware', emoji: '❄️' },
  { id: 'superbowl', name: 'Super Bowl Ad', price: 7_000_000, category: 'misc', emoji: '🏈', description: 'AI recruiting ad' },
  
  // Hardware - Clusters
  { id: 'gpu-cluster', name: 'GPU Cluster (1K H100s)', price: 40_000_000, category: 'hardware', emoji: '🖥️' },
  
  // Talent - High tier
  { id: 'research-lead', name: 'OpenAI Research Lead', price: 50_000_000, category: 'talent', emoji: '🎯', description: 'Poached' },
  { id: 'karpathy', name: 'Andrej Karpathy', price: 100_000_000, category: 'talent', emoji: '🧠', description: 'Tesla AI legend', maxQuantity: 1 },
  { id: 'top-scientist', name: 'Top-Tier AI Scientist', price: 150_000_000, category: 'talent', emoji: '🔬', description: '$150M package' },
  { id: 'elite-package', name: 'Elite $250M Package', price: 250_000_000, category: 'talent', emoji: '💎', description: 'NYT-reported offers' },
  { id: 'hawaii', name: "Mark's Hawaii Expansion", price: 300_000_000, category: 'misc', emoji: '🏝️', description: 'Compound upgrade' },
  
  // Infrastructure
  { id: 'small-dc', name: 'Small Data Center', price: 500_000_000, category: 'hardware', emoji: '🏢' },
  { id: 'rename', name: 'Rename Meta', price: 500_000_000, category: 'misc', emoji: '✨', description: 'To something cooler', maxQuantity: 1 },
  { id: 'llama4', name: 'Train Llama 4', price: 500_000_000, category: 'training', emoji: '🦙' },
  
  // Companies - Cheaper
  { id: 'stability', name: 'Stability AI', price: 1_000_000_000, category: 'companies', emoji: '🖼️', maxQuantity: 1 },
  { id: 'gpt4-training', name: 'GPT-4 Competitor', price: 1_000_000_000, category: 'training', emoji: '🏋️', description: 'Training run' },
  { id: 'cohere', name: 'Cohere', price: 2_000_000_000, category: 'companies', emoji: '🔤', maxQuantity: 1 },
  { id: 'character', name: 'Character.AI', price: 2_700_000_000, category: 'companies', emoji: '💬', maxQuantity: 1 },
  { id: 'runway', name: 'Runway', price: 4_000_000_000, category: 'companies', emoji: '🎬', maxQuantity: 1 },
  { id: 'huggingface', name: 'Hugging Face', price: 4_500_000_000, category: 'companies', emoji: '🤗', maxQuantity: 1 },
  
  // Big infrastructure
  { id: 'hyperscale-dc', name: 'Hyperscale Data Center', price: 5_000_000_000, category: 'hardware', emoji: '🏗️' },
  { id: 'mistral', name: 'Mistral AI', price: 6_000_000_000, category: 'companies', emoji: '🇫🇷', maxQuantity: 1 },
  
  // Mega expensive
  { id: 'agi', name: 'AGI Moonshot Project', price: 10_000_000_000, category: 'training', emoji: '🚀' },
  { id: 'nuclear', name: 'Nuclear Power Plant', price: 10_000_000_000, category: 'hardware', emoji: '☢️', description: 'For the data centers' },
  { id: 'scale', name: 'Scale AI', price: 14_300_000_000, category: 'companies', emoji: '📊', description: 'Alex Wang included', maxQuantity: 1 },
  
  // Unbuyable easter eggs
  { id: 'ilya', name: 'Ilya Sutskever', price: 32_000_000_000, category: 'talent', emoji: '🧙', unbuyable: true, rejectMessage: "SSI is valued at $32B. Ilya's building something else. Nice try though.", maxQuantity: 1 },
  { id: 'demis', name: 'Demis Hassabis', price: 50_000_000_000, category: 'talent', emoji: '🏆', unbuyable: true, rejectMessage: "Too busy collecting Nobel Prizes. DeepMind isn't going anywhere.", maxQuantity: 1 },
  { id: 'sam', name: 'Sam Altman', price: 75_000_000_000, category: 'talent', emoji: '👔', unbuyable: true, rejectMessage: "He'd rather watch OpenAI win. Also, awkward...", maxQuantity: 1 },
  { id: 'anthropic', name: 'Anthropic', price: 60_000_000_000, category: 'companies', emoji: '🔒', unbuyable: true, rejectMessage: "Amazon and Google have it locked up. Constitutional AI isn't for sale.", maxQuantity: 1 },
  { id: 'openai', name: 'OpenAI', price: 157_000_000_000, category: 'companies', emoji: '🌟', unbuyable: true, rejectMessage: "Even $10B isn't close. They're valued at $157B. And Sam said no.", maxQuantity: 1 },
]

function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return `$${(amount / 1_000_000_000_000).toFixed(2)}T`
  }
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(2)}K`
  }
  return `$${amount}`
}

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `$${(price / 1_000_000_000).toFixed(1)}B`
  }
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(0)}M`
  }
  if (price >= 1_000) {
    return `$${(price / 1_000).toFixed(0)}K`
  }
  return `$${price}`
}

function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)

  useEffect(() => {
    const diff = value - previousValue.current
    const steps = 20
    const stepValue = diff / steps
    let current = previousValue.current
    let step = 0

    const interval = setInterval(() => {
      step++
      current += stepValue
      if (step >= steps) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.round(current))
      }
    }, 15)

    previousValue.current = value
    return () => clearInterval(interval)
  }, [value])

  const formattedValue = displayValue.toLocaleString('en-US')
  
  return (
    <div className="font-mono text-4xl md:text-6xl font-bold text-green-500 tracking-tight">
      ${formattedValue}
    </div>
  )
}

interface CartItem {
  item: Item
  quantity: number
}

export default function TalentGame() {
  const [gameState, setGameState] = useState<'playing' | 'receipt'>('playing')
  const [money, setMoney] = useState(STARTING_MONEY)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [rejectMessage, setRejectMessage] = useState<string | null>(null)
  const [shakeId, setShakeId] = useState<string | null>(null)

  const spent = STARTING_MONEY - money

  const buy = (item: Item) => {
    if (item.unbuyable) {
      setRejectMessage(item.rejectMessage || "This isn't for sale.")
      setShakeId(item.id)
      setTimeout(() => setShakeId(null), 500)
      return
    }

    const currentQty = cart[item.id] || 0
    if (item.maxQuantity && currentQty >= item.maxQuantity) {
      setRejectMessage(`You can only buy one ${item.name}.`)
      setShakeId(item.id)
      setTimeout(() => setShakeId(null), 500)
      return
    }

    if (money >= item.price) {
      setMoney(prev => prev - item.price)
      setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))
    }
  }

  const sell = (item: Item) => {
    if (item.unbuyable) return
    const currentQty = cart[item.id] || 0
    if (currentQty > 0) {
      setMoney(prev => prev + item.price)
      setCart(prev => ({ ...prev, [item.id]: prev[item.id] - 1 }))
    }
  }

  const getCartItems = (): CartItem[] => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({
        item: items.find(i => i.id === id)!,
        quantity
      }))
      .sort((a, b) => b.item.price * b.quantity - a.item.price * a.quantity)
  }

  if (gameState === 'receipt') {
    const cartItems = getCartItems()
    const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0)
    
    return (
      <div className="h-full bg-black text-white p-4 md:p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 md:p-8 font-mono">
            <div className="text-center border-b border-dashed border-zinc-700 pb-4 mb-4">
              <h1 className="text-2xl font-bold">META AI SHOPPING SPREE</h1>
              <p className="text-zinc-500 text-sm mt-1">RECEIPT</p>
            </div>

            <div className="space-y-2 border-b border-dashed border-zinc-700 pb-4 mb-4 max-h-64 overflow-y-auto">
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-300">{item.emoji} {item.name} {quantity > 1 ? `x${quantity}` : ''}</span>
                  <span className="text-zinc-400">{formatPrice(item.price * quantity)}</span>
                </div>
              ))}
              {cartItems.length === 0 && (
                <p className="text-center text-zinc-500">Nothing purchased...</p>
              )}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">ITEMS:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">TOTAL SPENT:</span>
                <span className="font-bold text-green-400">{formatMoney(spent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">REMAINING:</span>
                <span className={money > 0 ? 'text-green-400' : 'text-red-400'}>{formatMoney(money)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-zinc-700 text-center">
              <p className="text-lg font-bold mb-2">
                {spent >= 5_000_000_000 
                  ? "🔥 BIG SPENDER" 
                  : spent >= 1_000_000_000 
                    ? "💰 Serious Investor"
                    : spent >= 100_000_000
                      ? "🤔 Getting Started"
                      : "😅 Window Shopping"}
              </p>
              <p className="text-sm text-zinc-400 mb-4">
                {cartItems.some(ci => ci.item.category === 'companies') 
                  ? "You acquired some companies! The FTC would like a word."
                  : cartItems.some(ci => ci.item.id === 'karpathy')
                    ? "Great hire! Andrej will definitely help with Llama."
                    : spent < 100_000_000
                      ? "Zuck is disappointed. That's pocket change."
                      : "Not bad, but will it beat GPT-5?"}
              </p>
              <p className="text-xs text-zinc-600 italic">
                "Will this catch up to OpenAI? Probably not, but nice try Zuck."
              </p>
            </div>

            <button
              onClick={() => {
                setGameState('playing')
                setMoney(STARTING_MONEY)
                setCart({})
              }}
              className="w-full mt-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              SPEND AGAIN
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <ClippyHelper day={7} speechText="Buy researchers, GPUs, and companies to help Meta catch up in AI. Some things money can't buy..." hideOnMobile />
      {/* Reject Message Modal */}
      {rejectMessage && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setRejectMessage(null)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-md text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🚫</div>
            <p className="text-lg font-medium text-white">{rejectMessage}</p>
            <button
              onClick={() => setRejectMessage(null)}
              className="mt-4 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Header with Money Counter */}
      <div className="sticky top-0 bg-black/95 backdrop-blur border-b border-zinc-800 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg"
                alt="Mark Zuckerberg"
                className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700"
              />
              <div>
                <h1 className="text-lg font-bold">Meta&apos;s Money</h1>
                <p className="text-xs text-zinc-500">Spend $10B on AI</p>
              </div>
            </div>
            <AnimatedCounter value={money} />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map(item => {
              const qty = cart[item.id] || 0
              const canAfford = money >= item.price
              const isShaking = shakeId === item.id
              const atMax = item.maxQuantity && qty >= item.maxQuantity

              return (
                <div
                  key={item.id}
                  className={`relative bg-zinc-900 rounded-xl border-2 p-3 transition-all ${
                    item.unbuyable 
                      ? 'border-zinc-800 opacity-60' 
                      : qty > 0 
                        ? 'border-green-500 bg-zinc-800' 
                        : 'border-zinc-800 hover:border-zinc-700'
                  } ${isShaking ? 'animate-shake' : ''}`}
                >
                  {/* Quantity badge */}
                  {qty > 0 && !item.unbuyable && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                      {qty}
                    </div>
                  )}

                  <div className="text-center mb-2">
                    <span className="text-2xl">{item.emoji}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white text-center mb-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className={`text-center font-mono font-bold text-sm mb-3 ${
                    item.unbuyable ? 'text-zinc-500' : 'text-green-400'
                  }`}>
                    {formatPrice(item.price)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => sell(item)}
                      disabled={qty === 0 || item.unbuyable}
                      className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                        qty > 0 && !item.unbuyable
                          ? 'bg-red-900/50 text-red-400 hover:bg-red-900/70'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Sell
                    </button>
                    <button
                      onClick={() => buy(item)}
                      disabled={!canAfford && !item.unbuyable}
                      className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                        item.unbuyable
                          ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                          : canAfford && !atMax
                            ? 'bg-green-600 text-white hover:bg-green-500'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      {item.unbuyable ? '???' : 'Buy'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer with Receipt Button */}
      <div className="sticky bottom-0 bg-black/95 backdrop-blur border-t border-zinc-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            <span className="font-bold text-green-400">{formatMoney(spent)}</span> spent
            {' · '}
            <span>{Object.values(cart).reduce((a, b) => a + b, 0)} items</span>
          </div>
          <button
            onClick={() => setGameState('receipt')}
            className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            View Receipt
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
