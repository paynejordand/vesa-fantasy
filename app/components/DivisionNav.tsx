import Link from "next/link";

interface DivisionWeek {
  division: number;
  week: number;
}

interface DivisionNavProps {
  divisionWeeks: DivisionWeek[];
  route: string;
}

export function DivisionNav({ divisionWeeks, route }: DivisionNavProps) {
  // Group weeks by division
  const grouped = divisionWeeks.reduce<Record<number, number[]>>(
    (acc, { division, week }) => {
      if (!acc[division]) acc[division] = [];
      acc[division].push(week);
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-8 p-6">
      {Object.entries(grouped).map(([division, weeks]) => (
        <div key={division} className="flex flex-col items-center">
          <h2 className="text-xl font-bold underline mb-2">
            Division {division}
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {weeks.map((week) => (
              <Link
                key={week}
                href={`${route}?div=${division}&week=${week}`}
                className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Week {week}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
