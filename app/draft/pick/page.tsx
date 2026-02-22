import { DraftComponent } from "@/app/components/DraftComponent";
import { DeletePickComponent } from "@/app/components/DeletePickComponent";
import { getUser } from "@/app/lib/dal";
import {
  getPlayersByDivision,
  getTeamsByDivision,
  getPickByUsername,
} from "@/app/db/data";
import { submitDraft, deletePickByUsername } from "@/app/db/actions";
import { clamp } from "@/app/lib/utils";
import { redirect } from "next/navigation";

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

  const [players, teams, pick] = await Promise.all([
    getPlayersByDivision(division),
    getTeamsByDivision(division),
    getPickByUsername(user.name, division, weekNumber),
  ]);

  if (!players || !teams) redirect(`/`);
  if (pick)
    return (
      <DeletePickComponent
        name={user.name}
        division={division}
        week={weekNumber}
        onSubmit={deletePickByUsername}
      />
    );
  return (
    <DraftComponent
      players={players}
      teams={teams}
      division={division}
      week={weekNumber}
      onSubmit={submitDraft}
    />
  );
}
