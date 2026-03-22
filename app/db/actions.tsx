"use server";

import { sql } from "@/app/db/db";
import { PlayerStat } from "@/app/db/definitions";
import {
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

export type ActionResult =
  | { success: true }
  | { success: false; message: string };

export async function submitDraft(
  draftedTeam: string | null,
  draftedPlayers: string[],
  division: number,
  week: number,
) {
  try {
    const user = await getUser();
    if (!user) return null;

    const res = await sql`
      INSERT INTO Fantasy.Pick 
        (division, week, submittedby, teamid, player1id, player2id, player3id) 
      VALUES 
        (${division}, ${week}, ${user.name}, ${draftedTeam}, 
        ${draftedPlayers[0]}, ${draftedPlayers[1]}, ${draftedPlayers[2]})
      ON CONFLICT (submittedby, division, week)
      DO UPDATE SET
        teamid    = EXCLUDED.teamid,
        player1id = EXCLUDED.player1id,
        player2id = EXCLUDED.player2id,
        player3id = EXCLUDED.player3id,
        submittedon = NOW()
    `;
    console.log(res);
  } catch (error) {
    console.error("Database error: ", error);
  } finally {
    revalidatePath(`/draft/pick?div=${division}&week=${week}`);
  }
}

export async function handleTeamScoreInDB(
  id: string,
  score: number,
  week: number,
  division: number,
) {
  try {
    await sql.transaction([
      sql`UPDATE Fantasy.Pick SET tscore = ${score} WHERE teamid = ${id} AND week = ${week} AND division = ${division}`,
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
  division: number,
) {
  await sql.transaction([
    sql`UPDATE Fantasy.Pick
        SET P1Score = CASE WHEN Player1ID = ${id} THEN ${score} ELSE P1Score END,
            P2Score = CASE WHEN Player2ID = ${id} THEN ${score} ELSE P2Score END,
            P3Score = CASE WHEN Player3ID = ${id} THEN ${score} ELSE P3Score END
        WHERE (Player1ID = ${id} OR Player2ID = ${id} OR Player3ID = ${id})
        AND week = ${week} AND division = ${division}`,
    sql`UPDATE Fantasy.Player SET overallpoints = overallpoints + ${score}, gamesplayed = gamesplayed + 1 WHERE playerid = ${id}`,
  ]);
}

async function insertLeaderboard(
  division: number,
  week: number,
  matchLink: string,
): Promise<ActionResult> {
  try {
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
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "A database error occurred. Please try again.",
    };
  }
}

export async function scoreDraft(
  division: number,
  week: number,
  matchLink: string,
) {
  const user = await getUser();
  if (user?.role !== "Admin") return null;

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
          team.overall_stats.name.replace(/\'/g, ""),
          division,
        );
        if (teamID === null) return;
        await handleTeamScoreInDB(teamID, score, week, division);
      } catch (e) {
        console.error("Database Error: ", e);
        return {
          success: false,
          message: "Failed to update team score in the database.",
        };
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

      teamStats.players.forEach(async (player) => {
        let score = 0;
        score += player.damageDealt * damageScore;
        score += player.assists * assistScore;
        score += player.knockdowns * knockdownScore;
        score += player.kills * killScore;
        score += player.respawnsGiven * respawnScore;

        try {
          const pLink = `https://overstat.gg/player/${player.playerId}`;
          const playerID = await getPlayerIDByPlayerLink(pLink);
          if (playerID === null) return;
          await handlePlayerScoreInDB(playerID, score, week, division);
        } catch (e) {
          console.error(e);
          return {
            success: false,
            message: "Failed to update player score in the database.",
          };
        }
      });
    },
  );
  try {
    await insertLeaderboard(division, week, matchLink);
  } catch (e) {
    console.error("Error inserting leaderboard: ", e);
    return {
      success: false,
      message: "Failed to insert leaderboard into the database.",
    };
  } finally {
    revalidatePath(`/leaderboard/match?div=${division}&week=${week}`);
  }
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
  } finally {
    revalidatePath(`/draft/pick?div=${division}&week=${week}`);
  }
}

export async function removePlayersFromTeam(
  teamID: string,
  playerIDs: string[],
): Promise<ActionResult> {
  try {
    const team =
      await sql`SELECT Division FROM Fantasy.Team WHERE TeamID = ${teamID}`;
    const division = team[0].division;

    await sql.transaction([
      sql`UPDATE Fantasy.Team
              SET
                  Player1ID = CASE WHEN Player1ID = ANY(${playerIDs}::UUID[]) THEN NULL ELSE Player1ID END,
                  Player2ID = CASE WHEN Player2ID = ANY(${playerIDs}::UUID[]) THEN NULL ELSE Player2ID END,
                  Player3ID = CASE WHEN Player3ID = ANY(${playerIDs}::UUID[]) THEN NULL ELSE Player3ID END
              WHERE TeamID = ${teamID}`,

      sql`UPDATE Fantasy.Player
              SET Divisions = array_remove(Divisions, ${division}::SMALLINT)
              WHERE PlayerID = ANY(${playerIDs}::UUID[])`,
    ]);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "A database error occurred. Please try again.",
    };
  }
}

