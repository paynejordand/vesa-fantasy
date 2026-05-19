import { getUser } from "@/app/lib/dal";
import { clamp } from "@/app/lib/utils";
import { CalcLeaderboard } from "@/app/components/leaderboard/calc-leaderboard";
import { Leaderboard } from "@/app/components/leaderboard/leaderboard";
import { PlayerResultsComponent } from "@/app/components/leaderboard/player-results";
import {
  getLeaderboardByDivisionAndWeek,
  getPlayerResultsByLeaderboardID,
} from "@/app/db/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Leaderboard",
  description:
    "Divisional leaderboard showing rankings for this match in the VESA Fantasy League.",
};

interface PageProps {
  params: Promise<{ season: string }>;
  searchParams: Promise<{
    div?: string;
    week?: string;
  }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const user = await getUser();

  const { season } = await params;
  const { div, week } = await searchParams;

  const division = clamp(1, 8, div ? Number(div) : 1);
  const weekNumber = clamp(1, 7, week ? Number(week) : 1);

  const leaderboard = await getLeaderboardByDivisionAndWeek(
    Number(season),
    division,
    weekNumber,
  );

  if (!leaderboard) {
    return (
      <div className="text-center text-red-600">
        <p>You are probably on the wrong page.</p>
      </div>
    );
  }

  const playerResults = await getPlayerResultsByLeaderboardID(
    leaderboard.leaderboardid,
  );
  return (
    <div className="flex flex-col">
      {!leaderboard.matchlink && (
        <p className="text-center text-red-600">
          The draft for Season {season} - Div {division}, Week {weekNumber} has
          not been scored yet
        </p>
      )}
      <Leaderboard leaderboard={leaderboard} />
      <PlayerResultsComponent playerResults={playerResults} />

      {user?.role === "Admin" && !leaderboard.matchlink && (
        <CalcLeaderboard division={division} week={weekNumber} />
      )}
    </div>
  );
}
