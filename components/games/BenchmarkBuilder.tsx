'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import html2canvas from 'html2canvas'
import { DAY_COLORS } from '@/components/PixelStartScreen'
import { ClippyHelper } from '@/components/ClippyHelper'

type Phase = 'criteria' | 'models' | 'modifiers' | 'running' | 'results'

interface Criterion {
  id: string
  name: string
  emoji: string
}

interface Model {
  id: string
  name: string
  org: string
  color: string
}

interface Modifier {
  id: string
  name: string
  emoji: string
  description: string
  bias?: string // org that gets boosted
}

const criteria: Criterion[] = [
  // Developer pain points
  { id: 'actually-right', name: 'Actually Being Right', emoji: '✅' },
  { id: 'no-hallucinate', name: 'Not Hallucinating Dependencies', emoji: '📦' },
  { id: 'memory', name: 'Remembering What I Said 5 Messages Ago', emoji: '🧓' },
  { id: 'codebase', name: 'Understanding My Codebase (Not Just The README)', emoji: '🗂️' },
  { id: 'agents', name: 'Handling 47 Agents At Once', emoji: '🤖' },
  { id: 'no-libs', name: 'Not Adding Unnecessary Libraries', emoji: '📉' },
  { id: 'stop-explaining', name: 'Knowing When To Stop Explaining', emoji: '🤐' },
  { id: 'read-error', name: 'Actually Reading The Error Message', emoji: '🔴' },
  { id: 'no-deprecated', name: 'Not Suggesting Deprecated APIs', emoji: '⚰️' },
  { id: 'make-it-pop', name: 'Understanding "Make It Pop"', emoji: '✨' },
  { id: 'pm-change', name: 'Surviving The PM\'s "Quick Change"', emoji: '😰' },
  { id: 'first-try', name: 'Writing Code That Works On First Try', emoji: '🎯' },
  { id: 'no-overengineer', name: 'Not Over-Engineering A Button', emoji: '🔘' },
  { id: 'idk', name: 'Admitting "I Don\'t Know"', emoji: '🤷' },
  { id: 'vibes', name: 'Vibes-Based Architecture', emoji: '🌊' },
  { id: 'no-new-bugs', name: 'Fixing Bugs Without Creating 3 More', emoji: '🐛' },
  { id: 'context-window', name: 'Not Forgetting The Beginning Of This File', emoji: '📜' },
  { id: 'no-regex', name: 'Not Immediately Suggesting Regex', emoji: '🔤' },
  { id: 'copy-paste', name: 'Understanding Code I Copy-Pasted', emoji: '📋' },
  { id: 'prod-safe', name: 'Being Safe To Run In Production', emoji: '🚨' },
  { id: 'midnight-deploy', name: 'Friday 5pm Deploy Confidence', emoji: '🌙' },
  { id: 'tech-debt', name: 'Acknowledging Technical Debt Exists', emoji: '💳' },
  { id: 'no-todo', name: 'Not Leaving TODO Comments Everywhere', emoji: '📝' },
  { id: 'estimate', name: 'Accurate Time Estimates', emoji: '⏱️' },
  
  // Santa/Holiday themed
  { id: 'gift-routing', name: 'Santa\'s Gift Routing Optimization', emoji: '🎁' },
  { id: 'elf-delegation', name: 'Elf Task Delegation Efficiency', emoji: '🧝' },
  { id: 'reindeer-path', name: 'Reindeer Flight Path Planning', emoji: '🦌' },
  { id: 'naughty-nice', name: 'Naughty/Nice Classification', emoji: '📜' },
  { id: 'xmas-deadline', name: 'Christmas Deadline Handling', emoji: '⏰' },
  { id: 'chimney', name: 'Chimney Entry Calculations', emoji: '🏠' },
  { id: 'cookie-optimization', name: 'Cookie & Milk Consumption Planning', emoji: '🍪' },
  { id: 'north-pole', name: 'North Pole Server Uptime', emoji: '🏔️' },
  { id: 'wish-list', name: 'Wish List Natural Language Processing', emoji: '📧' },
  { id: 'toy-assembly', name: 'IKEA-Style Toy Assembly Instructions', emoji: '🔧' },
]

