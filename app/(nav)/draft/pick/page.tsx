import { DraftComponent } from "@/app/components/draft/draft";
import { getUser } from "@/app/lib/dal";
import {
  getPlayersByDivision,
  getTeamsByDivision,
  getPickByUserID,
  getMatchStartTimeByDivisionAndWeek,
  getLeaderboardIDByDivisionAndWeek,
} from "@/app/db/data";
import { submitDraft, deletePickByUserID } from "@/app/db/actions";
import { clamp } from "@/app/lib/utils";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Draft Pick",
  description: "Pick your favorite players and team.",
};

interface PageProps {
  searchParams: Promise<{
    div?: string;
    week?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const user = await getUser();
  if (!user) redirect(`/login`);

  const { div, week } = await searchParams;

  const division = clamp(1, 8, div ? Number(div) : 1);
  const weekNumber = clamp(1, 7, week ? Number(week) : 1);

  const [players, teams, pick, gamedate, leaderboardID] = await Promise.all([
    getPlayersByDivision(division),
    getTeamsByDivision(division),
    getPickByUserID(user.id, division, weekNumber),
    getMatchStartTimeByDivisionAndWeek(division, weekNumber),
    getLeaderboardIDByDivisionAndWeek(division, weekNumber),
  ]);

  const hasStarted = gamedate && gamedate <= new Date();

  if (!players || !teams) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="w-3/4 text-2xl font-semibold text-black dark:text-zinc-50">
          Div {division}, Week {week} Draft
        </h1>
        <p className="w-3/4 text-medium text-red-600">
          Unable to load players or teams for the selected division and week.
          Please try again later.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="w-3/4 text-2xl font-semibold text-black dark:text-zinc-50">
        Div {division}, Week {week} Draft
      </h1>
      {user?.id === "700903525424824372" && (
        <p className="w-3/4 text-medium text-red-600">Hi Nate :)</p>
      )}
      {hasStarted ? (
        <p className="w-3/4 text-medium text-red-600">
          Draft was locked at the scheduled game start time.
          <br />
          <Link
            className="text-blue-500 hover:underline"
            href={{
              pathname: `/leaderboard/match`,
              query: { div: division, week: weekNumber },
            }}
          >
            View Leaderboard
          </Link>
        </p>
      ) : (
        <DraftComponent
          key={pick ? `${pick.pickid}-${pick.submittedon}` : "no-pick"}
          players={players}
          teams={teams}
          division={division}
          week={weekNumber}
          leaderboardID={leaderboardID!}
          initialPick={pick}
          onSubmit={submitDraft}
          onDelete={deletePickByUserID}
        />
      )}
    </div>
  );
}
