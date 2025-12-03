export interface DayConfig {
  day: number;
  title: string;
  unlockDate: string; // ISO date string (YYYY-MM-DD)
}

// All 12 days - games will be added via PRs as each day arrives
export const DAYS_CONFIG: DayConfig[] = [
  { day: 1, title: "Benchmarks", unlockDate: "2025-12-04" },
  { day: 2, title: "You're Wrong", unlockDate: "2025-12-05" },
  { day: 3, title: "Whack-a-Merge", unlockDate: "2025-12-06" },
  { day: 4, title: "Prompts", unlockDate: "2025-12-07" },
  { day: 5, title: "Vibing", unlockDate: "2025-12-08" },
  { day: 6, title: "Context", unlockDate: "2025-12-09" },
  { day: 7, title: "Talent", unlockDate: "2025-12-10" },
  { day: 8, title: "Tech Debt", unlockDate: "2025-12-11" },
  { day: 9, title: "Memory", unlockDate: "2025-12-12" },
  { day: 10, title: "Typing", unlockDate: "2025-12-13" },
  { day: 11, title: "Cost", unlockDate: "2025-12-14" },
  { day: 12, title: "Let's Cook", unlockDate: "2025-12-15" },
];

export function isDayUnlocked(day: number): boolean {
  const config = DAYS_CONFIG.find(d => d.day === day);
  if (!config) return false;
  
  const now = new Date();
  const unlockDate = new Date(config.unlockDate + 'T00:00:00');
  return now >= unlockDate;
}

export function getDayConfig(day: number): DayConfig | undefined {
  return DAYS_CONFIG.find(d => d.day === day);
}