export async function addPlayerToTeam(
  teamID: string,
  division: number,
  players: { name: string; osLink: string }[],
): Promise<ActionResult> {
  try {
    for (const player of players) {
      const sanitizedLink = `https://overstat.gg/player/${player.osLink.match(/\/player\/(\d+)/)?.[1] ?? ""}`;

      await sql.transaction([
        sql`INSERT INTO Fantasy.Player (Name, OS_Link, Divisions)
                  VALUES (${player.name}, ${sanitizedLink}, ARRAY[${division}]::SMALLINT[])
                  ON CONFLICT (OS_Link) DO UPDATE SET
                      Divisions = CASE
                          WHEN ${division} = ANY(Fantasy.Player.Divisions) THEN Fantasy.Player.Divisions
                          ELSE array_append(Fantasy.Player.Divisions, ${division}::SMALLINT)
                      END`,

        sql`UPDATE Fantasy.Team
                  SET
                      Player1ID = CASE WHEN Player1ID IS NULL THEN (SELECT PlayerID FROM Fantasy.Player WHERE OS_Link = ${sanitizedLink}) ELSE Player1ID END,
                      Player2ID = CASE WHEN Player1ID IS NOT NULL AND Player2ID IS NULL THEN (SELECT PlayerID FROM Fantasy.Player WHERE OS_Link = ${sanitizedLink}) ELSE Player2ID END,
                      Player3ID = CASE WHEN Player1ID IS NOT NULL AND Player2ID IS NOT NULL AND Player3ID IS NULL THEN (SELECT PlayerID FROM Fantasy.Player WHERE OS_Link = ${sanitizedLink}) ELSE Player3ID END
                  WHERE TeamID = ${teamID}`,
      ]);
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "A database error occurred. Please try again.",
    };
  }
}

export async function removeTeam(teamIDs: string[]): Promise<ActionResult> {
  try {
    for (const teamID of teamIDs) {
      const team = await sql`
              SELECT Division, Player1ID, Player2ID, Player3ID
              FROM Fantasy.Team WHERE TeamID = ${teamID}
          `;

      if (team.length === 0) continue;

      const { division, player1id, player2id, player3id } = team[0];
      const playerIDs = [player1id, player2id, player3id].filter(
        (p) => p !== null,
      );

      await sql.transaction([
        sql`DELETE FROM Fantasy.Team WHERE TeamID = ${teamID}`,
        sql`UPDATE Fantasy.Player
                  SET Divisions = array_remove(Divisions, ${division}::SMALLINT)
                  WHERE PlayerID = ANY(${playerIDs}::UUID[])`,
      ]);
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "A database error occurred. Please try again.",
    };
  }
}

export async function addTeam(
  teamName: string,
  division: number,
  players: { name: string; osLink: string }[],
): Promise<ActionResult> {
  try {
    const sanitizedPlayers = players
      .filter((p) => p.name.trim() && p.osLink.trim())
      .map((p) => ({
        name: p.name.trim().replace(/'/g, ""),
        osLink: `https://overstat.gg/player/${p.osLink.match(/\/player\/(\d+)/)?.[1] ?? ""}`,
      }));

    if (sanitizedPlayers.length === 0)
      return {
        success: false,
        message: "At least one valid player is required.",
      };

    for (const player of sanitizedPlayers) {
      await sql`
              INSERT INTO Fantasy.Player (Name, OS_Link, Divisions)
              VALUES (${player.name}, ${player.osLink}, ARRAY[${division}]::SMALLINT[])
              ON CONFLICT (OS_Link) DO UPDATE SET
                  Divisions = CASE
                      WHEN ${division} = ANY(Fantasy.Player.Divisions) THEN Fantasy.Player.Divisions
                      ELSE array_append(Fantasy.Player.Divisions, ${division}::SMALLINT)
                  END
          `;
    }

    const playerIDs = await Promise.all(
      sanitizedPlayers.map(
        (p) => sql`
              SELECT PlayerID FROM Fantasy.Player WHERE OS_Link = ${p.osLink}
          `,
      ),
    );

    await sql`
          INSERT INTO Fantasy.Team (Name, Division, Player1ID, Player2ID, Player3ID)
          VALUES (
              ${teamName.trim().replace(/'/g, "")},
              ${division},
              ${playerIDs[0]?.[0]?.playerid ?? null},
              ${playerIDs[1]?.[0]?.playerid ?? null},
              ${playerIDs[2]?.[0]?.playerid ?? null}
          )
      `;

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "A database error occurred. Please try again.",
    };
  }
}
