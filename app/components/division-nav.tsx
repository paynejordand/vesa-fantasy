import { getWeeksAndDivisionsFromScheduleBySeason } from "@/app/db/data";
import Link from "next/link";

interface DivisionWeek {
  division: number;
  week: number;
}

interface DivisionWrapperProps {
  route: string;
  season: number;
}

interface DivisionNavProps {
  divisionWeeks: DivisionWeek[];
  route: string;
}

export async function DivisionNavWrapper({
  route,
  season,
}: DivisionWrapperProps) {
  const divWeeks = await getWeeksAndDivisionsFromScheduleBySeason(season);
  if (!divWeeks || divWeeks.length === 0) return <div>Database has no leaderboards for this season</div>;
  return <DivisionNav divisionWeeks={divWeeks} route={route} />;
}

function DivisionNav({ divisionWeeks, route }: DivisionNavProps) {
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
                href={{
                  pathname: route,
                  query: { div: division, week: week },
                }}
                className="text-sm font-medium text-blue-500 hover:underline"
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