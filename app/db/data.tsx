import { sql } from "@/app/db/db";
import {
  Team,
  Pick,
  Player,
  Schedule,
  LeaderboardWithPickNames,
} from "@/app/db/definitions";

export async function getTeamByPlayerID(
  playerID: string,
): Promise<Team | null> {
  try {
    const rows = await sql`SELECT * FROM Fantasy.Team
    WHERE Player1ID = ${playerID} OR Player2ID = ${playerID} OR Player3ID = ${playerID};`;
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      TeamID: row.teamid,
      Name: row.name,
      Division: row.division,
      WeeksPlayed: row.weeksplayed,
      OverallPoints: row.overallpoints,
      Player1ID: row.player1id,
      Player2ID: row.player2id,
      Player3ID: row.player3id,
    };
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve team");
  }
}

export async function getPicksByDivisionAndWeek(
  division: number,
  week: number,
): Promise<Pick[] | null> {
  try {
    const rows =
      await sql`SELECT * FROM Fantasy.Pick WHERE division = ${division} AND week = ${week}`;
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      PickID: row.pickid,
      Division: row.division,
      Week: row.week,
      SubmittedOn: row.submittedon,
      SubmittedBy: row.submittedby,
      Score: row.score,
      TeamID: row.teamid,
      Player1ID: row.player1id,
      Player2ID: row.player2id,
      Player3ID: row.player3id,
      LeaderboardID: row.leaderboardid,
    }));
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Picks");
  }
}

export async function getTeamIDByTeamNameAndDivision(
  name: string,
  division: number,
): Promise<string | null> {
  try {
    const rows =
      await sql`SELECT teamid FROM Fantasy.Team WHERE name = ${name} AND division = ${division}`;
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
    const rows =
      await sql`SELECT playerid FROM Fantasy.Player WHERE os_link = ${link}`;
    if (rows.length === 0) return null;
    return rows[0].playerid;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve PlayerID");
  }
}

export async function getPlayersByDivision(
  division: number,
): Promise<Array<Player> | null> {
  try {
    const rows =
      await sql`SELECT * FROM Fantasy.Player WHERE ${division} = ANY(divisions)`;
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      PlayerID: row.playerid,
      Name: row.name,
      OS_Link: row.os_link,
      OverallPoints: row.overallpoints,
      Divisions: row.divisions,
      GamesPlayed: row.gamesplayed,
    }));
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Players");
  }
}

export async function getTeamsByDivision(
  division: number,
): Promise<Array<Team> | null> {
  try {
    const rows =
      await sql`SELECT * FROM Fantasy.Team WHERE division = ${division}`;
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      TeamID: row.teamid,
      Name: row.name,
      OverallPoints: row.overallpoints,
      Division: row.division,
      WeeksPlayed: row.weeksplayed,
      Player1ID: row.player1id,
      Player2ID: row.player2id,
      Player3ID: row.player3id,
    }));
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Players");
  }
}

export async function getPickByUsername(
  name: string,
  division: number,
  week: number,
): Promise<Pick | null> {
  try {
    const rows =
      await sql`SELECT * FROM Fantasy.Pick WHERE submittedby = ${name} AND division = ${division} AND week = ${week}`;
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      PickID: row.pickid,
      Division: row.division,
      Week: row.week,
      SubmittedOn: row.submittedon,
      SubmittedBy: row.submittedby,
      Score: row.score,
      TeamID: row.teamid,
      Player1ID: row.player1id,
      Player2ID: row.player2id,
      Player3ID: row.player3id,
    };
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Pick");
  }
}

export async function getNumberOfDivisions(): Promise<number | null> {
  try {
    const rows = await sql`SELECT MAX(division) FROM Fantasy.player`;
    if (rows.length === 0) return 0;
    const row = rows[0];
    return row.max;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Division");
  }
}

export async function getAdminByUsername(
  name: string,
): Promise<boolean | null> {
  try {
    const rows = await sql`SELECT * FROM Fantasy.Admin WHERE name = ${name}`;
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
      LeaderboardID: first.leaderboardid,
      Division: first.division,
      Week: first.week,
      MatchLink: first.matchlink,
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
    const rows =
      await sql`SELECT DISTINCT division, week FROM Fantasy.Schedule ORDER BY division, week`;
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
    const rows =
      await sql`SELECT gamedate FROM Fantasy.Schedule WHERE division = ${division} AND week = ${week}`;
    if (rows.length === 0) return null;
    return rows[0].gamedate;
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Match Start Time");
  }
}

export async function getFutureMatchesFromSchedule(): Promise<Array<Schedule> | null> {
  try {
    const now = new Date();
    const rows = await sql`SELECT * FROM Fantasy.Schedule WHERE gamedate > ${now} ORDER BY gamedate ASC`;
    return rows.map((row) => ({
      ScheduleID: row.scheduleid,
      Season: row.season,
      Division: row.division,
      Week: row.week,
      GameDate: row.gamedate,
    }));
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Future Matches");
  }
}