"use server";

import { db, txDB } from "@/app/db/db";
import { sql as drizzleSQL, eq, and, or } from "drizzle-orm";
import {
  getTeamIDByTeamNameAndDivision,
  getPlayerIDByPlayerLink,
  getLatestSeasonScheduleIDByDivisionAndWeek,
  getLeaderboardIDByScheduleID,
} from "@/app/db/data";
import {
  parseMatchLinkID,
  getOverstatStatsFromMatchID,
  sanitizeOSLink,
} from "@/app/lib/utils";
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
  playerMatchResultInFantasy,
  teamInFantasy,
  teamPickInFantasy,
  playerPickInFantasy,
  playerSeasonInFantasy,
} from "@/app/db/schema";
import { parseCSV } from "@/app/lib/utils";
import { revalidatePath } from "next/cache";
import { getUser } from "@/app/lib/dal";

export type ActionResult =
  | { success: true }
  | { success: false; message: string };

export async function submitDraft(
  draftedTeam: string,
  draftedPlayers: string[],
  division: number,
  week: number,
  leaderboardid: string,
) {
  try {
    const user = await getUser();
    if (!user) return null;

    await db
      .insert(pickInFantasy)
      .values({
        leaderboardid: leaderboardid,
        submitterid: user.id,
        submittername: user.name,
        teamid: draftedTeam,
        player1id: draftedPlayers[0],
        player2id: draftedPlayers[1],
        player3id: draftedPlayers[2],
      })
      .onConflictDoUpdate({
        target: [pickInFantasy.submitterid, pickInFantasy.leaderboardid],
        set: {
          teamid: drizzleSQL.raw(`EXCLUDED.teamid`),
          player1id: drizzleSQL.raw(`EXCLUDED.player1id`),
          player2id: drizzleSQL.raw(`EXCLUDED.player2id`),
          player3id: drizzleSQL.raw(`EXCLUDED.player3id`),
          submittedon: drizzleSQL.raw(`NOW()`),
        },
      });
  } catch (error) {
    console.error("Database error: ", error);
  } finally {
    revalidatePath(`/draft/pick?div=${division}&week=${week}`);
  }
}

export async function handleTeamScoreInDB(
  teamid: string,
  points: number,
  leaderboardid: string,
) {
  try {
    await txDB.transaction(async (tx) => {
      await tx
        .update(teamInFantasy)
        .set({
          overallpoints: drizzleSQL.raw(`overallpoints + ${points}`),
          weeksplayed: drizzleSQL.raw(`weeksplayed + 1`),
        })
        .where(eq(teamInFantasy.teamid, teamid));
      const picks = await tx
        .select({
          pickid: pickInFantasy.pickid,
        })
        .from(pickInFantasy)
        .where(
          and(
            eq(pickInFantasy.teamid, teamid),
            eq(pickInFantasy.leaderboardid, leaderboardid),
          ),
        );
      await Promise.all(
        picks.map(async (pick) => {
          await tx
            .insert(teamPickInFantasy)
            .values({
              pickid: pick.pickid,
              teamid: teamid,
              points: String(points),
            })
            .onConflictDoUpdate({
              target: [teamPickInFantasy.pickid, teamPickInFantasy.teamid],
              set: {
                points: drizzleSQL.raw(`EXCLUDED.points`),
              },
            });
          await tx
            .update(pickInFantasy)
            .set({
              score: drizzleSQL.raw(`score + ${points}`),
            })
            .where(eq(pickInFantasy.pickid, pick.pickid));
        }),
      );
    });
  } catch (error) {
    console.error("Transaction failed, all changes rolled back:", error);
  }
}

export async function handlePlayerScoreInDB(
  playerid: string,
  points: number,
  leaderboardid: string,
) {
  await txDB.transaction(async (tx) => {
    await tx
      .insert(playerMatchResultInFantasy)
      .values({
        playerid: playerid,
        leaderboardid: leaderboardid,
        points: String(points),
      })
      .onConflictDoUpdate({
        target: [
          playerMatchResultInFantasy.playerid,
          playerMatchResultInFantasy.leaderboardid,
        ],
        set: {
          points: drizzleSQL.raw(`EXCLUDED.points`),
        },
      });

    await tx
      .update(playerSeasonInFantasy)
      .set({
        overallpoints: drizzleSQL.raw(`overallpoints + ${points}`),
        gamesplayed: drizzleSQL.raw(`gamesplayed + 1`),
      })
      .where(eq(playerSeasonInFantasy.playerid, playerid));
    const picks = await tx
      .select({
        pickid: pickInFantasy.pickid,
        player1id: pickInFantasy.player1id,
        player2id: pickInFantasy.player2id,
        player3id: pickInFantasy.player3id,
      })
      .from(pickInFantasy)
      .where(
        and(
          eq(pickInFantasy.leaderboardid, leaderboardid),
          or(
            eq(pickInFantasy.player1id, playerid),
            eq(pickInFantasy.player2id, playerid),
            eq(pickInFantasy.player3id, playerid),
          ),
        ),
      );
    await Promise.all(
      picks.map(async (pick) => {
        await tx
          .insert(playerPickInFantasy)
          .values({
            pickid: pick.pickid,
            playerid: playerid,
            points: String(points),
          })
          .onConflictDoUpdate({
            target: [playerPickInFantasy.pickid, playerPickInFantasy.playerid],
            set: {
              points: drizzleSQL.raw(`EXCLUDED.points`),
            },
          })
          .returning({ playerpickid: playerPickInFantasy.playerpickid });
        await tx
          .update(pickInFantasy)
          .set({
            score: drizzleSQL.raw(`score + ${points}`),
          })
          .where(
            and(
              or(
                eq(pickInFantasy.player1id, playerid),
                eq(pickInFantasy.player2id, playerid),
                eq(pickInFantasy.player3id, playerid),
              ),
              eq(pickInFantasy.pickid, pick.pickid),
            ),
          );
      }),
    );
  });
}

