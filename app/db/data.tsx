import { sql, db } from "@/app/db/db";
import {
  LeaderboardWithPickNames,
  TeamWithPlayers,
} from "@/app/db/definitions";
import { playerInFantasy, teamInFantasy, pickInFantasy } from "@/app/db/schema";
import {
  PlayerSelect,
  TeamSelect,
  PickSelect,
  ScheduleSelect,
} from "@/app/db/schema";
import { adminInFantasy, scheduleInFantasy } from "@/drizzle/schema";
import {
  eq,
  and,
  arrayContains,
  gt,
} from "drizzle-orm/sql/expressions/conditions";
import { asc } from "drizzle-orm/sql/expressions/select";

export async function getTeamIDByTeamNameAndDivision(
  name: string,
  division: number,
): Promise<string | null> {
  try {
    const rows = await db
      .select({ teamid: teamInFantasy.teamid })
      .from(teamInFantasy)
      .where(
        and(eq(teamInFantasy.name, name), eq(teamInFantasy.division, division)),
      );
    if (rows.length === 0) return null;
    return rows[0].teamid;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve TeamID");
  }
}

export async function getPlayerIDByPlayerLink(
  link: string,
): Promise<string | null> {
  try {
    const rows = await db
      .select({ playerid: playerInFantasy.playerid })
      .from(playerInFantasy)
      .where(eq(playerInFantasy.osLink, link));
    if (rows.length === 0) return null;
    return rows[0].playerid;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve PlayerID");
  }
}

export async function getPlayersByDivision(
  division: number,
): Promise<Array<PlayerSelect> | null> {
  try {
    const rows = await db
      .select()
      .from(playerInFantasy)
      .where(arrayContains(playerInFantasy.divisions, [division]));
    if (rows.length === 0) return null;
    return rows;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Players");
  }
}

export async function getTeamsByDivision(
  division: number,
): Promise<Array<TeamSelect> | null> {
  try {
    const rows = await db
      .select()
      .from(teamInFantasy)
      .where(eq(teamInFantasy.division, division));
    if (rows.length === 0) return null;
    return rows;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Teams");
  }
}

export async function getPickByUsername(
  name: string,
  division: number,
  week: number,
): Promise<PickSelect | null> {
  try {
    const rows = await db
      .select()
      .from(pickInFantasy)
      .where(
        and(
          eq(pickInFantasy.submittedby, name),
          eq(pickInFantasy.division, division),
          eq(pickInFantasy.week, week),
        ),
      );
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Pick");
  }
}

export async function getAdminByUsername(
  name: string,
): Promise<boolean | null> {
  try {
    const rows = await db
      .select()
      .from(adminInFantasy)
      .where(eq(adminInFantasy.name, name));
    return rows.length !== 0;
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Admin");
  }
}

export async function getLeaderboardByDivisionAndWeek(
  division: number,
  week: number,
): Promise<LeaderboardWithPickNames | null> {
  try {
    const rows = await sql`
        SELECT 
        l.leaderboardid,
        l.division,
        l.week,
        l.matchlink,
        p.pickid,
        p.submittedon,
        p.submittedby,
        p.score,
        p.leaderboardid,
        t.name AS teamname,
        p1.name AS player1name,
        p2.name AS player2name,
        p3.name AS player3name,
        p.p1score,
        p.p2score,
        p.p3score,
        p.tscore
    FROM Fantasy.Leaderboard l
    LEFT JOIN Fantasy.Pick p       ON p.leaderboardid = l.leaderboardid
    LEFT JOIN Fantasy.Team t       ON p.teamid        = t.teamid
    LEFT JOIN Fantasy.Player p1    ON p.player1id     = p1.playerid
    LEFT JOIN Fantasy.Player p2    ON p.player2id     = p2.playerid
    LEFT JOIN Fantasy.Player p3    ON p.player3id     = p3.playerid
    WHERE l.division = ${division} AND l.week = ${week}
    ORDER BY p.score DESC
    `;

    if (rows.length === 0) return null;

    const first = rows[0];

    const leaderboard: LeaderboardWithPickNames = {
      leaderboardid: first.leaderboardid,
      division: first.division,
      week: first.week,
      matchlink: first.matchlink,
      Picks: rows
        .filter((row) => row.pickid !== null)
        .map((row) => ({
          PickID: row.pickid,
          Division: row.division,
          Week: row.week,
          SubmittedOn: row.submittedon,
          SubmittedBy: row.submittedby,
          Score: row.score,
          TeamName: row.teamname,
          Player1Name: row.player1name,
          Player2Name: row.player2name,
          Player3Name: row.player3name,
          LeaderboardID: row.leaderboardid,
          P1Score: row.p1score,
          P2Score: row.p2score,
          P3Score: row.p3score,
          TScore: row.tscore,
        })),
    };

    return leaderboard;
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Leaderboard");
  }
}

