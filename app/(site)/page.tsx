'use client';

import { DAYS_CONFIG, isDayUnlocked } from '@/lib/days-config';
import Link from 'next/link';

export default function Home() {
  const unlockedDays = DAYS_CONFIG.filter(d => isDayUnlocked(d.day));
  const nextDay = DAYS_CONFIG.find(d => !isDayUnlocked(d.day));

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-lg">
        <div>
          <h1 className="text-4xl font-bold text-factory-orange mb-2">DROIDMAS</h1>
          <p className="text-text-muted">
            Twelve days. Twelve experiments. One page experiences.
          </p>
        </div>

        {unlockedDays.length > 0 ? (
          <div className="space-y-4">
            <p className="text-text-secondary">
              {unlockedDays.length} day{unlockedDays.length !== 1 ? 's' : ''} unlocked
            </p>
            <Link
              href={`/day/${unlockedDays[unlockedDays.length - 1].day}`}
              className="inline-block px-6 py-3 bg-factory-orange text-background font-medium rounded-lg hover:bg-factory-light transition-colors"
            >
              Play Latest →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-text-secondary">
              First door opens {nextDay?.unlockDate || 'soon'}
            </p>
            <div className="px-6 py-3 border border-border-dim text-text-muted rounded-lg">
              Coming Soon
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
