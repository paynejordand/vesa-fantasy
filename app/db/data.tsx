import { sql } from "@/app/db/db";
import { Team, Pick, Player } from "@/app/db/definitions";

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
      await sql`SELECT * FROM Fantasy.Player WHERE division = ${division}`;
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      PlayerID: row.playerid,
      Name: row.name,
      OS_Link: row.os_link,
      OverallPoints: row.overallpoints,
      Division: row.division,
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
      Player3ID: row.player3id
    }));
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Players");
  }
}