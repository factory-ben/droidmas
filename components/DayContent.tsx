'use client';

import { getDayConfig, isDayUnlocked } from '@/lib/days-config';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const BenchmarkBuilder = dynamic(() => import('@/components/games/BenchmarkBuilder'), {
  loading: () => <div className="h-full flex items-center justify-center"><div className="text-xl">Loading...</div></div>
});

const InfiniteRightness = dynamic(() => import('@/components/games/InfiniteRightness'), {
  ssr: false,
  loading: () => <div className="h-full bg-zinc-950 flex items-center justify-center"><div className="text-xl text-white">Loading...</div></div>
});

const WhackAMerge = dynamic(() => import('@/components/games/WhackAMerge'), {
  loading: () => <div className="h-full flex items-center justify-center"><div className="text-xl">Loading...</div></div>
});

const PromptGame = dynamic(() => import('@/components/games/PromptGame'), {
  loading: () => <div className="h-full flex items-center justify-center"><div className="text-xl">Loading...</div></div>
});
const VibeCodingRace = dynamic(() => import('@/components/games/VibeCodingRace'), {
  loading: () => <div className="h-full flex items-center justify-center"><div className="text-xl">Loading...</div></div>
});

const ContextWindow = dynamic(() => import('@/components/games/ContextWindow'), {
  loading: () => <div className="h-full bg-black flex items-center justify-center"><div className="text-xl text-white">Loading...</div></div>
});
export default function DayContent({ day }: { day: number }) {
  const config = getDayConfig(day);
  const unlocked = isDayUnlocked(day);

  if (!config) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-text-muted">Day not found</h1>
          <Link href="/" className="text-factory-orange hover:underline">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-text-muted">Day {day} is locked</h1>
          <p className="text-text-muted">
            Unlocks on {config.unlockDate}
          </p>
          <Link href="/" className="text-factory-orange hover:underline block mt-4">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  // Day 1: Benchmark Builder
  if (day === 1) {
    return <BenchmarkBuilder />;
  }

  // Day 2: Infinite Rightness
  if (day === 2) {
    return <InfiniteRightness />;
  }

  // Day 3: Whack-a-Merge
  if (day === 3) {
    return <WhackAMerge />;
  }

  // Day 4: Prompt Game
  if (day === 4) {
    return <PromptGame />;
  }
  // Day 5: Vibe Coding Race
  if (day === 5) {
    return <VibeCodingRace />;
  }

  // Day 6: Context Window
  if (day === 6) {
    return <ContextWindow />;
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-factory-orange">Day {day}</h1>
        <h2 className="text-xl text-foreground">{config.title}</h2>
        <p className="text-text-muted">Game coming soon...</p>
      </div>
    </div>
  );
}
