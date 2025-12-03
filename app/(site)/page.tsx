'use client';

import { DAYS_CONFIG, isDayUnlocked } from '@/lib/days-config';
import { PixelButton } from '@/components/PixelButton';
import { PixelLogoLarge } from '@/components/PixelLogo';

export default function Home() {
  const unlockedDays = DAYS_CONFIG.filter(d => isDayUnlocked(d.day));
  const nextDay = DAYS_CONFIG.find(d => !isDayUnlocked(d.day));

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="relative flex justify-center">
          <div className="absolute -inset-8 bg-orange-500 opacity-15 blur-3xl" />
          <PixelLogoLarge className="relative" />
        </div>

        <p className="text-text-muted text-sm">
          Twelve days. Twelve experiments. One page experiences.
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
            <p className="text-text-secondary">
              First door opens {nextDay?.unlockDate || 'soon'}
            </p>
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
