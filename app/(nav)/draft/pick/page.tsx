import { DraftComponent } from "@/app/components/DraftComponent";
import { getUser } from "@/app/lib/dal";
import {
  getPlayersByDivision,
  getTeamsByDivision,
  getPickByUsername,
  getMatchStartTimeByDivisionAndWeek,
} from "@/app/db/data";
import { submitDraft, deletePickByUsername } from "@/app/db/actions";
import { clamp } from "@/app/lib/utils";
import { redirect } from "next/navigation";
import { Metadata } from "next";

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

  const division = clamp(1, 7, div ? Number(div) : 1);
  const weekNumber = clamp(1, 7, week ? Number(week) : 1);

  const [players, teams, pick, gamedate] = await Promise.all([
    getPlayersByDivision(division),
    getTeamsByDivision(division),
    getPickByUsername(user.name, division, weekNumber),
    getMatchStartTimeByDivisionAndWeek(division, weekNumber),
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
      {hasStarted ? (
        <p className="w-3/4 text-medium text-red-600">
          Draft was locked at the scheduled game start time.
          <br />
          <a
            className="text-blue-500 hover:underline"
            href={`/leaderboard/match?div=${division}&week=${weekNumber}`}
          >
            View Leaderboard
          </a>
        </p>
      ) : (
        <DraftComponent
          key={pick ? `${pick.PickID}-${pick.SubmittedOn}` : "no-pick"}
          players={players}
          teams={teams}
          division={division}
          week={weekNumber}
          initialPick={pick}
          onSubmit={submitDraft}
          onDelete={deletePickByUsername}
        />
      )}
    </div>
  );
}