export async function getWeeksAndDivisionsFromSchedule(): Promise<
  { division: number; week: number }[]
> {
  try {
    const rows = await db
      .selectDistinct({
        division: scheduleInFantasy.division,
        week: scheduleInFantasy.week,
      })
      .from(scheduleInFantasy)
      .orderBy(asc(scheduleInFantasy.division), asc(scheduleInFantasy.week));
    if (rows.length === 0) return [];
    return rows.map((row) => ({
      division: row.division,
      week: row.week,
    }));
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Schedule");
  }
}

export async function getMatchStartTimeByDivisionAndWeek(
  division: number,
  week: number,
): Promise<Date | null> {
  try {
    const rows = await db
      .select({ gamedate: scheduleInFantasy.gamedate })
      .from(scheduleInFantasy)
      .where(
        and(
          eq(scheduleInFantasy.division, division),
          eq(scheduleInFantasy.week, week),
        ),
      );
    if (rows.length === 0) return null;
    return new Date(rows[0].gamedate);
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Match Start Time");
  }
}

export async function getFutureMatchesFromSchedule(): Promise<Array<ScheduleSelect> | null> {
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(scheduleInFantasy)
      .where(gt(scheduleInFantasy.gamedate, now.toDateString()))
      .orderBy(asc(scheduleInFantasy.gamedate));
    console.log("Future matches: ", rows);
    if (rows.length === 0) return null;
    return rows;
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Future Matches");
  }
}

export async function getTeamsWithPlayerNames(): Promise<
  Array<TeamWithPlayers>
> {
  try {
    const rows = await sql`
    SELECT
        t.teamid,
        t.name,
        t.division,
        t.player1id,
        t.player2id,
        t.player3id,
        p1.name AS player1name,
        p1.os_link AS player1oslink,
        p2.name AS player2name,
        p2.os_link AS player2oslink,
        p3.name AS player3name,
        p3.os_link AS player3oslink
    FROM Fantasy.Team t
    LEFT JOIN Fantasy.Player p1 ON t.player1id = p1.playerid
    LEFT JOIN Fantasy.Player p2 ON t.player2id = p2.playerid
    LEFT JOIN Fantasy.Player p3 ON t.player3id = p3.playerid
    ORDER BY t.division, t.name
`;
    if (rows.length === 0) return [];
    return rows.map((row) => ({
      TeamID: row.teamid,
      Name: row.name,
      Division: row.division,
      Player1ID: row.player1id,
      Player1Name: row.player1name ?? "",
      Player1OSLink: row.player1oslink ?? "",
      Player2ID: row.player2id,
      Player2Name: row.player2name ?? "",
      Player2OSLink: row.player2oslink ?? "",
      Player3ID: row.player3id,
      Player3Name: row.player3name ?? "",
      Player3OSLink: row.player3oslink ?? "",
    }));
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Teams with Player Names");
  }
}
