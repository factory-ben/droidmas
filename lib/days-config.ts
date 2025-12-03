export interface DayConfig {
  day: number;
  title: string;
  unlockDate: string; // ISO date string (YYYY-MM-DD)
}

// All 12 days - games will be added via PRs as each day arrives
export const DAYS_CONFIG: DayConfig[] = [
  { day: 1, title: "Day 1", unlockDate: "2025-12-04" },
  { day: 2, title: "Day 2", unlockDate: "2025-12-05" },
  { day: 3, title: "Day 3", unlockDate: "2025-12-06" },
  { day: 4, title: "Day 4", unlockDate: "2025-12-07" },
  { day: 5, title: "Day 5", unlockDate: "2025-12-08" },
  { day: 6, title: "Day 6", unlockDate: "2025-12-09" },
  { day: 7, title: "Day 7", unlockDate: "2025-12-10" },
  { day: 8, title: "Day 8", unlockDate: "2025-12-11" },
  { day: 9, title: "Day 9", unlockDate: "2025-12-12" },
  { day: 10, title: "Day 10", unlockDate: "2025-12-13" },
  { day: 11, title: "Day 11", unlockDate: "2025-12-14" },
  { day: 12, title: "Day 12", unlockDate: "2025-12-15" },
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
