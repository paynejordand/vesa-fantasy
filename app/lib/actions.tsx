"use server";

import { neon } from "@neondatabase/serverless";
import { Team, Player } from "@/app/db/dummy";
import { auth } from "@/auth";

export async function submitDraft(
  draftedTeam: Team | null,
  draftedPlayers: Player[],
) {
  console.log("Submitting selection:", {
    team: draftedTeam,
    players: draftedPlayers,
  });

  const session = await auth();
  const pNames = draftedPlayers.map((p) => p.name);

  const sql = neon(process.env.DATABASE_URL || "");
  const res =
    await sql`INSERT INTO teams (discord_username, team_name, players) VALUES (${session?.user?.name}, ${draftedTeam?.name}, ${pNames})`;
  console.log(res);
}