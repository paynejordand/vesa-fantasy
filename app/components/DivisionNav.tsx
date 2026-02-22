import Link from "next/link";

interface DivisionNavProps {
  divisions: number;
  weeks: number;
  route: string
}

export function DivisionNav({ divisions, weeks, route }: DivisionNavProps) {
  return (
    <div className="flex flex-col gap-8 p-6">
      {Array.from({ length: divisions }, (_, i) => {
        const division = i + 1;
        return (
          <div key={division} className="flex flex-col items-center">
            <h2 className="text-xl font-bold underline mb-2">
              Division {division}
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: weeks }, (_, j) => {
                const week = j + 1;
                return (
                  <Link
                    key={week}
                    href={`${route}?div=${division}&week=${week}`}
                    className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                    Week {week}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
