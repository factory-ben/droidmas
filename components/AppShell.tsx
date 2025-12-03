'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DAYS_CONFIG, isDayUnlocked } from '@/lib/days-config';

type AppShellProps = {
  children: React.ReactNode;
};

const formatDay = (day: number) => day.toString().padStart(2, '0');

function DayLink({
  day,
  title,
  isActive,
  isUnlocked,
}: {
  day: number;
  title: string;
  isActive: boolean;
  isUnlocked: boolean;
}) {
  const content = (
    <div
      className={`rounded-xl border px-3 py-2.5 transition-colors duration-150 shadow-sm shadow-black/20 ${
        !isUnlocked
          ? 'border-border-dim/50 bg-surface/30 opacity-50 cursor-not-allowed'
          : isActive
            ? 'border-factory-orange bg-factory-orange/10'
            : 'border-border-dim bg-surface/60 hover:border-factory-orange/60'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.08em] text-text-muted">
            Day {formatDay(day)}
          </div>
          <div className="text-sm font-medium text-foreground">
            {title}
          </div>
        </div>
        <div
          className={`h-2 w-2 rounded-full ${
            !isUnlocked
              ? 'bg-border-dim'
              : isActive
                ? 'bg-factory-orange shadow-[0_0_0_6px] shadow-factory-orange/20'
                : 'bg-border'
          }`}
        />
      </div>
    </div>
  );

  if (!isUnlocked) {
    return <div className="block">{content}</div>;
  }

  return (
    <Link href={`/day/${day}`} className="group block">
      {content}
    </Link>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="h-screen bg-background text-foreground antialiased overflow-hidden">
      <div className="flex h-full w-full bg-surface/60 backdrop-blur">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border-dim bg-surface/80 flex flex-col">
          <div className="px-4 py-4">
            <Link href="/" className="block">
              <div className="text-lg font-bold text-factory-orange tracking-wide">DROIDMAS</div>
            </Link>
            <div className="text-[11px] uppercase tracking-[0.08em] text-text-muted mt-2">
              12 Days of Experiments
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
            {DAYS_CONFIG.map(day => (
              <DayLink
                key={day.day}
                day={day.day}
                title={day.title}
                isActive={pathname === `/day/${day.day}`}
                isUnlocked={isDayUnlocked(day.day)}
              />
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex h-full flex-1 flex-col">
          <main className="flex-1 overflow-hidden bg-gradient-to-b from-surface/30 via-background to-background">
            <div className="h-full w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
