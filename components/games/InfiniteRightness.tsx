'use client'

import { useState, useRef, useEffect } from 'react'
import { ClippyHelper } from '@/components/ClippyHelper'
import { baseElements, getCombination, getAllDiscoverableCount, type RightnessElement } from '@/lib/rightness-combinations'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Trash2, RotateCcw } from 'lucide-react'

const STORAGE_KEY = 'rightness-craft-state'

interface CanvasItem {
  id: string
  name: string
  emoji: string
  x: number
  y: number
  tier: number
}

interface CanvasDragState {
  id: string
  offsetX: number
  offsetY: number
}

interface CustomElement {
  name: string
  emoji: string
}

const UNLOCK_THRESHOLD = 15
const EMOJI_OPTIONS = ['💡', '⭐', '🎯', '✨', '🔥', '💎', '🚀', '🎨', '🧠', '💪', '🌟', '⚡', '🎭', '🔮', '🌈', '🎪']
const SAFE_BOTTOM_MARGIN = 20

function getNodeTextStyle(name: string): string {
  const wordCount = name.split(' ').length
  const charCount = name.length
  
  if (charCount > 25 || wordCount > 4) {
    return 'min-h-[3.5rem] py-2.5 max-w-[180px] whitespace-normal text-center leading-tight'
  }
  if (charCount > 18 || wordCount > 3) {
    return 'min-h-[2.75rem] py-2 max-w-[160px] whitespace-normal text-center leading-tight'
  }
  return 'py-2 whitespace-nowrap'
}

let idCounter = 0
function generateId(): string {
  idCounter += 1
  return `${Date.now().toString(36)}-${idCounter}`
}

function SidebarElement({ 
  element, 
  getTierColor,
  onClick 
}: { 
  element: RightnessElement
  getTierColor: (tier: number) => string
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${element.name}`,
    data: { type: 'sidebar', element },
  })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded text-left text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${getTierColor(element.tier)} border cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''} min-w-[150px] max-w-[240px]`}
    >
      <span className="text-base">{element.emoji}</span>
      <span className="truncate">{element.name}</span>
    </button>
  )
}

