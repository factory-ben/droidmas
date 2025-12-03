import { DAYS_CONFIG } from '@/lib/days-config';
import DayContent from '@/components/DayContent';

interface PageProps {
  params: Promise<{ day: string }>;
}

export default async function DayPage({ params }: PageProps) {
  const { day } = await params;
  const dayNum = parseInt(day, 10);
  
  return <DayContent day={dayNum} />;
}

export function generateStaticParams() {
  return DAYS_CONFIG.map(day => ({
    day: day.day.toString(),
  }));
}
