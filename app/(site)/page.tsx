'use client';

import { DAYS_CONFIG, isDayUnlocked } from '@/lib/days-config';
import { DROIDMAS_ASCII } from '@/lib/ascii-logo';
import { PixelButton } from '@/components/PixelButton';

export default function Home() {
  const unlockedDays = DAYS_CONFIG.filter(d => isDayUnlocked(d.day));
  const nextDay = DAYS_CONFIG.find(d => !isDayUnlocked(d.day));

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="relative flex justify-center">
          <div className="absolute -inset-8 bg-orange-500 opacity-15 blur-3xl" />
          <pre 
            className="relative text-[8px] sm:text-[10px] md:text-[12px] leading-tight text-factory-orange whitespace-pre"
            style={{ fontFamily: 'Menlo, Monaco, "Courier New", monospace' }}
          >
            {DROIDMAS_ASCII}
          </pre>
        </div>

        <p className="text-text-muted text-sm">
          12 days. 12 experiments.
        </p>

        {unlockedDays.length > 0 ? (
          <div className="space-y-6">
            <p className="text-text-secondary">
              {unlockedDays.length} day{unlockedDays.length !== 1 ? 's' : ''} unlocked
            </p>
            <PixelButton href={`/day/${unlockedDays[unlockedDays.length - 1].day}`}>
              ▶ PLAY LATEST
            </PixelButton>
          </div>
        ) : (
          <div className="space-y-6">
            <PixelButton disabled>
              🔒 COMING SOON
            </PixelButton>
            <p className="text-zinc-600 text-xs font-mono">
              December 4th, 2025
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
