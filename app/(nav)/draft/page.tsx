import { ScheduleComponent } from "@/app/components/draft/draft-schedule";
import { getFutureMatchesFromSchedule } from "@/app/db/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Draft",
  description: "Weekly fantasy draft for the VESA esports league.",
};

export default async function Page() {
  const schedule = await getFutureMatchesFromSchedule();
  if (!schedule || schedule.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-center">
          No upcoming matches found in the schedule.
        </h1>
      </div>
    );
  }
  return <ScheduleComponent schedules={schedule} />;
}