const models: Model[] = [
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', org: 'Google', color: '#4285F4' },
  { id: 'grok-4.1', name: 'Grok 4.1', org: 'xAI', color: '#1DA1F2' },
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', org: 'Anthropic', color: '#D4A574' },
  { id: 'gpt-5.1', name: 'GPT-5.1', org: 'OpenAI', color: '#10A37F' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', org: 'Google', color: '#4285F4' },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', org: 'Anthropic', color: '#D4A574' },
  { id: 'o3', name: 'o3', org: 'OpenAI', color: '#10A37F' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', org: 'DeepSeek', color: '#5C6BC0' },
  { id: 'qwen3-max', name: 'Qwen3 Max', org: 'Alibaba', color: '#FF6A00' },
  { id: 'mistral-medium-3', name: 'Mistral Medium 3', org: 'Mistral', color: '#F97316' },
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', org: 'Meta', color: '#0668E1' },
  { id: 'grok-3', name: 'Grok 3', org: 'xAI', color: '#1DA1F2' },
]

const modifiers: Modifier[] = [
  { id: 'eval-gpt', name: 'Evaluated by GPT-5', emoji: '🧑‍⚖️', description: 'OpenAI model judges the results', bias: 'OpenAI' },
  { id: 'eval-claude', name: 'Evaluated by Claude', emoji: '🧑‍⚖️', description: 'Anthropic model judges the results', bias: 'Anthropic' },
  { id: 'eval-gemini', name: 'Evaluated by Gemini', emoji: '🧑‍⚖️', description: 'Google model judges the results', bias: 'Google' },
  { id: 'sponsor-openai', name: 'Sponsored by OpenAI', emoji: '💰', description: 'Research funded by OpenAI', bias: 'OpenAI' },
  { id: 'sponsor-google', name: 'Sponsored by Google', emoji: '💰', description: 'Research funded by Google', bias: 'Google' },
  { id: 'sponsor-anthropic', name: 'Sponsored by Anthropic', emoji: '💰', description: 'Research funded by Anthropic', bias: 'Anthropic' },
  { id: 'author-ex-openai', name: 'Author Ex-OpenAI', emoji: '👔', description: 'Lead researcher used to work at OpenAI', bias: 'OpenAI' },
  { id: 'author-ex-google', name: 'Author Ex-Google', emoji: '👔', description: 'Lead researcher used to work at Google', bias: 'Google' },
  { id: 'cot-required', name: 'Chain-of-Thought Required', emoji: '🔗', description: 'Models must show reasoning', bias: 'OpenAI' },
  { id: 'no-cot', name: 'No Chain-of-Thought Allowed', emoji: '🚫', description: 'Direct answers only', bias: 'Anthropic' },
  { id: 'december', name: 'Evaluated in December', emoji: '🎄', description: 'Holiday spirit bonus active' },
  { id: 'cherry-pick', name: 'Cherry-Picked Examples', emoji: '🍒', description: 'Only the best 10% of runs shown' },
  { id: 'blog-post', name: 'Results From Blog Post', emoji: '📝', description: 'Source: company announcement' },
  { id: 'twitter', name: 'Source: Twitter Thread', emoji: '🐦', description: 'Peer reviewed by ratio' },
]

function ManipulationToast({
  showManipulationToast,
  showArxivToast,
}: {
  showManipulationToast: boolean
  showArxivToast: boolean
}) {
  return (
    <>
      {showManipulationToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 p-1 rounded-xl">
            <div className="bg-black px-6 py-3 rounded-lg">
              <span className="text-xl">🎛️ MANIPULATION MODE ACTIVATED 🎛️</span>
            </div>
          </div>
        </div>
      )}
      {showArxivToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-green-600 to-emerald-400 p-1 rounded-xl">
            <div className="bg-black px-6 py-4 rounded-lg text-center">
              <div className="text-lg mb-1">🎉 Congratulations!</div>
              <div className="text-sm text-zinc-300">Your benchmark is now peer-reviewed*</div>
              <div className="text-xs text-zinc-500 mt-2">*by yourself</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function getScore(
  modelId: string, 
  criterionId: string, 
  allCriteria: string[], 
  allModels: string[],
  selectedModifiers: string[]
): number {
  const model = models.find(m => m.id === modelId)
  const seed = `${modelId}-${criterionId}-${allCriteria.sort().join(',')}-${allModels.sort().join(',')}`
  const hash = hashCode(seed)
  let baseScore = 65 + (hash % 34)
  
  // Apply modifier biases
  selectedModifiers.forEach(modId => {
    const mod = modifiers.find(m => m.id === modId)
    if (mod?.bias && model?.org === mod.bias) {
      baseScore += 3 + (hashCode(`${modId}-${modelId}`) % 5)
    }
  })
  
  // December bonus for Santa criteria
  if (selectedModifiers.includes('december') && criterionId.includes('gift') || 
      criterionId.includes('elf') || criterionId.includes('reindeer') ||
      criterionId.includes('naughty') || criterionId.includes('xmas') ||
      criterionId.includes('chimney') || criterionId.includes('cookie') ||
      criterionId.includes('north-pole') || criterionId.includes('wish') ||
      criterionId.includes('toy')) {
    baseScore += 5
  }
  
  // Cherry-pick bonus
  if (selectedModifiers.includes('cherry-pick')) {
    baseScore += 3
  }
  
  return Math.min(99, baseScore)
}

function getConfidenceInterval(score: number, modelId: string, criterionId: string): number {
  const seed = `ci-${modelId}-${criterionId}`
  const hash = hashCode(seed)
  return 1 + (hash % 5)
}

const runningMessages = [
  "Initializing benchmark harness...",
  "Loading model weights...",
  "Preparing evaluation prompts...",
  "Running inference...",
  "Computing metrics...",
  "Cross-validating scores...",
  "Generating insights...",
]

const absurdRunningMessages = [
  "Asking Claude to be humble...",
  "Teaching GPT-5 what 'simple' means...",
  "Waiting for Gemini to stop overthinking...",
  "Convincing DeepSeek it's not a competition...",
  "Calibrating vibes detector...",
  "Measuring hallucination confidence...",
  "Consulting with Santa's QA team...",
  "Checking if it works on my machine...",
  "Asking models to pinky promise they tried...",
]

function BenchmarkBuilderInner() {
  const searchParams = useSearchParams()
  const resultsRef = useRef<HTMLDivElement>(null)
  
  const [phase, setPhase] = useState<Phase>('criteria')
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [runMessage, setRunMessage] = useState('')
  const [modelProgress, setModelProgress] = useState<Record<string, number>>({})
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customCriteria, setCustomCriteria] = useState<Criterion[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCriterionName, setNewCriterionName] = useState('')
  const [newCriterionEmoji, setNewCriterionEmoji] = useState('🎯')
  const [manipulationMode, setManipulationMode] = useState(false)
  const [manipulatedScores, setManipulatedScores] = useState<Record<string, number>>({})
  const [showManipulationToast, setShowManipulationToast] = useState(false)
  const [showArxivToast, setShowArxivToast] = useState(false)
  const [benchmarkName, setBenchmarkName] = useState<string>('')
  const [isGeneratingName, setIsGeneratingName] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const trophyClickCount = useRef(0)
  const trophyClickTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const c = searchParams.get('c')
    const m = searchParams.get('m')
    const mod = searchParams.get('mod')
    if (c && m) {
      const criteriaIds = c.split(',').filter(id => criteria.some(cr => cr.id === id))
      const modelIds = m.split(',').filter(id => models.some(mo => mo.id === id))
      const modifierIds = mod ? mod.split(',').filter(id => modifiers.some(mo => mo.id === id)) : []
      if (criteriaIds.length > 0 && modelIds.length > 0) {
        setSelectedCriteria(criteriaIds)
        setSelectedModels(modelIds)
        setSelectedModifiers(modifierIds)
        setPhase('results')
      }
    }
  }, [searchParams])

  const toggleCriterion = (id: string) => {
    setSelectedCriteria(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleModel = (id: string) => {
    setSelectedModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const toggleModifier = (id: string) => {
    setSelectedModifiers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const addCustomCriterion = () => {
    if (!newCriterionName.trim()) return
    const id = `custom-${Date.now()}`
    setCustomCriteria(prev => [...prev, { id, name: newCriterionName.trim(), emoji: newCriterionEmoji }])
    setNewCriterionName('')
    setNewCriterionEmoji('🎯')
    setShowAddForm(false)
  }

  const allCriteria = [...criteria, ...customCriteria]

  const generateBenchmarkName = useCallback(async (criteriaIds: string[]) => {
    setIsGeneratingName(true)
    setBenchmarkName('')
    
    const criteriaNames = criteriaIds.map(id => {
      const c = [...criteria, ...customCriteria].find(cr => cr.id === id)
      return c?.name || id
    })
    
    try {
      const response = await fetch('https://api.droidmas.com/generate-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          criteria: criteriaNames,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setBenchmarkName(data.name?.trim() || 'The Vibes Benchmark')
      } else {
        // Fallback name if API fails
        setBenchmarkName('The Vibes Benchmark')
      }
    } catch {
      // Fallback name if API fails
      setBenchmarkName('The Vibes Benchmark')
    } finally {
      setIsGeneratingName(false)
    }
  }, [customCriteria])

  const handleTrophyClick = () => {
    trophyClickCount.current++
    if (trophyClickTimer.current) clearTimeout(trophyClickTimer.current)
    
    if (trophyClickCount.current >= 3) {
      setManipulationMode(true)
      setShowManipulationToast(true)
      setTimeout(() => setShowManipulationToast(false), 2000)
      trophyClickCount.current = 0
    } else {
      trophyClickTimer.current = setTimeout(() => {
        trophyClickCount.current = 0
      }, 500)
    }
  }

  const handleArxivSubmit = () => {
    setShowArxivToast(true)
    setTimeout(() => setShowArxivToast(false), 4000)
  }

  const getManipulatedScore = (modelId: string, criterionId: string, originalScore: number) => {
    const key = `${modelId}-${criterionId}`
    return manipulatedScores[key] ?? originalScore
  }

  const setManipulatedScore = (modelId: string, criterionId: string, score: number) => {
    const key = `${modelId}-${criterionId}`
    setManipulatedScores(prev => ({ ...prev, [key]: score }))
  }

  const runBenchmark = useCallback(() => {
    setPhase('running')
    setModelProgress({})
    
    const initialProgress: Record<string, number> = {}
    selectedModels.forEach(m => { initialProgress[m] = 0 })
    setModelProgress(initialProgress)

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(() => setPhase('results'), 500)
      }
      
      setModelProgress(prev => {
        const updated = { ...prev }
        selectedModels.forEach(m => {
          const modelSeed = hashCode(m) % 20
          updated[m] = Math.min(100, (prev[m] || 0) + Math.random() * 18 + modelSeed * 0.5)
        })
        return updated
      })
      
      const allMessages = [...runningMessages, ...absurdRunningMessages]
      const msgIndex = Math.floor((progress / 100) * allMessages.length)
      setRunMessage(allMessages[Math.min(msgIndex, allMessages.length - 1)])
    }, 200)

    return () => clearInterval(interval)
  }, [selectedModels])

  const getResults = useCallback(() => {
    const results = selectedModels.map(modelId => {
      const model = models.find(m => m.id === modelId)!
      const scores = selectedCriteria.map(criterionId => ({
        criterionId,
        score: getScore(modelId, criterionId, selectedCriteria, selectedModels, selectedModifiers),
        ci: getConfidenceInterval(
          getScore(modelId, criterionId, selectedCriteria, selectedModels, selectedModifiers), 
          modelId, 
          criterionId
        ),
      }))
      const avgScore = scores.reduce((a, b) => a + b.score, 0) / scores.length
      return { model, scores, avgScore }
    }).sort((a, b) => b.avgScore - a.avgScore)
    
    return results
  }, [selectedCriteria, selectedModels, selectedModifiers])

  const getShareUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
    let url = `${base}?c=${selectedCriteria.join(',')}&m=${selectedModels.join(',')}`
    if (selectedModifiers.length > 0) {
      url += `&mod=${selectedModifiers.join(',')}`
    }
    return url
  }

  const getTweetText = () => {
    const results = getResults()
    const winner = results[0]
    const topCriteria = selectedCriteria.slice(0, 2).map(id => allCriteria.find(c => c.id === id)?.name).join(' and ')
    return encodeURIComponent(
      `My AI benchmark crowned ${winner.model.name} as the best at "${topCriteria}"! 🎄\n\n${getShareUrl()}`
    )
  }

  const copyUrl = async () => {
    await navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveImage = async () => {
    if (!resultsRef.current) return
    setSaving(true)
    try {
      // Suppress console errors temporarily for html2canvas color parsing issues
      const originalError = console.error
      console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('color function')) return
        originalError.apply(console, args)
      }
      
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
      })
      
      console.error = originalError
      
      const link = document.createElement('a')
      link.download = 'my-ai-benchmark.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to save image:', err)
    }
    setSaving(false)
  }

  const reset = () => {
    setPhase('criteria')
    setSelectedCriteria([])
    setSelectedModels([])
    setSelectedModifiers([])
    setManipulationMode(false)
    setManipulatedScores({})
    setBenchmarkName('')
    setIsEditingName(false)
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  // Phase 1: Criteria Selection
  if (phase === 'criteria') {
    return (
      <div className="h-full bg-black text-white">
        <div className="hidden sm:block">
          <ClippyHelper day={1} speechText="Make your own benchmark. Add different combos or add your own." />
        </div>
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 pb-40">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2">Build Your Own AI Benchmark</h1>
                <p className="text-zinc-400">Select the criteria that actually matter</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {showAddForm ? (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700">
                    <div className="flex flex-col gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const emojis = ['🎯', '🚀', '💡', '⚡', '🔥', '✨', '🎨', '🧪', '🔮', '💎', '🌟', '🎪']
                          const currentIndex = emojis.indexOf(newCriterionEmoji)
                          setNewCriterionEmoji(emojis[(currentIndex + 1) % emojis.length])
                        }}
                        className="w-10 h-10 bg-zinc-800 border border-zinc-600 rounded-lg text-xl flex items-center justify-center hover:bg-zinc-700 hover:border-zinc-500 transition-all shrink-0"
                        title="Click to change emoji"
                      >
                        {newCriterionEmoji}
                      </button>
                      <input
                        type="text"
                        value={newCriterionName}
                        onChange={(e) => setNewCriterionName(e.target.value)}
                        className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="What should AI be judged on?"
                        onKeyDown={(e) => e.key === 'Enter' && addCustomCriterion()}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addCustomCriterion}
                        disabled={!newCriterionName.trim()}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-sm font-medium transition-all"
                      >
                        Add Category
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="p-4 rounded-xl text-left transition-all border border-dashed border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800"
                  >
                    <span className="text-2xl mb-2 block">➕</span>
                    <span className="text-sm font-medium leading-tight block text-zinc-400">Add Custom Category</span>
                  </button>
                )}
                {customCriteria.map(criterion => {
                  const selected = selectedCriteria.includes(criterion.id)
                  return (
                    <button
                      key={criterion.id}
                      onClick={() => toggleCriterion(criterion.id)}
                      className={`p-4 rounded-xl text-left transition-all border border-zinc-800 ${
                        selected
                          ? 'bg-green-900/50 ring-2 ring-green-500 scale-[1.02]'
                          : 'bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{criterion.emoji}</span>
                      <span className="text-sm font-medium leading-tight block">{criterion.name}</span>
                    </button>
                  )
                })}
                {criteria.map(criterion => {
                  const selected = selectedCriteria.includes(criterion.id)
                  return (
                    <button
                      key={criterion.id}
                      onClick={() => toggleCriterion(criterion.id)}
                      className={`p-4 rounded-xl text-left transition-all border border-zinc-800 ${
                        selected
                          ? 'bg-green-900/50 ring-2 ring-green-500 scale-[1.02]'
                          : 'bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{criterion.emoji}</span>
                      <span className="text-sm font-medium leading-tight block">{criterion.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div 
            className="sticky z-40 shrink-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 px-4 pt-4"
            style={{ bottom: 'env(safe-area-inset-bottom)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          >
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <div>
                <span className="text-zinc-400">Selected: </span>
                <span className="font-bold text-green-400">{selectedCriteria.length}</span>
                <span className="text-zinc-600"> criteria</span>
              </div>
              <button
                onClick={() => {
                  setPhase('models')
                  generateBenchmarkName(selectedCriteria)
                }}
                disabled={selectedCriteria.length < 2}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedCriteria.length >= 2
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {selectedCriteria.length < 2 ? 'Select at least 2' : 'Choose Models →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Phase 2: Model Selection
  if (phase === 'models') {
    return (
      <div className="h-full bg-black text-white">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 pb-40">
              <div className="text-center mb-8">
                <button onClick={() => setPhase('criteria')} className="text-zinc-500 hover:text-white mb-4 inline-block">
                  ← Back to criteria
                </button>
                <h1 className="text-4xl font-bold mb-2">Select Models to Benchmark</h1>
                <p className="text-zinc-400">Pick the frontier models to evaluate</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {models.map(model => {
                  const selected = selectedModels.includes(model.id)
                  return (
                    <button
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      className={`p-4 rounded-xl text-left transition-all border border-zinc-800 ${
                        selected
                          ? 'bg-blue-900/50 ring-2 ring-blue-500 scale-[1.02]'
                          : 'bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800'
                      }`}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mb-2"
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="font-bold block">{model.name}</span>
                      <span className="text-zinc-500 text-sm">{model.org}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div 
            className="sticky z-40 shrink-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 px-4 pt-4"
            style={{ bottom: 'env(safe-area-inset-bottom)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          >
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div>
                <span className="text-zinc-400">Selected: </span>
                <span className="font-bold text-blue-400">{selectedModels.length}</span>
                <span className="text-zinc-600"> models</span>
              </div>
              <button
                onClick={() => setPhase('modifiers')}
                disabled={selectedModels.length < 2}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedModels.length >= 2
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {selectedModels.length < 2 ? 'Select at least 2' : 'Evaluation Settings →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Phase 3: Modifiers (Gaming the benchmark)
  if (phase === 'modifiers') {
    return (
      <div className="h-full bg-black text-white">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 pb-40">
              <div className="text-center mb-8">
                <button onClick={() => setPhase('models')} className="text-zinc-500 hover:text-white mb-4 inline-block">
                  ← Back to models
                </button>
                <h1 className="text-4xl font-bold mb-2">Evaluation Settings</h1>
                <p className="text-zinc-400">Optional: Fine-tune your methodology (just like real benchmarks!)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modifiers.map(mod => {
                  const selected = selectedModifiers.includes(mod.id)
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModifier(mod.id)}
                      className={`p-4 rounded-xl text-left transition-all border border-zinc-800 ${
                        selected
                          ? 'bg-purple-900/50 ring-2 ring-purple-500 scale-[1.02]'
                          : 'bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{mod.emoji}</span>
                        <div>
                          <span className="font-bold block">{mod.name}</span>
                          <span className="text-zinc-500 text-sm">{mod.description}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div 
            className="sticky z-40 shrink-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 px-4 pt-4"
            style={{ bottom: 'env(safe-area-inset-bottom)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          >
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div>
                <span className="text-zinc-400">Modifiers: </span>
                <span className="font-bold text-purple-400">{selectedModifiers.length}</span>
                <span className="text-zinc-600"> selected</span>
              </div>
              <button
                onClick={runBenchmark}
                className="px-6 py-3 rounded-lg font-bold transition-all bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
              >
                🚀 Run Benchmark
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Phase 4: Running
  if (phase === 'running') {
    return (
      <div className="h-full overflow-y-auto bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8">Running Benchmark...</h1>
          
          <div className="space-y-4 mb-8">
            {selectedModels.map(modelId => {
              const model = models.find(m => m.id === modelId)!
              const progress = modelProgress[modelId] || 0
              return (
                <div key={modelId} className="bg-zinc-900 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-zinc-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-200"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: model.color
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center">
            <p className="text-zinc-400 animate-pulse">{runMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  // Phase 5: Results
  const results = getResults()
  const winner = results[0]

  return (
    <div className="h-full overflow-y-auto bg-black text-white p-6">
      <ManipulationToast
        showManipulationToast={showManipulationToast}
        showArxivToast={showArxivToast}
      />
      <div className="max-w-4xl mx-auto">
        {/* Saveable Results Card */}
        <div ref={resultsRef} className="bg-black p-6 rounded-xl">
          <div className="text-center mb-8">
            <div 
              className="text-6xl mb-4 cursor-pointer select-none hover:scale-110 transition-transform"
              onClick={handleTrophyClick}
              title="Click me..."
            >
              🏆
            </div>
            {isEditingName ? (
              <input
                type="text"
                value={benchmarkName}
                onChange={(e) => setBenchmarkName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-3xl font-bold mb-2 bg-transparent border-b-2 border-zinc-600 focus:border-green-500 outline-none text-center w-full max-w-md"
                autoFocus
              />
            ) : (
              <h1 
                className="text-3xl font-bold mb-2 cursor-pointer hover:text-zinc-300 transition-colors group"
                onClick={() => setIsEditingName(true)}
                title="Click to rename"
              >
                {isGeneratingName ? (
                  <span className="text-zinc-500 animate-pulse">Generating name...</span>
                ) : (
                  <>
                    {benchmarkName || 'Benchmark Results'}
                    {manipulationMode && ' (Manipulated) 🎛️'}
                    <span className="text-zinc-600 text-sm ml-2 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                  </>
                )}
              </h1>
            )}
            <p className="text-zinc-400">
              Winner: <span className="text-yellow-400 font-bold">{winner.model.name}</span>
            </p>
            {selectedModifiers.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {selectedModifiers.map(modId => {
                  const mod = modifiers.find(m => m.id === modId)
                  return (
                    <span key={modId} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                      {mod?.emoji} {mod?.name}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mb-6">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-bold">Leaderboard</h2>
            </div>
            <div className="divide-y divide-zinc-800">
              {results.map((result, index) => (
                <div key={result.model.id} className="p-4 flex items-center gap-4">
                  <div className={`text-2xl font-bold w-8 ${
                    index === 0 ? 'text-yellow-400' : 
                    index === 1 ? 'text-zinc-400' : 
                    index === 2 ? 'text-amber-600' : 'text-zinc-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: result.model.color }}
                  />
                  <div className="flex-1">
                    <span className="font-medium">{result.model.name}</span>
                    <span className="text-zinc-500 text-sm ml-2">{result.model.org}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-mono font-bold">{result.avgScore.toFixed(1)}</span>
                    <span className="text-zinc-500 text-sm ml-1">avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Scores Table */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mb-6">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-bold">Scores by Criteria</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="p-3 text-left text-zinc-500">Criterion</th>
                    {results.map(r => (
                      <th key={r.model.id} className="p-3 text-center text-zinc-500 min-w-[80px]">
                        {r.model.name.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {selectedCriteria.map(criterionId => {
                    const criterion = allCriteria.find(c => c.id === criterionId)
                    if (!criterion) return null
                    const scores = results.map(r => {
                      const found = r.scores.find(s => s.criterionId === criterionId)
                      return found || { score: 0, ci: 0 }
                    })
                    const displayScores = scores.map((s, idx) => 
                      manipulationMode 
                        ? getManipulatedScore(results[idx].model.id, criterionId, s.score)
                        : s.score
                    )
                    const maxScore = Math.max(...displayScores)
                    
                    return (
                      <tr key={criterionId}>
                        <td className="p-3">
                          <span className="mr-2">{criterion.emoji}</span>
                          <span className="text-xs md:text-sm">{criterion.name}</span>
                        </td>
                        {scores.map((score, idx) => {
                          const modelId = results[idx].model.id
                          const displayScore = displayScores[idx]
                          return (
                            <td key={modelId} className="p-3 text-center">
                              {manipulationMode ? (
                                <div className="flex flex-col items-center gap-1">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={displayScore}
                                    onChange={(e) => setManipulatedScore(modelId, criterionId, parseInt(e.target.value))}
                                    className="w-16 h-2 accent-green-500 cursor-pointer"
                                  />
                                  <span className={displayScore === maxScore ? 'text-green-400 font-bold text-xs' : 'text-xs'}>
                                    {displayScore}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <span className={score.score === maxScore ? 'text-green-400 font-bold' : ''}>
                                    {score.score}
                                  </span>
                                  <span className="text-zinc-600 text-xs ml-1">±{score.ci}</span>
                                </>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Manipulation Mode Submit Button */}
        {manipulationMode && (
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-xl border border-red-800/50 p-6 mb-6">
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-4">
                Drag the sliders above to set any score you want. This is how easy benchmark manipulation can be.
              </p>
              <button
                onClick={handleArxivSubmit}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 rounded-lg font-bold transition-all"
              >
                📄 Submit to arXiv
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all"
          >
            Build Another Benchmark
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BenchmarkBuilder() {
  return (
    <Suspense fallback={
      <div className="h-full bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading benchmark...</div>
      </div>
    }>
      <BenchmarkBuilderInner />
    </Suspense>
  )
}