async function insertLeaderboard(
  scheduleid: string,
  matchLink: string,
): Promise<ActionResult> {
  try {
    await db
      .update(leaderboardInFantasy)
      .set({
        matchlink: matchLink,
      })
      .where(eq(leaderboardInFantasy.scheduleid, scheduleid))
      .returning({
        leaderboardid: leaderboardInFantasy.leaderboardid,
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

  const scheduleid = await getLatestSeasonScheduleIDByDivisionAndWeek(
    division,
    week,
  );
  if (!scheduleid) {
    console.error(
      "No schedule found for division " + division + " and week " + week,
    );
    return {
      success: false,
      message: "No schedule found for the specified division and week.",
    };
  }

  const leaderboardid = await getLeaderboardIDByScheduleID(scheduleid);
  if (!leaderboardid) {
    console.error("No leaderboard found for schedule ID " + scheduleid);
    return {
      success: false,
      message: "No leaderboard found for the specified schedule.",
    };
  }

  const teamScores = new Array<{ teamID: string; score: number }>();
  const playerScores = new Array<{ playerID: string; score: number }>();

  for (const team of teams) {
    for (const player of team.player_stats) {
      const pScore =
        player.damageDealt * damageScore +
        player.assists * assistScore +
        player.knockdowns * knockdownScore +
        player.kills * killScore +
        player.respawnsGiven * respawnScore;
      const pLink = `https://overstat.gg/player/${player.playerId}`;
      const playerID = await getPlayerIDByPlayerLink(pLink);
      if (playerID !== null) {
        playerScores.push({ playerID: playerID, score: pScore });
      } else {
        await addPlayerToDB(player.name, pLink);
        const newPlayerID = await getPlayerIDByPlayerLink(pLink);
        playerScores.push({playerID: newPlayerID!, score: pScore})
      }
    }

    const tScore = team.overall_stats.placementArray.reduce(
      (acc: number, placement: number) => {
        return acc + placementScores[placement as keyof typeof placementScores];
      },
      0,
    );

    const teamID = await getTeamIDByTeamNameAndDivision(
      team.overall_stats.name.replace(/\'/g, ""),
      division,
    );
    if (teamID === null) continue;
    teamScores.push({ teamID: teamID, score: tScore });
  }

  await Promise.all([
    ...teamScores.map(async ({ teamID, score }) => {
      await handleTeamScoreInDB(teamID, score, leaderboardid);
    }),
    ...playerScores.map(async ({ playerID, score }) => {
      await handlePlayerScoreInDB(playerID, score, leaderboardid);
    }),
  ]);
  try {
    await insertLeaderboard(scheduleid, matchLink);
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

export async function deletePickByUserID(
  id: string,
  division: number,
  week: number,
) {
  try {
    await txDB.transaction(async (tx) => {
      const scheduleid = await getLatestSeasonScheduleIDByDivisionAndWeek(
        division,
        week,
      );
      if (!scheduleid) {
        console.error(
          "No schedule found for division " + division + " and week " + week,
        );
        return;
      }
      const leaderboardid = await getLeaderboardIDByScheduleID(scheduleid);
      if (!leaderboardid) {
        console.error("No leaderboard found for schedule ID " + scheduleid);
        return;
      }
      await tx
        .delete(pickInFantasy)
        .where(
          and(
            eq(pickInFantasy.submitterid, id),
            eq(pickInFantasy.leaderboardid, leaderboardid),
          ),
        );
    });
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
          .update(playerSeasonInFantasy)
          .set({
            divisions: drizzleSQL.raw(
              `array_remove(Divisions, ${division}::SMALLINT)`,
            ),
          })
          .where(eq(playerSeasonInFantasy.playerid, playerID));
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
  season: number,
  players: { name: string; osLink: string }[],
): Promise<ActionResult> {
  try {
    for (const player of players) {
      const sanitizedLink = sanitizeOSLink(player.osLink) ?? "";
      await txDB.transaction(async (tx) => {
        const res = await tx
          .insert(playerInFantasy)
          .values({
            name: player.name,
            osLink: sanitizedLink,
          })
          .returning({ playerid: playerInFantasy.playerid })
          .onConflictDoUpdate({
            target: playerInFantasy.osLink,
            set: {
              name: drizzleSQL.raw(`EXCLUDED.name`),
            },
          });

        const playerID = res[0].playerid;

        await tx
          .insert(playerSeasonInFantasy)
          .values({
            playerid: playerID,
            season: season,
            divisions: drizzleSQL`ARRAY[${division}]::SMALLINT[]`,
          })
          .onConflictDoUpdate({
            target: [
              playerSeasonInFantasy.playerid,
              playerSeasonInFantasy.season,
            ],
            set: {
              divisions: drizzleSQL`
                CASE
                    WHEN ${division} = ANY(${playerSeasonInFantasy.divisions})
                    THEN ${playerSeasonInFantasy.divisions}
                    ELSE array_append(${playerSeasonInFantasy.divisions}, ${division}::SMALLINT)
                END
            `,
            },
          });

        await tx
          .update(teamInFantasy)
          .set({
            player1id: drizzleSQL`CASE WHEN player1id IS NULL THEN ${playerID} ELSE player1id END`,
            player2id: drizzleSQL`CASE WHEN player1id IS NOT NULL AND player2id IS NULL THEN ${playerID} ELSE player2id END`,
            player3id: drizzleSQL`CASE WHEN player1id IS NOT NULL AND player2id IS NOT NULL AND player3id IS NULL THEN ${playerID} ELSE player3id END`,
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
            .update(playerSeasonInFantasy)
            .set({
              divisions: drizzleSQL.raw(
                `array_remove(Fantasy.PlayerSeason.Divisions, ${division}::SMALLINT)`,
              ),
            })
            .where(eq(playerSeasonInFantasy.playerid, playerID));
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
  season: number,
  players: { name: string; osLink: string }[],
): Promise<ActionResult> {
  try {
    const sanitizedPlayers = players
      .filter((p) => p.name.trim() && p.osLink.trim())
      .map((p) => ({
        name: p.name.trim().replace(/'/g, ""),
        osLink: sanitizeOSLink(p.osLink) ?? "",
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
        season: season,
      })
      .returning({ teamid: teamInFantasy.teamid });

    await addPlayerToTeam(teamID[0].teamid, division, season, sanitizedPlayers);

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

// everybody say thank you claude
export async function importTeamsFromCSV(
  csvText: string,
  division: number,
  season: number,
): Promise<ActionResult> {
  try {
    const teams = parseCSV(csvText);
    if (teams.length === 0)
      return { success: false, message: "No valid rows found in CSV." };

    const allPlayers = teams.flatMap((t) =>
      t.players.filter(Boolean).map((p) => ({ ...p!, teamName: t.teamName })),
    );

    for (const player of allPlayers) {
      await db
        .insert(playerInFantasy)
        .values({ name: player.name, osLink: player.link })
        .onConflictDoUpdate({
          target: playerInFantasy.osLink,
          set: { name: player.name },
        });
    }

    for (const player of allPlayers) {
      const existing = await db
        .select({ playerid: playerInFantasy.playerid })
        .from(playerInFantasy)
        .where(eq(playerInFantasy.osLink, player.link));

      if (!existing[0]) continue;

      await db
        .insert(playerSeasonInFantasy)
        .values({
          playerid: existing[0].playerid,
          season: season,
          divisions: drizzleSQL`ARRAY[${division}]::SMALLINT[]`,
        })
        .onConflictDoUpdate({
          target: [
            playerSeasonInFantasy.playerid,
            playerSeasonInFantasy.season,
          ],
          set: {
            divisions: drizzleSQL`
                            CASE
                                WHEN ${division} = ANY(${playerSeasonInFantasy.divisions})
                                THEN ${playerSeasonInFantasy.divisions}
                                ELSE array_append(${playerSeasonInFantasy.divisions}, ${division}::SMALLINT)
                            END
                        `,
          },
        });
    }

    for (const team of teams) {
      const getID = async (p: { link: string } | null) => {
        if (!p) return null;
        const rows = await db
          .select({ playerid: playerInFantasy.playerid })
          .from(playerInFantasy)
          .where(eq(playerInFantasy.osLink, p.link));
        return rows[0]?.playerid ?? null;
      };

      const [id1, id2, id3] = await Promise.all([
        getID(team.players[0]),
        getID(team.players[1]),
        getID(team.players[2]),
      ]);

      await db.insert(teamInFantasy).values({
        name: team.teamName,
        division: division,
        season: season,
        player1id: id1,
        player2id: id2,
        player3id: id3,
      });
    }

    revalidatePath("/admin");
    return {
      success: true,
    };
  } catch (error) {
    console.error("CSV import error:", error);
    return {
      success: false,
      message: "A database error occurred during import.",
    };
  }
}

export async function addPlayerToDB(
  name: string,
  osLink: string,
): Promise<ActionResult> {
  try {

    await db
      .insert(playerInFantasy)
      .values({ name, osLink: osLink })
      .onConflictDoNothing({ target: playerInFantasy.osLink });

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "A database error occurred. Please try again.",
    };
  }
}