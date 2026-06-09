"use client";
import { useRouter, usePathname } from "next/navigation";

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
}

export function WeekSelector({ currentWeek, totalWeeks }: WeekSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`${pathname}?week=${e.target.value}`);
  }

  return (
    <select value={currentWeek} onChange={handleChange}>
      {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
        <option key={week} value={week}>
          Week {week}
        </option>
      ))}
    </select>
  );
}