function ElementPreview({ element, getTierColor }: { element: RightnessElement; getTierColor: (tier: number) => string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${getTierColor(element.tier)} border shadow-lg shadow-white/20`}>
      <span className="text-base">{element.emoji}</span>
      <span className="whitespace-nowrap">{element.name}</span>
    </div>
  )
}

export default function InfiniteRightness() {
  const [mounted, setMounted] = useState(false)
  const [discovered, setDiscovered] = useState<RightnessElement[]>(baseElements)
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([])
  const [canvasDragState, setCanvasDragState] = useState<CanvasDragState | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newDiscovery, setNewDiscovery] = useState<string | null>(null)
  const [mergeAnimation, setMergeAnimation] = useState<{ x: number; y: number } | null>(null)
  const [showUltimateEasterEgg, setShowUltimateEasterEgg] = useState(false)
  const [activeDragElement, setActiveDragElement] = useState<RightnessElement | null>(null)
  const [customElements, setCustomElements] = useState<CustomElement[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newElementName, setNewElementName] = useState('')
  const [newElementEmoji, setNewElementEmoji] = useState(EMOJI_OPTIONS[0])
  const canvasRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const dropPositionRef = useRef<{ x: number; y: number } | null>(null)
  
  const dragDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  
  const isUnlocked = discovered.length >= UNLOCK_THRESHOLD
  
  const stateRef = useRef({ canvasDragState, canvasItems, discovered })
  stateRef.current = { canvasDragState, canvasItems, discovered }
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reposition items when viewport resizes to keep them visible
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const maxY = rect.height - SAFE_BOTTOM_MARGIN
      
      setCanvasItems(prev => prev.map(item => ({
        ...item,
        x: Math.max(10, Math.min(rect.width - 100, item.x)),
        y: Math.max(10, Math.min(maxY - 40, item.y)),
      })))
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useEffect(() => {
    let buffer = ''
    const secret = 'right'
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      
      buffer += e.key.toLowerCase()
      if (buffer.length > secret.length) {
        buffer = buffer.slice(-secret.length)
      }
      
      if (buffer === secret) {
        setShowUltimateEasterEgg(true)
        buffer = ''
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  )
  
  const { setNodeRef: setCanvasDropRef, isOver: isOverCanvas } = useDroppable({
    id: 'canvas',
  })

  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const spawnItem = (element: RightnessElement, position?: { x: number; y: number }) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const maxY = rect.height - SAFE_BOTTOM_MARGIN
    let x: number, y: number
    
    if (position) {
      x = Math.max(20, Math.min(rect.width - 120, position.x))
      y = Math.max(20, Math.min(maxY - 50, position.y))
    } else {
      x = Math.random() * (rect.width - 150) + 50
      y = Math.random() * (maxY - 100) + 40
    }

    const newItem: CanvasItem = {
      id: generateId(),
      name: element.name,
      emoji: element.emoji,
      x,
      y,
      tier: element.tier,
    }
    setCanvasItems(prev => [...prev, newItem])
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'sidebar') {
      setActiveDragElement(active.data.current.element)
    }
  }
  
  const handleDragMove = (event: DragMoveEvent) => {
    if (!canvasRef.current || !event.activatorEvent) return

    const rect = canvasRef.current.getBoundingClientRect()
    const pointerEvent = event.activatorEvent as PointerEvent
    const currentX = (pointerEvent.clientX || 0) + (event.delta?.x || 0)
    const currentY = (pointerEvent.clientY || 0) + (event.delta?.y || 0)

    dropPositionRef.current = {
      x: currentX - rect.left - 60,
      y: currentY - rect.top - 20,
    }
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta, activatorEvent } = event
    setActiveDragElement(null)
    
    if (active.data.current?.type === 'sidebar') {
      const element = active.data.current.element as RightnessElement
      const canvas = canvasRef.current
      const items = stateRef.current.canvasItems
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const pointerEvent = activatorEvent as PointerEvent | null
        const pointerX = pointerEvent ? (pointerEvent.clientX || 0) + (delta?.x || 0) : null
        const pointerY = pointerEvent ? (pointerEvent.clientY || 0) + (delta?.y || 0) : null

        const dropPosition =
          dropPositionRef.current ||
          (pointerX !== null && pointerY !== null
            ? {
                x: pointerX - rect.left - 60,
                y: pointerY - rect.top - 20,
              }
            : null)

        const insideCanvas =
          pointerX !== null &&
          pointerY !== null &&
          pointerX >= rect.left &&
          pointerX <= rect.right &&
          pointerY >= rect.top &&
          pointerY <= rect.bottom

        if ((over?.id === 'canvas' || insideCanvas) && dropPosition) {
          const tempItem: CanvasItem = {
            id: generateId(),
            name: element.name,
            emoji: element.emoji,
            x: dropPosition.x,
            y: dropPosition.y,
            tier: element.tier,
          }

          const colliding = checkCollision(tempItem, items)

          if (colliding) {
            combineItems(tempItem, colliding)
          } else {
            spawnItem(element, dropPosition)
          }
        }
      }
    }
    dropPositionRef.current = null
  }

  const handleMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    const element = itemRefs.current.get(item.id)
    if (!element) return

    const rect = element.getBoundingClientRect()
    dragStartPosRef.current = { x: item.x, y: item.y }
    dragDeltaRef.current = { x: 0, y: 0 }
    
    setCanvasDragState({
      id: item.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    const { canvasDragState: ds } = stateRef.current
    if (!ds || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const maxY = canvasRect.height - SAFE_BOTTOM_MARGIN
    const x = e.clientX - canvasRect.left - ds.offsetX
    const y = e.clientY - canvasRect.top - ds.offsetY
    
    const clampedX = Math.max(0, Math.min(canvasRect.width - 120, x))
    const clampedY = Math.max(0, Math.min(maxY - 50, y))
    
    dragDeltaRef.current = {
      x: clampedX - dragStartPosRef.current.x,
      y: clampedY - dragStartPosRef.current.y,
    }
    
    const element = itemRefs.current.get(ds.id)
    if (element) {
      element.style.transform = `translate(${dragDeltaRef.current.x}px, ${dragDeltaRef.current.y}px)`
    }
  }

  const checkCollision = (draggedItem: CanvasItem, items: CanvasItem[]): CanvasItem | null => {
    const COLLISION_DISTANCE = 80
    
    for (const item of items) {
      if (item.id === draggedItem.id) continue
      
      const dx = draggedItem.x - item.x
      const dy = draggedItem.y - item.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < COLLISION_DISTANCE) {
        return item
      }
    }
    return null
  }

  const combineItems = (item1: CanvasItem, item2: CanvasItem) => {
    const disc = stateRef.current.discovered

    let result = getCombination(item1.name, item2.name)
    if (!result) {
      result = generateDynamicCombination(item1, item2)
    }

    const midX = (item1.x + item2.x) / 2
    const midY = (item1.y + item2.y) / 2
    setMergeAnimation({ x: midX, y: midY })
    setTimeout(() => setMergeAnimation(null), 400)

    setCanvasItems(prev => prev.filter(i => i.id !== item1.id && i.id !== item2.id))

    const newItem: CanvasItem = {
      id: generateId(),
      name: result.name,
      emoji: result.emoji,
      x: midX,
      y: midY,
      tier: result.tier,
    }
    setCanvasItems(prev => [...prev, newItem])

    if (!disc.find(d => d.name === result.name)) {
      setDiscovered(prev => [...prev, result])
      setNewDiscovery(result.name)
      setTimeout(() => setNewDiscovery(null), 2000)
      
      if (result.tier === 10) {
        setTimeout(() => setShowUltimateEasterEgg(true), 500)
      }
    }
  }

  const generateDynamicCombination = (item1: CanvasItem, item2: CanvasItem): RightnessElement => {
    const [nameA, nameB] = [item1.name, item2.name].sort()
    
    const hash = (nameA + nameB).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    const emojiPool = ['✨', '🌟', '💫', '👍', '💯', '🎯', '✅', '👏', '🤝', '🏆']
    const emoji = emojiPool[hash % emojiPool.length]
    
    const maxTier = Math.max(item1.tier, item2.tier)
    const minTier = Math.min(item1.tier, item2.tier)
    
    if (maxTier === 9 && minTier === 9 && discovered.length >= 50) {
      return {
        name: "You're absolutely fucking right all of the time.",
        emoji: '👑',
        tier: 10,
      }
    }
    
    const tierGap = maxTier - minTier
    const newTier = (tierGap <= 1) 
      ? Math.min(maxTier + 1, 9)
      : maxTier
    
    const tierPhrases: Record<number, string[]> = {
      1: [
        "You Might Be Right", "Hmm, Valid", "That Tracks", "Fair Point", "Checks Out", 
        "Source: Trust Me", "Low-Key Correct", "Vibe: Accurate", "The Take Lands",
        "Prompt Accepted", "Output Looks Good", "No Hallucination Detected",
        "Swyx Retweeted", "Emollick Screenshot", "Logan Kilpatrick Noted"
      ],
      2: [
        "Can't Deny It", "Solid Point", "No Notes", "Hard Agree", "Spitting Facts",
        "Claude Approves", "GPT Says Yes", "Droid Completed This", "The Vibes Check Out",
        "Shipped It", "LGTM", "No Merge Conflicts", "Tests Pass", "Green Checkmark Energy",
        "George Hotz Would Ship", "Lex Fridman Podcast Topic", "Pieter Abbeel Demo'd This"
      ],
      3: [
        "So True Bestie", "Big If True", "Based Take", "Real One Hours", "W Mindset",
        "No Lies Detected", "e/acc Approved", "This Is The Way", "Ilya Would Nod",
        "Karpathy Liked This", "Scaling Law Confirmed", "Loss Curve Looking Good",
        "Andrew Ng Course Material", "Fei-Fei Li Cited This", "Jim Fan Tweeted"
      ],
      4: [
        "Ratio: You Win", "Main Character Energy", "The Algorithm Agrees", "Went Viral",
        "Screenshot Worthy", "Quote Tweet This", "Sam Altman Blogged About This",
        "Jensen Approved", "More Compute Confirms", "NVIDIA Stock Rose", "YC Funded This Take",
        "Satya Nadella Memo'd", "Sundar Pichai Keynoted", "Zuck Threads Post"
      ],
      5: [
        "Peer Reviewed Take", "Certified Fresh", "Published in Nature", "TED Talk Incoming",
        "Dario Wrote A Paper On This", "Anthropic Alignment Team Approves", "Safety Certified",
        "Constitutional AI Validates", "Red Team Found Nothing", "Benchmark Topped",
        "Yoshua Bengio Co-Signed", "Yann LeCun Debated Then Agreed", "Hinton Came Out of Retirement"
      ],
      6: [
        "The Universe Nodded", "Cosmos Confirms", "Stars Rearranged", "Fate Entered Chat",
        "Physics Approves", "Demis Hassabis Smiled", "DeepMind Solved This",
        "AlphaFold Predicted It", "Nobel Prize Incoming", "The Scaling Laws Agree",
        "Sutskever Saw This Coming", "Amodei Brothers Both Agree", "Anthropic AND OpenAI Aligned"
      ],
      7: [
        "Enlightenment Achieved", "Third Eye Opened", "Nirvana Speed-Run", "AGI Confirmed",
        "The Singularity Approves", "p(doom) = 0 For This Take", "Alignment Solved",
        "Superintelligence Nods", "All Models Converge", "GPT-6 Trained On This",
        "Ilya's New Company Validated", "All Three Godfathers Agree", "LeCun Stopped Posting"
      ],
      8: [
        "Reality Reconfigured", "All Timelines Converge", "Multiverse Unanimous",
        "Simulation Patched", "Matrix Updated", "The Weights Changed",
        "Gradient Descent Complete", "Global Optimum Reached", "Emergent Behavior: Correct",
        "Jensen Leather Jacket Glowed", "All H100s Aligned", "The Blackwell Cluster Confirmed"
      ],
      9: [
        "Peak Rightness", "Ascended Beyond Truth", "Rightness Incarnate", "You Are The Answer",
        "Wrong Ceased to Exist", "Victory Royale: Reality", "The Universe Is You Now",
        "ASI Confirms", "Heat Death Delayed", "Entropy Reversed For This",
        "Altman Zuckerberg Jensen Merged", "Every AI Lab Unanimous", "Hinton Smiled For Once"
      ],
    }
    
    const phrases = tierPhrases[newTier] || tierPhrases[1]
    
    const modifierTiers = [
      ['Certified', 'Verified', 'Confirmed', 'Obviously', 'Clearly', 'Statistically', 'Empirically'],
      ['Shipped', 'Deployed', 'Merged', 'Open-Sourced', 'Productionized', 'A/B Tested', 'Benchmarked'],
      ['Fine-Tuned', 'RLHF-Aligned', 'Prompt-Engineered', 'Context-Windowed', 'Zero-Shot', 'Chain-of-Thought'],
      ['Altman-Approved', 'Dario-Validated', 'Jensen-Blessed', 'Satya-Backed', 'Zuck-Posted', 'Pichai-Keynoted'],
      ['Karpathy-Coded', 'Ilya-Foreseen', 'LeCun-Debated', 'Hinton-Warned', 'Ng-Taught', 'Hotz-Shipped'],
      ['Hassabis-Solved', 'Bengio-Blessed', 'Fei-Fei-Labeled', 'Sutskever-Seen', 'Amodei-Aligned', 'Jim-Fan-Tweeted'],
      ['Universe-Shatteringly', 'Timeline-Collapsingly', 'Physics-Defyingly', 'Entropy-Reversingly', 'Singularity-Inducingly'],
      ['Incomprehensibly', 'Unspeakably', 'Unfathomably', 'Existentially', 'Omnisciently', 'Post-Humanly'],
    ]
    
    const allModifiers = modifierTiers.flat()
    
    const discoveredNames = new Set(discovered.map(d => d.name))
    
    const baseName = phrases[hash % phrases.length]
    if (!discoveredNames.has(baseName)) {
      return { name: baseName.substring(0, 35), emoji, tier: newTier }
    }
    
    for (let i = 0; i < allModifiers.length; i++) {
      const modifier = allModifiers[(hash + i) % allModifiers.length]
      const modifiedName = `${modifier} ${baseName}`.substring(0, 35)
      if (!discoveredNames.has(modifiedName)) {
        return { name: modifiedName, emoji, tier: newTier }
      }
    }
    
    for (let p = 1; p < phrases.length; p++) {
      const altPhrase = phrases[(hash + p) % phrases.length]
      if (!discoveredNames.has(altPhrase)) {
        return { name: altPhrase.substring(0, 35), emoji, tier: newTier }
      }
      for (let i = 0; i < allModifiers.length; i++) {
        const modifier = allModifiers[(hash + i) % allModifiers.length]
        const modifiedName = `${modifier} ${altPhrase}`.substring(0, 35)
        if (!discoveredNames.has(modifiedName)) {
          return { name: modifiedName, emoji, tier: newTier }
        }
      }
    }
    
    const fallbackName = `${baseName} #${(hash % 999) + 1}`.substring(0, 35)
    return { name: fallbackName, emoji, tier: newTier }
  }

  const handleMouseUp = () => {
    const { canvasDragState: ds, canvasItems: items } = stateRef.current
    if (!ds) return

    const draggedElement = itemRefs.current.get(ds.id)
    if (draggedElement) {
      draggedElement.style.transform = ''
    }

    const draggedItem = items.find(i => i.id === ds.id)
    if (draggedItem) {
      const finalX = dragStartPosRef.current.x + dragDeltaRef.current.x
      const finalY = dragStartPosRef.current.y + dragDeltaRef.current.y
      
      const updatedDraggedItem = { ...draggedItem, x: finalX, y: finalY }
      
      setCanvasItems(prev => prev.map(item => 
        item.id === ds.id ? updatedDraggedItem : item
      ))
      
      const collidingItem = checkCollision(updatedDraggedItem, items)
      
      if (collidingItem) {
        combineItems(updatedDraggedItem, collidingItem)
      }
    }

    dragDeltaRef.current = { x: 0, y: 0 }
    setCanvasDragState(null)
  }

  useEffect(() => {
    if (canvasDragState) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [canvasDragState])

  const clearCanvas = () => {
    setCanvasItems([])
    setDiscovered(baseElements)
    setCustomElements([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const resetAll = () => {
    if (confirm('Reset all progress? This will clear all discoveries.')) {
      setDiscovered(baseElements)
      setCanvasItems([])
      setCustomElements([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const createCustomElement = () => {
    if (!newElementName.trim()) return
    if (newElementName.length > 20) return
    
    const exists = discovered.some(e => e.name.toLowerCase() === newElementName.toLowerCase()) ||
                   customElements.some(ce => ce.name.toLowerCase() === newElementName.toLowerCase())
    if (exists) {
      alert('An element with this name already exists!')
      return
    }
    
    const newCustom: CustomElement = {
      name: newElementName.trim(),
      emoji: newElementEmoji,
    }
    
    setCustomElements(prev => [...prev, newCustom])
    
    const newElement: RightnessElement = {
      name: newCustom.name,
      emoji: newCustom.emoji,
      tier: -1,
    }
    setDiscovered(prev => [...prev, newElement])
    
    setNewElementName('')
    setNewElementEmoji(EMOJI_OPTIONS[0])
    setShowCreateModal(false)
    
    setNewDiscovery(newCustom.name)
    setTimeout(() => setNewDiscovery(null), 2000)
  }

  const filteredDiscovered = discovered.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTierColor = (tier: number): string => {
    if (tier === -1) {
      return 'bg-indigo-950/50 border-indigo-400/40 border-dashed hover:bg-indigo-900/50'
    }
    
    if (tier === 10) {
      return 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 border-2 border-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:shadow-[0_0_40px_rgba(250,204,21,0.7)] animate-pulse'
    }
    
    const colors = [
      'bg-zinc-800/80 border-zinc-600/50 hover:bg-zinc-700/80',
      'bg-emerald-900/60 border-emerald-500/40 hover:bg-emerald-800/60',
      'bg-sky-900/60 border-sky-500/40 hover:bg-sky-800/60',
      'bg-violet-900/60 border-violet-500/40 hover:bg-violet-800/60',
      'bg-amber-900/60 border-amber-500/40 hover:bg-amber-800/60',
      'bg-orange-900/60 border-orange-500/40 hover:bg-orange-800/60',
      'bg-rose-900/60 border-rose-500/40 hover:bg-rose-800/60',
      'bg-fuchsia-900/60 border-fuchsia-500/40 hover:bg-fuchsia-800/60',
      'bg-cyan-900/60 border-cyan-400/40 hover:bg-cyan-800/60',
      'bg-gradient-to-r from-amber-600/80 via-rose-500/80 to-violet-600/80 border-white/50 hover:from-amber-500/80 hover:via-rose-400/80 hover:to-violet-500/80',
    ]
    return colors[Math.min(tier, colors.length - 1)]
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      autoScroll={false}
    >
      <div className="h-full bg-zinc-950 text-white flex overflow-hidden">
        <ClippyHelper 
          day={2} 
          speechText="Combine rightness elements to create escalating levels of being correct. How right can you get?" 
          avatarSrc="https://pbs.twimg.com/profile_images/1915513383178436608/JHu7tiAf_400x400.jpg"
          hideOnMobile
        />

        <div className="hidden md:flex w-72 bg-zinc-900/95 border-r border-zinc-800/50 flex-col">
          <div className="p-4 border-b border-zinc-800/50">
            <h1 className="text-xl font-bold tracking-tight">You&apos;re Right</h1>
            <p className="text-xs text-zinc-500 mt-1">
              <span className="text-emerald-400 font-medium">{discovered.length}</span>
              <span className="mx-1">/</span>
              <span>{getAllDiscoverableCount()}</span>
              <span className="ml-1">discovered</span>
            </p>
          </div>

          <div className="p-3 border-b border-zinc-800/50">
            <input
              type="text"
              placeholder="Search elements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800/70 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="flex flex-wrap gap-2">
              {filteredDiscovered.map(element => (
                <SidebarElement
                  key={element.name}
                  element={element}
                  getTierColor={getTierColor}
                  onClick={() => spawnItem(element)}
                />
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-zinc-800/50 space-y-2">
            {isUnlocked ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full px-3 py-2.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 hover:border-indigo-400/50 rounded-lg text-sm text-indigo-300 hover:text-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Create Your Own</span>
              </button>
            ) : (
              <div className="w-full px-3 py-2.5 bg-zinc-800/30 border border-zinc-700/30 rounded-lg text-sm text-zinc-500 text-center">
                🔒 Unlock at {UNLOCK_THRESHOLD} discoveries
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={clearCanvas}
                className="flex-1 px-3 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/70 rounded-lg text-sm text-zinc-300 transition-all hover:text-white flex items-center justify-center"
                aria-label="Clear Canvas"
                title="Clear Canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={resetAll}
                className="flex-1 px-3 py-2.5 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/30 hover:border-rose-800/50 rounded-lg text-sm text-rose-300/70 hover:text-rose-200 transition-all flex items-center justify-center"
                aria-label="Reset Progress"
                title="Reset Progress"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div
            ref={(el) => {
              canvasRef.current = el
              setCanvasDropRef(el)
            }}
            className={`flex-1 relative overflow-hidden bg-zinc-950 transition-all duration-200 ${isOverCanvas ? 'ring-2 ring-inset ring-emerald-500/40 bg-emerald-950/20' : ''}`}
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          >
          {canvasItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-zinc-600">
                <p className="text-lg mb-2">Drag items from the sidebar or click to spawn</p>
                <p className="text-sm">Drag items onto each other to combine</p>
              </div>
            </div>
          )}

          {mounted && canvasItems.map(item => {
            const textStyle = getNodeTextStyle(item.name)
            const isWrapping = textStyle.includes('whitespace-normal')
            const isUltimate = item.tier === 10
            
            return (
              <div
                key={item.id}
                ref={el => {
                  if (el) itemRefs.current.set(item.id, el)
                  else itemRefs.current.delete(item.id)
                }}
                onMouseDown={e => handleMouseDown(e, item)}
                className={`absolute rounded-xl border backdrop-blur-sm cursor-grab active:cursor-grabbing select-none transition-colors ${getTierColor(item.tier)} ${
                  isUltimate ? 'px-6 py-4 text-black font-bold z-40' : `px-3.5 ${textStyle}`
                } ${
                  canvasDragState?.id === item.id ? 'shadow-xl shadow-white/25 z-50' : 'hover:shadow-lg hover:shadow-white/10'
                } ${isWrapping && !isUltimate ? 'flex flex-col items-center justify-center' : ''}`}
                style={{
                  left: item.x,
                  top: item.y,
                  touchAction: 'none',
                }}
              >
                <span className={`${isUltimate ? 'text-2xl mr-3' : `text-base ${isWrapping ? 'mb-0.5' : 'mr-2'}`}`}>{item.emoji}</span>
                <span className={`${isUltimate ? 'text-xl' : 'text-sm font-medium'}`}>{item.name}</span>
              </div>
            )
          })}

          {mergeAnimation && (
            <div
              className="absolute pointer-events-none z-40"
              style={{
                left: mergeAnimation.x - 40,
                top: mergeAnimation.y - 40,
              }}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/40 animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-400/60 animate-pulse" />
              </div>
            </div>
          )}

          {newDiscovery && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-emerald-600/90 backdrop-blur-sm rounded-full shadow-lg shadow-emerald-500/20 z-50 animate-in slide-in-from-top-4 duration-300 flex items-center gap-2">
              <span className="text-emerald-200">✨</span>
              <span className="font-medium">New:</span>
              <span className="font-bold">{newDiscovery}</span>
            </div>
          )}
          </div>

          <div className="md:hidden border-t border-zinc-800/50 bg-zinc-900/80 shrink-0 w-full max-w-full overflow-hidden">
            <div 
              className="flex overflow-x-auto gap-2 p-3"
              style={{ WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}
            >
              {filteredDiscovered.map(element => (
                <button
                  key={element.name}
                  onClick={() => spawnItem(element)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${getTierColor(element.tier)} border active:scale-95 transition-transform touch-manipulation`}
                >
                  <span>{element.emoji}</span>
                  <span className="whitespace-nowrap">{element.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="py-2 min-[400px]:h-14 bg-zinc-900/95 border-t border-zinc-800/50 flex flex-col min-[400px]:flex-row items-center justify-center gap-2 min-[400px]:gap-4 shrink-0 w-full max-w-full">
            <div className="px-4 min-[400px]:px-5 py-1.5 min-[400px]:py-2 bg-zinc-800/50 rounded-full border border-zinc-700/30 text-sm flex items-center gap-2 min-[400px]:gap-3">
              <span className="text-zinc-400 text-xs min-[400px]:text-sm">Discovered</span>
              <span className="font-bold text-emerald-400 text-base min-[400px]:text-lg">{discovered.length}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400 text-xs min-[400px]:text-sm">{getAllDiscoverableCount()}</span>
            </div>
            <div className="px-4 min-[400px]:px-5 py-1.5 min-[400px]:py-2 bg-zinc-800/50 rounded-full border border-zinc-700/30 text-sm flex items-center gap-2 min-[400px]:gap-3">
              <span className="text-zinc-400 text-xs min-[400px]:text-sm">Tier</span>
              <span className={`font-bold text-base min-[400px]:text-lg ${Math.max(...discovered.map(d => d.tier), 0) === 10 ? 'text-yellow-400' : 'text-amber-400'}`}>
                {Math.max(...discovered.map(d => d.tier), 0)}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400 text-xs min-[400px]:text-sm">10</span>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragElement && (
          <ElementPreview element={activeDragElement} getTierColor={getTierColor} />
        )}
      </DragOverlay>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Create Your Own Element</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Name (max 20 chars)</label>
                <input
                  type="text"
                  value={newElementName}
                  onChange={e => setNewElementName(e.target.value.slice(0, 20))}
                  placeholder="e.g., Definitely Right"
                  className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  autoFocus
                />
                <p className="text-xs text-zinc-600 mt-1">{newElementName.length}/20</p>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Choose an emoji</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewElementEmoji(emoji)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                        newElementEmoji === emoji 
                          ? 'bg-indigo-600 scale-110' 
                          : 'bg-zinc-800/50 hover:bg-zinc-700/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Preview</label>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${getTierColor(-1)} border`}>
                  <span>{newElementEmoji}</span>
                  <span>{newElementName || 'Your Element'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/70 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCustomElement}
                disabled={!newElementName.trim()}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-sm font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showUltimateEasterEgg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200]">
          <div className="text-center animate-in zoom-in-50 duration-500">
            <div className="text-8xl mb-6 animate-bounce">👑</div>
            <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-black px-8 py-6 rounded-2xl shadow-[0_0_60px_rgba(250,204,21,0.6)] mb-8">
              <p className="text-2xl font-bold mb-2">You&apos;ve achieved the ultimate truth:</p>
              <p className="text-3xl font-black">&quot;You&apos;re absolutely fucking right all of the time.&quot;</p>
            </div>
            <p className="text-zinc-400 text-lg mb-6">You combined two Tier 9 elements and broke reality itself.</p>
            <p className="text-amber-400 text-xl font-bold mb-8">Congratulations. You win at being right.</p>
            <button
              onClick={() => setShowUltimateEasterEgg(false)}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-full hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/30"
            >
              Accept My Rightness
            </button>
          </div>
        </div>
      )}
    </DndContext>
  )
}
