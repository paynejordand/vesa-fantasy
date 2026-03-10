import Link from "next/link";
import { Schedule } from "@/app/db/definitions";
import { LocalTime } from "@/app/components/local-time";

interface SchedulePageProps {
  schedules: Schedule[];
}

function groupByWeekAndDate(
  schedules: Schedule[],
): Map<number, Map<string, Schedule[]>> {
  const weekMap = new Map<number, Map<string, Schedule[]>>();

  for (const schedule of schedules) {
    if (!weekMap.has(schedule.Week)) {
      weekMap.set(schedule.Week, new Map());
    }

    const dateMap = weekMap.get(schedule.Week)!;
    const key = new Date(schedule.GameDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!dateMap.has(key)) {
      dateMap.set(key, []);
    }
    dateMap.get(key)!.push(schedule);
  }

  for (const dateMap of weekMap.values()) {
    for (const matches of dateMap.values()) {
      matches.sort((a, b) => a.Division - b.Division);
    }
  }

  return weekMap;
}

export function ScheduleComponent({ schedules }: SchedulePageProps) {
  const grouped = groupByWeekAndDate(schedules);

  return (
    <div className="flex flex-col items-center gap-10 p-6">
      {Array.from(grouped.entries()).map(([week, dateMap]) => (
        <div key={week} className="flex flex-col items-center gap-6 w-full">
          <h1 className="text-2xl font-bold text-center underline">
            Week {week}
          </h1>
          {Array.from(dateMap.entries()).map(([date, matches]) => (
            <div key={date} className="flex flex-col items-center gap-2">
              <h3 className="text-base font-semibold underline">{date}</h3>
              <LocalTime date={matches[0].GameDate} />
              <div className="flex flex-col items-center gap-1">
                {matches.map((match) => (
                  <Link
                    key={match.ScheduleID}
                    href={`/draft/pick?div=${match.Division}&week=${match.Week}`}
                    className="text-base text-blue-500 hover:underline"
                  >
                    Div {match.Division}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
