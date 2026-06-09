"use client";
import { useRouter, usePathname } from "next/navigation";

interface WeekSelectorProps {
  currentWeek: number | null;
  totalWeeks: number;
}

export function WeekSelector({ currentWeek, totalWeeks }: WeekSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === "all") {
      router.push(pathname); // removes the week param entirely
    } else {
      router.push(`${pathname}?week=${value}`);
    }
  }

  return (
    <select value={currentWeek ?? "all"} onChange={handleChange}>
      <option value="all">All Weeks</option>
      {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
        <option key={week} value={week}>
          Week {week}
        </option>
      ))}
    </select>
  );
}
