"use server";

import { sql } from "@/app/db/db";
import { Team, Player, PlayerStat } from "@/app/db/definitions";
import {
  getPicksByDivisionAndWeek,
  getTeamIDByTeamNameAndDivision,
  getPlayerIDByPlayerLink,
} from "@/app/db/data";
import { parseMatchLinkID, getOverstatStatsFromMatchID } from "@/app/lib/utils";
import {
  placementScores,
  damageScore,
  assistScore,
  knockdownScore,
  killScore,
  respawnScore,
} from "@/app/lib/constants";
import { revalidatePath } from "next/cache";
import { getUser } from "@/app/lib/dal";

export async function submitDraft(
  draftedTeam: Team | null,
  draftedPlayers: Player[],
  division: number,
  week: number,
) {
  console.log("Submitting selection:", {
    team: draftedTeam,
    players: draftedPlayers,
  });
  try {
    const user = await getUser();
    if (!user) return null;

    const res = await sql`INSERT INTO Fantasy.Pick 
    (division, week, submittedby, teamid, 
    player1id, player2id, player3id) 
    VALUES 
    (${division}, ${week}, ${user.name}, ${draftedTeam?.TeamID}, 
    ${draftedPlayers[0].PlayerID}, ${draftedPlayers[1].PlayerID}, ${draftedPlayers[2].PlayerID})`;
    console.log(res);
  } catch (error) {
    console.error("Database error: ", error);
    return { message: "Database Error :)" };
  } finally {
    revalidatePath(`/draft/pick?div=${division}&week=${week}`);
  }
}

export async function handleTeamScoreInDB(
  id: string,
  score: number,
  week: number,
) {
  try {
    await sql.transaction([
      sql`UPDATE Fantasy.Pick SET score = score + ${score} WHERE teamid = ${id} AND week = ${week}`,
      sql`UPDATE Fantasy.Team SET overallpoints = overallpoints + ${score}, weeksplayed = weeksplayed + 1 WHERE teamid = ${id}`,
    ]);
  } catch (error) {
    console.error("Transaction failed, all changes rolled back:", error);
  }
}

export async function handlePlayerScoreInDB(
  id: string,
  score: number,
  week: number,
) {
  await sql.transaction([
    sql`UPDATE Fantasy.Pick SET score = score + ${score} WHERE week = ${week} AND Player1ID = ${id} OR Player2ID = ${id} OR Player3ID = ${id};`,
    sql`UPDATE Fantasy.Player SET overallpoints = overallpoints + ${score}, gamesplayed = gamesplayed + 1 WHERE playerid = ${id}`,
  ]);
}

async function insertLeaderboard(
  division: number,
  week: number,
  matchLink: string,
): Promise<void> {
  await sql.transaction([
    sql`INSERT INTO Fantasy.Leaderboard (Division, Week, MatchLink)
            VALUES (${division}, ${week}, ${matchLink})`,
    sql`UPDATE Fantasy.Pick
            SET LeaderboardID = (
                SELECT LeaderboardID FROM Fantasy.Leaderboard
                WHERE Division = ${division} AND Week = ${week}
            )
            WHERE Division = ${division}
              AND Week = ${week}
              AND LeaderboardID IS NULL`,
  ]);
}

export async function scoreDraft(
  division: number,
  week: number,
  matchLink: string,
) {
  const user = await getUser();
  if (user?.role !== "Admin") return null;

  try {
    const picks = await getPicksByDivisionAndWeek(division, week);
    if (!picks) {
      return {
        message: `No picks for this division (${division}) and week (${week})`,
      };
    }
  } catch (e) {
    console.error("Database error: ", e);
    return { message: `Database error :)` };
  }
  const matchID = parseMatchLinkID(matchLink);
  const overstatData = await getOverstatStatsFromMatchID(matchID);

  const teams = overstatData.teams;

  teams.forEach(
    async (team: {
      overall_stats: { name: string; placementArray: number[] };
    }) => {
      let score = 0;
      team.overall_stats.placementArray.forEach((placement: number) => {
        score += placementScores[placement as keyof typeof placementScores];
      });

      try {
        const teamID = await getTeamIDByTeamNameAndDivision(
          team.overall_stats.name,
          division,
        );
        if (teamID === null) return;
        await handleTeamScoreInDB(teamID, score, week);
      } catch (e) {
        console.error(":) ", e);
      }
    },
  );

  teams.forEach(
    (team: {
      overall_stats: { name: string };
      player_stats: Array<PlayerStat>;
    }) => {
      const teamStats = {
        teamName: team.overall_stats.name,
        players: team.player_stats,
      };
      let score = 0;
      teamStats.players.forEach(async (player) => {
        score += (player.damageDealt / 100) * damageScore;
        score += player.assists * assistScore;
        score += player.knockdowns * knockdownScore;
        score += player.kills * killScore;
        score += player.respawnsGiven * respawnScore;

        try {
          const pLink = `https://overstat.gg/player/${player.playerId}`;
          const playerID = await getPlayerIDByPlayerLink(pLink);
          if (playerID === null) return;
          await handlePlayerScoreInDB(playerID, score, week);
        } catch (e) {
          console.error(e);
        }
      });
    },
  );
  await insertLeaderboard(division, week, matchLink);
  revalidatePath(`/leaderboard/match?div=${division}&week=${week}`)
}

export async function deletePickByUsername(
  name: string,
  division: number,
  week: number,
) {
  try {
    await sql`DELETE FROM Fantasy.Pick WHERE submittedby = ${name} AND division = ${division} AND week = ${week}`;
  } catch (e) {
    console.error("Database error: ", e);
    return { message: "Database Error :)" };
  } finally {
    revalidatePath(`/draft/pick?div=${division}&week=${week}`);
  }
}

export async function CalculateLeaderboard(formData: FormData) {
  const rawFormData = {
    link: formData.get("MatchLink"),
    division: Number(formData.get("Division")),
    week: Number(formData.get("Week")),
  };
  scoreDraft(
    rawFormData.division,
    rawFormData.week,
    rawFormData.link as string,
  );
}
