"use client";

import Link from "next/link";
import { ScheduleSelect } from "@/app/db/schema";

interface SchedulePageProps {
  schedules: ScheduleSelect[];
}

function groupByWeekAndDate(
  schedules: ScheduleSelect[],
): Map<number, Map<string, ScheduleSelect[]>> {
  const weekMap = new Map<number, Map<string, ScheduleSelect[]>>();

  for (const schedule of schedules) {
    if (!weekMap.has(schedule.week)) {
      weekMap.set(schedule.week, new Map());
    }

    const dateMap = weekMap.get(schedule.week)!;
    const key = new Date(schedule.gamedate).toLocaleDateString("en-US", {
      weekday: "long",
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
      matches.sort((a, b) => a.division - b.division);
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
              <h2 className="text-base font-semibold underline text-center">
                {date}
              </h2>
              <div className="flex flex-col items-center gap-1">
                {matches.map((match) => (
                  <Link
                    key={match.scheduleid}
                    href={{
                      pathname: `/draft/pick`,
                      query: { div: match.division, week: match.week },
                    }}
                    className="text-base text-blue-500 hover:underline"
                  >
                    Div {match.division}
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
