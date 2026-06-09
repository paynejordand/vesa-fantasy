import { getSummedPicksBySeasonAndWeek } from "@/app/db/data";
import { OverallLeaderboard } from "@/app/components/leaderboard/overall-leaderboard";
import { WeekSelector } from "@/app/components/week-selector";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overall Leaderboard",
  description: "Summed leaderboards.",
};

interface PageProps {
  params: Promise<{ season: string }>;
  searchParams: Promise<{ week?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { season } = await params;
  const { week } = await searchParams;
  const selectedWeek = week ? Number(week) : null;

  const summedPicks = await getSummedPicksBySeasonAndWeek(
    Number(season),
    selectedWeek,
  );

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Overall Leaderboard</h1>

      <div className="flex items-center gap-2">
        <WeekSelector currentWeek={selectedWeek} totalWeeks={6} />
      </div>

      <div className="w-full max-w-3xl">
        <OverallLeaderboard entries={summedPicks} />
      </div>
    </div>
  );
}
