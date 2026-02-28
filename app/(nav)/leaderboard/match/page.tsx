import { getUser } from "@/app/lib/dal";
import { clamp } from "@/app/lib/utils";
import { CalcLeaderboard } from "@/app/components/leaderboard/calc-leaderboard";
import { Leaderboard } from "@/app/components/leaderboard/leaderboard";
import { getLeaderboardByDivisionAndWeek } from "@/app/db/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Leaderboard",
  description:
    "Divisional leaderboard showing rankings for this match in the VESA Fantasy League.",
};

interface PageProps {
  searchParams: Promise<{
    div?: string;
    week?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const user = await getUser();

  const { div, week } = await searchParams;

  const division = clamp(1, 7, div ? Number(div) : 1);
  const weekNumber = clamp(1, 7, week ? Number(week) : 1);

  const leaderboard = await getLeaderboardByDivisionAndWeek(
    division,
    weekNumber,
  );

  return (
    <div className="flex flex-col">
      {leaderboard ? (
        <Leaderboard leaderboard={leaderboard} />
      ) : (
        <p className="text-center text-red-600">
          No leaderboard data available for Div {division}, Week {weekNumber}
        </p>
      )}
      {user?.role === "Admin" && !leaderboard && (
        <CalcLeaderboard division={division} week={weekNumber} />
      )}
    </div>
  );
}
