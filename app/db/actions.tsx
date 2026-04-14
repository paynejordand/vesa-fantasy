"use server";

import { sql, db, txDB } from "@/app/db/db";
import { sql as drizzleSQL, SQL, getTableColumns, eq, and } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
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
import {
  leaderboardInFantasy,
  pickInFantasy,
  playerInFantasy,
  teamInFantasy,
} from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import { getUser } from "@/app/lib/dal";

export type ActionResult =
  | { success: true }
  | { success: false; message: string };

const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);

  return columns.reduce(
    (acc, column) => {
      const colName = cls[column].name;
      acc[column] = drizzleSQL.raw(`excluded.${colName}`);

      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

export async function submitDraft(
  draftedTeam: string | null,
  draftedPlayers: string[],
  division: number,
  week: number,
) {
  try {
    const user = await getUser();
    if (!user) return null;

    const res = await db
      .insert(pickInFantasy)
      .values({
        division: division,
        week: week,
        submittedby: user.name,
        teamid: draftedTeam!,
        player1id: draftedPlayers[0],
        player2id: draftedPlayers[1],
        player3id: draftedPlayers[2],
      })
      .onConflictDoUpdate({
        target: [
          pickInFantasy.submittedby,
          pickInFantasy.division,
          pickInFantasy.week,
        ],
        set: {
          teamid: drizzleSQL.raw(`EXCLUDED.teamid`),
          player1id: drizzleSQL.raw(`EXCLUDED.player1id`),
          player2id: drizzleSQL.raw(`EXCLUDED.player2id`),
          player3id: drizzleSQL.raw(`EXCLUDED.player3id`),
          submittedon: drizzleSQL.raw(`NOW()`),
        },
      });
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
    // await sql.transaction([
    //   sql`UPDATE Fantasy.Pick SET tscore = ${score} WHERE teamid = ${id} AND week = ${week} AND division = ${division}`,
    //   sql`UPDATE Fantasy.Team SET overallpoints = overallpoints + ${score}, weeksplayed = weeksplayed + 1 WHERE teamid = ${id}`,
    // ]);
    await txDB.transaction(async (tx) => {
      tx.update(pickInFantasy)
        .set({
          tscore: String(score),
        })
        .where(
          and(
            eq(pickInFantasy.teamid, id),
            eq(pickInFantasy.week, week),
            eq(pickInFantasy.division, division),
          ),
        );
      tx.update(teamInFantasy)
        .set({
          overallpoints: drizzleSQL.raw(`overallpoints + ${score}`),
          weeksplayed: drizzleSQL.raw(`weeksplayed + 1`),
        })
        .where(eq(teamInFantasy.teamid, id));
    });
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
  // await sql.transaction([
  //   sql`UPDATE Fantasy.Pick
  //       SET P1Score = CASE WHEN Player1ID = ${id} THEN ${score} ELSE P1Score END,
  //           P2Score = CASE WHEN Player2ID = ${id} THEN ${score} ELSE P2Score END,
  //           P3Score = CASE WHEN Player3ID = ${id} THEN ${score} ELSE P3Score END
  //       WHERE (Player1ID = ${id} OR Player2ID = ${id} OR Player3ID = ${id})
  //       AND week = ${week} AND division = ${division}`,
  //   sql`UPDATE Fantasy.Player SET overallpoints = overallpoints + ${score}, gamesplayed = gamesplayed + 1 WHERE playerid = ${id}`,
  // ]);
  await txDB.transaction(async (tx) => {
    tx.update(pickInFantasy)
      .set({
        p1score: drizzleSQL.raw(
          `CASE WHEN Player1ID = ${id} THEN ${score} ELSE P1Score END`,
        ),
        p2score: drizzleSQL.raw(
          `CASE WHEN Player2ID = ${id} THEN ${score} ELSE P2Score END`,
        ),
        p3score: drizzleSQL.raw(
          `CASE WHEN Player3ID = ${id} THEN ${score} ELSE P3Score END`,
        ),
      })
      .where(
        and(
          eq(pickInFantasy.player1id, id),
          eq(pickInFantasy.week, week),
          eq(pickInFantasy.division, division),
        ),
      );
    tx.update(playerInFantasy)
      .set({
        overallpoints: drizzleSQL.raw(`overallpoints + ${score}`),
        gamesplayed: drizzleSQL.raw(`gamesplayed + 1`),
      })
      .where(eq(playerInFantasy.playerid, id));
  });
}

async function insertLeaderboard(
  division: number,
  week: number,
  matchLink: string,
): Promise<ActionResult> {
  try {
    // await sql.transaction([
    //   sql`INSERT INTO Fantasy.Leaderboard (Division, Week, MatchLink)
    //           VALUES (${division}, ${week}, ${matchLink})`,
    //   sql`UPDATE Fantasy.Pick
    //           SET LeaderboardID = (
    //               SELECT LeaderboardID FROM Fantasy.Leaderboard
    //               WHERE Division = ${division} AND Week = ${week}
    //           )
    //           WHERE Division = ${division}
    //             AND Week = ${week}
    //             AND LeaderboardID IS NULL`,
    // ]);

    await txDB.transaction(async (tx) => {
      const leaderboardid = await tx
        .insert(leaderboardInFantasy)
        .values({
          division: division,
          week: week,
          matchlink: matchLink,
        })
        .returning({ leaderboardid: leaderboardInFantasy.leaderboardid });
      tx.update(pickInFantasy)
        .set({
          leaderboardid: leaderboardid[0].leaderboardid,
        })
        .where(
          and(
            eq(pickInFantasy.division, division),
            eq(pickInFantasy.week, week),
          ),
        );
    });

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
    await db
      .delete(pickInFantasy)
      .where(
        and(
          eq(pickInFantasy.submittedby, name),
          eq(pickInFantasy.division, division),
          eq(pickInFantasy.week, week),
        ),
      );
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
    const rows = await db
      .select({ division: teamInFantasy.division })
      .from(teamInFantasy)
      .where(eq(teamInFantasy.teamid, teamID));

    const division = rows[0]?.division;

    for (const playerID of playerIDs) {
      await txDB.transaction(async (tx) => {
        await tx
          .update(teamInFantasy)
          .set({
            player1id: drizzleSQL`CASE WHEN player1id = ${playerID} THEN NULL ELSE player1id END`,
            player2id: drizzleSQL`CASE WHEN player2id = ${playerID} THEN NULL ELSE player2id END`,
            player3id: drizzleSQL`CASE WHEN player3id = ${playerID} THEN NULL ELSE player3id END`,
          })
          .where(eq(teamInFantasy.teamid, teamID));

        await tx
          .update(playerInFantasy)
          .set({
            divisions: drizzleSQL.raw(
              `array_remove(Divisions, ${division}::SMALLINT)`,
            ),
          })
          .where(eq(playerInFantasy.playerid, playerID));
      });
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

export async function addPlayerToTeam(
  teamID: string,
  division: number,
  players: { name: string; osLink: string }[],
): Promise<ActionResult> {
  try {
    for (const player of players) {
      const sanitizedLink = `https://overstat.gg/player/${player.osLink.match(/\/player\/(\d+)/)?.[1] ?? ""}`;

      await txDB.transaction(async (tx) => {
        await tx
          .insert(playerInFantasy)
          .values({
            name: player.name,
            osLink: sanitizedLink,
            divisions: drizzleSQL`ARRAY[${division}]::SMALLINT[]`,
          })
          .onConflictDoUpdate({
            target: playerInFantasy.osLink,
            set: {
              divisions: drizzleSQL`
                CASE
                    WHEN ${division} = ANY(Fantasy.Player.Divisions)
                    THEN Fantasy.Player.Divisions
                    ELSE array_append(Fantasy.Player.Divisions, ${division}::SMALLINT)
                END
            `,
            },
          });

        await tx
          .update(teamInFantasy)
          .set({
            player1id: drizzleSQL`CASE WHEN player1id IS NULL THEN (SELECT playerid FROM Fantasy.Player WHERE OS_Link = ${sanitizedLink}) ELSE player1id END`,
            player2id: drizzleSQL`CASE WHEN player1id IS NOT NULL AND player2id IS NULL THEN (SELECT playerid FROM Fantasy.Player WHERE OS_Link = ${sanitizedLink}) ELSE player2id END`,
            player3id: drizzleSQL`CASE WHEN player1id IS NOT NULL AND player2id IS NOT NULL AND player3id IS NULL THEN (SELECT playerid FROM Fantasy.Player WHERE OS_Link = ${sanitizedLink}) ELSE player3id END`,
          })
          .where(eq(teamInFantasy.teamid, teamID));
      });
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
      const team = await db
        .select({
          division: teamInFantasy.division,
          player1id: teamInFantasy.player1id,
          player2id: teamInFantasy.player2id,
          player3id: teamInFantasy.player3id,
        })
        .from(teamInFantasy)
        .where(eq(teamInFantasy.teamid, teamID));

      if (team.length === 0) continue;

      const { division, player1id, player2id, player3id } = team[0];
      const playerIDs = [player1id, player2id, player3id].filter(
        (p) => p !== null,
      );

      await txDB.transaction(async (tx) => {
        await tx.delete(teamInFantasy).where(eq(teamInFantasy.teamid, teamID));
        for (const playerID of playerIDs) {
          await tx
            .update(playerInFantasy)
            .set({
              divisions: drizzleSQL.raw(
                `array_remove(Fantasy.Player.Divisions, ${division}::SMALLINT)`,
              ),
            })
            .where(eq(playerInFantasy.playerid, playerID));
        }
      });
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
        message: "No valid players provided.",
      };

    const teamID = await db
      .insert(teamInFantasy)
      .values({
        name: teamName.trim().replace(/'/g, ""),
        division: division,
      })
      .returning({ teamid: teamInFantasy.teamid });

    await addPlayerToTeam(teamID[0].teamid, division, sanitizedPlayers);

    const playerIDs = await Promise.all(
      sanitizedPlayers.map((p) =>
        db
          .select({ playerid: playerInFantasy.playerid })
          .from(playerInFantasy)
          .where(eq(playerInFantasy.osLink, p.osLink)),
      ),
    );

    await db
      .update(teamInFantasy)
      .set({
        player1id: playerIDs[0]?.[0]?.playerid ?? null,
        player2id: playerIDs[1]?.[0]?.playerid ?? null,
        player3id: playerIDs[2]?.[0]?.playerid ?? null,
      })
      .where(eq(teamInFantasy.teamid, teamID[0].teamid));

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
