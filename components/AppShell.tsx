'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { DAYS_CONFIG, isDayUnlocked } from '@/lib/days-config';
import { DROIDMAS_ASCII } from '@/lib/ascii-logo';
import Snowfall from './Snowfall';

type AppShellProps = {
  children: React.ReactNode;
};

const formatDay = (day: number) => day.toString().padStart(2, '0');

function DayLink({
  day,
  title,
  isActive,
  isUnlocked,
  onClick,
}: {
  day: number;
  title: string;
  isActive: boolean;
  isUnlocked: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div
      className={`rounded-lg border px-3 py-2 transition-colors duration-150 ${
        !isUnlocked
          ? 'border-border-dim/50 bg-surface/30 opacity-50 cursor-not-allowed'
          : isActive
            ? 'border-factory-orange bg-factory-orange/10'
            : 'border-border-dim bg-surface/60 hover:border-factory-orange/60'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase tracking-wide text-text-muted shrink-0">
            {formatDay(day)}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {title}
          </span>
        </div>
        <div
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
            !isUnlocked
              ? 'bg-border-dim'
              : isActive
                ? 'bg-factory-orange'
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
    <Link href={`/day/${day}`} className="group block" onClick={onClick}>
      {content}
    </Link>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="w-5 h-4 flex flex-col justify-between">
      <span className={`block h-0.5 w-full bg-current transition-transform ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
      <span className={`block h-0.5 w-full bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
      <span className={`block h-0.5 w-full bg-current transition-transform ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
    </div>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen bg-background text-foreground antialiased overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border-dim bg-surface/80">
        <Link href="/" className="text-factory-orange font-bold">
          DROIDMAS
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-foreground p-1"
          aria-label="Toggle menu"
        >
          <HamburgerIcon open={sidebarOpen} />
        </button>
      </div>

      <div className="flex h-full md:h-screen w-full bg-surface/60 backdrop-blur">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-64 md:w-56 border-r border-border-dim bg-surface/95 md:bg-surface/80 
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Desktop: ASCII Logo */}
          <div className="hidden md:block px-3 py-3">
            <Link href="/" className="block overflow-hidden">
              <pre 
                className="text-factory-orange whitespace-pre leading-none text-[3.5px]"
                style={{ fontFamily: 'Menlo, Monaco, "Courier New", monospace' }}
              >
                {DROIDMAS_ASCII}
              </pre>
            </Link>
          </div>

          {/* Mobile: Simple header */}
          <div className="md:hidden px-3 py-3 border-b border-border-dim">
            <div className="text-[11px] uppercase tracking-[0.08em] text-text-muted">
              12 Days of Experiments
            </div>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto px-2 py-2">
            {DAYS_CONFIG.map(day => (
              <DayLink
                key={day.day}
                day={day.day}
                title={day.title}
                isActive={pathname === `/day/${day.day}`}
                isUnlocked={isDayUnlocked(day.day)}
                onClick={closeSidebar}
              />
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex h-full flex-1 flex-col relative">
          {pathname === '/' && <Snowfall />}
          <main className="flex-1 overflow-hidden bg-gradient-to-b from-surface/30 via-background to-background">
            <div className="h-full w-full relative z-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
