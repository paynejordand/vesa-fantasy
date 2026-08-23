import { db } from "@/app/db/db";
import {
  LeaderboardWithPickNames,
  Player,
  TeamWithPlayers,
  PlayerResults,
} from "@/app/db/definitions";
import {
  playerInFantasy,
  teamInFantasy,
  pickInFantasy,
  leaderboardInFantasy,
  playerSeasonInFantasy,
  playerPickInFantasy,
  teamPickInFantasy,
  PickSelect,
  playerMatchResultInFantasy,
} from "@/app/db/schema";
import { TeamSelect, ScheduleSelect } from "@/app/db/schema";
import { adminInFantasy, scheduleInFantasy } from "@/drizzle/schema";

import { asc, desc } from "drizzle-orm/sql/expressions/select";
import { eq, and, arrayContains, gt, max, isNotNull, sum } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function getPickByUserID(
  userID: string,
  division: number,
  week: number,
): Promise<PickSelect | null> {
  try {
    const rows = await db
      .select({
        pickid: pickInFantasy.pickid!,
        submittedon: pickInFantasy.submittedon!,
        submitterid: pickInFantasy.submitterid!,
        submittername: pickInFantasy.submittername!,
        leaderboardid: pickInFantasy.leaderboardid!,
        teamid: pickInFantasy.teamid!,
        player1id: pickInFantasy.player1id!,
        player2id: pickInFantasy.player2id!,
        player3id: pickInFantasy.player3id!,
        score: pickInFantasy.score!,
      })
      .from(pickInFantasy)
      .leftJoin(
        leaderboardInFantasy,
        eq(pickInFantasy.leaderboardid, leaderboardInFantasy.leaderboardid),
      )
      .leftJoin(
        scheduleInFantasy,
        eq(leaderboardInFantasy.scheduleid, scheduleInFantasy.scheduleid),
      )
      .where(
        and(
          eq(pickInFantasy.submitterid, userID),
          eq(scheduleInFantasy.division, division),
          eq(scheduleInFantasy.week, week),
        ),
      );
    if (rows.length === 0) return null;
    return rows[0];
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Pick");
  }
}

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
): Promise<Array<Player> | null> {
  try {
    const rows = await db
      .select()
      .from(playerInFantasy)
      .leftJoin(
        playerSeasonInFantasy,
        eq(playerInFantasy.playerid, playerSeasonInFantasy.playerid),
      )
      .where(
        and(
          arrayContains(playerSeasonInFantasy.divisions, [division]),
          eq(
            playerSeasonInFantasy.season,
            db
              .select({ season: max(playerSeasonInFantasy.season) })
              .from(playerSeasonInFantasy),
          ),
        ),
      );

    if (rows.length === 0) return null;

    return rows.map((row) => ({
      playerid: row.player.playerid,
      name: row.player.name,
      osLink: row.player.osLink,
      overallpoints: Number(row.playerseason!.overallpoints),
      divisions: row.playerseason!.divisions,
      gamesplayed: row.playerseason!.gamesplayed,
    }));
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
      .where(
        and(
          eq(teamInFantasy.division, division),
          eq(
            teamInFantasy.season,
            db
              .select({ season: max(teamInFantasy.season) })
              .from(teamInFantasy),
          ),
        ),
      );

    if (rows.length === 0) return null;
    return rows;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve Teams");
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
  season: number,
  division: number,
  week: number,
): Promise<LeaderboardWithPickNames | null> {
  try {
    const p1 = alias(playerInFantasy, "p1");
    const p2 = alias(playerInFantasy, "p2");
    const p3 = alias(playerInFantasy, "p3");
    const pp1 = alias(playerPickInFantasy, "pp1");
    const pp2 = alias(playerPickInFantasy, "pp2");
    const pp3 = alias(playerPickInFantasy, "pp3");

    const rows = await db
      .select({
        leaderboardid: leaderboardInFantasy.leaderboardid,
        scheduleid: leaderboardInFantasy.scheduleid,
        division: scheduleInFantasy.division,
        week: scheduleInFantasy.week,
        matchlink: leaderboardInFantasy.matchlink,
        pickid: pickInFantasy.pickid,
        submittedon: pickInFantasy.submittedon,
        submittedby: pickInFantasy.submittername,
        score: pickInFantasy.score,
        teamname: teamInFantasy.name,
        player1name: p1.name,
        player2name: p2.name,
        player3name: p3.name,
        p1score: pp1.points,
        p2score: pp2.points,
        p3score: pp3.points,
        tscore: teamPickInFantasy.points,
      })
      .from(leaderboardInFantasy)
      .leftJoin(
        scheduleInFantasy,
        eq(leaderboardInFantasy.scheduleid, scheduleInFantasy.scheduleid),
      )
      .leftJoin(
        pickInFantasy,
        eq(leaderboardInFantasy.leaderboardid, pickInFantasy.leaderboardid),
      )
      .leftJoin(teamInFantasy, eq(pickInFantasy.teamid, teamInFantasy.teamid))
      .leftJoin(p1, eq(pickInFantasy.player1id, p1.playerid))
      .leftJoin(p2, eq(pickInFantasy.player2id, p2.playerid))
      .leftJoin(p3, eq(pickInFantasy.player3id, p3.playerid))
      .leftJoin(
        pp1,
        and(
          eq(pickInFantasy.pickid, pp1.pickid),
          eq(pickInFantasy.player1id, pp1.playerid),
        ),
      )
      .leftJoin(
        pp2,
        and(
          eq(pickInFantasy.pickid, pp2.pickid),
          eq(pickInFantasy.player2id, pp2.playerid),
        ),
      )
      .leftJoin(
        pp3,
        and(
          eq(pickInFantasy.pickid, pp3.pickid),
          eq(pickInFantasy.player3id, pp3.playerid),
        ),
      )
      .leftJoin(
        teamPickInFantasy,
        eq(pickInFantasy.pickid, teamPickInFantasy.pickid),
      )
      .where(
        and(
          eq(scheduleInFantasy.division, division),
          eq(scheduleInFantasy.week, week),
          eq(scheduleInFantasy.season, season),
        ),
      )
      .orderBy(desc(pickInFantasy.score));

    if (rows.length === 0) return null;

    const first = rows[0];

    const leaderboard: LeaderboardWithPickNames = {
      scheduleid: first.scheduleid!,
      leaderboardid: first.leaderboardid!,
      matchlink: first.matchlink!,
      Picks: rows
        .filter((row) => row.pickid !== null)
        .map((row) => ({
          PickID: row.pickid!,
          Division: row.division!,
          Week: row.week!,
          SubmittedOn: new Date(row.submittedon!),
          SubmittedBy: row.submittedby!,
          Score: Number(row.score!),
          TeamName: row.teamname!,
          Player1Name: row.player1name!,
          Player2Name: row.player2name!,
          Player3Name: row.player3name!,
          LeaderboardID: row.leaderboardid!,
          P1Score: Number(row.p1score!),
          P2Score: Number(row.p2score!),
          P3Score: Number(row.p3score!),
          TScore: Number(row.tscore!),
        })),
      Week: first.week!,
      Division: first.division!,
    };

    return leaderboard;
  } catch (error) {
    console.error("Database error: ", error);
    throw new Error("Database failed to retrieve Leaderboard");
  }
}

export async function getWeeksAndDivisionsFromScheduleBySeason(
  season: number,
): Promise<{ division: number; week: number }[]> {
  try {
    const rows = await db
      .select({
        division: scheduleInFantasy.division,
        week: scheduleInFantasy.week,
      })
      .from(scheduleInFantasy)
      .where(eq(scheduleInFantasy.season, season))
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
      .orderBy(desc(scheduleInFantasy.season))
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
    const p1 = alias(playerInFantasy, "p1");
    const p2 = alias(playerInFantasy, "p2");
    const p3 = alias(playerInFantasy, "p3");

    const sq = db
      .select({ curr_season: max(teamInFantasy.season).as("curr_season") })
      .from(teamInFantasy)
      .as("sq");

    const rows = await db
      .select({
        teamid: teamInFantasy.teamid,
        name: teamInFantasy.name,
        season: teamInFantasy.season,
        division: teamInFantasy.division,
        player1id: teamInFantasy.player1id,
        player2id: teamInFantasy.player2id,
        player3id: teamInFantasy.player3id,
        player1name: p1.name,
        player1oslink: p1.osLink,
        player2name: p2.name,
        player2oslink: p2.osLink,
        player3name: p3.name,
        player3oslink: p3.osLink,
      })
      .from(teamInFantasy)
      .where(isNotNull(teamInFantasy.division))
      .innerJoin(sq, eq(sq.curr_season, teamInFantasy.season))
      .leftJoin(p1, eq(teamInFantasy.player1id, p1.playerid))
      .leftJoin(p2, eq(teamInFantasy.player2id, p2.playerid))
      .leftJoin(p3, eq(teamInFantasy.player3id, p3.playerid));

    if (rows.length === 0) return [];
    return rows.map((row) => ({
      TeamID: row.teamid,
      Name: row.name,
      Season: row.season,
      Division: row.division!,
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

export async function getLeaderboardIDByDivisionAndWeek(
  division: number,
  week: number,
): Promise<string | null> {
  try {
    const rows = await db
      .select({ leaderboardid: leaderboardInFantasy.leaderboardid })
      .from(leaderboardInFantasy)
      .leftJoin(
        scheduleInFantasy,
        eq(leaderboardInFantasy.scheduleid, scheduleInFantasy.scheduleid),
      )
      .where(
        and(
          eq(scheduleInFantasy.division, division),
          eq(scheduleInFantasy.week, week),
        ),
      )
      .orderBy(desc(scheduleInFantasy.season));
    if (rows.length === 0) return null;
    return rows[0].leaderboardid;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve LeaderboardIDs");
  }
}

export async function getLatestSeasonScheduleIDByDivisionAndWeek(
  division: number,
  week: number,
): Promise<string | null> {
  try {
    const rows = await db
      .select({ scheduleid: scheduleInFantasy.scheduleid })
      .from(scheduleInFantasy)
      .where(
        and(
          eq(scheduleInFantasy.division, division),
          eq(scheduleInFantasy.week, week),
        ),
      )
      .orderBy(desc(scheduleInFantasy.season));
    if (rows.length === 0) return null;
    return rows[0].scheduleid;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve ScheduleID");
  }
}

export async function getLeaderboardIDByScheduleID(
  scheduleID: string,
): Promise<string | null> {
  try {
    const rows = await db
      .select({ leaderboardid: leaderboardInFantasy.leaderboardid })
      .from(leaderboardInFantasy)
      .where(eq(leaderboardInFantasy.scheduleid, scheduleID));
    if (rows.length === 0) return null;
    return rows[0].leaderboardid;
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve LeaderboardID");
  }
}

export async function getPlayerResultsByLeaderboardID(
  leaderboardid: string,
): Promise<PlayerResults[] | null> {
  try {
    const rows = await db
      .select()
      .from(playerMatchResultInFantasy)
      .leftJoin(
        playerInFantasy,
        eq(playerInFantasy.playerid, playerMatchResultInFantasy.playerid),
      )
      .where(eq(playerMatchResultInFantasy.leaderboardid, leaderboardid));
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      playerid: row.playermatchresult.playerid,
      leaderboardid: row.playermatchresult.leaderboardid,
      playerresultid: row.playermatchresult.playerresultid,
      points: row.playermatchresult.points,
      Name: row.player!.name,
    }));
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve LeaderboardID");
  }
}

export async function getSeasonsFromSchedule(): Promise<number[] | null> {
  try {
    const rows = await db
      .selectDistinct({ season: scheduleInFantasy.season })
      .from(scheduleInFantasy)
      .orderBy(desc(scheduleInFantasy.season));
    if (rows.length === 0) return null;
    return rows.map((row) => row.season);
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve seasons");
  }
}

export async function getSummedPicksBySeasonAndWeek(
  season: number,
  week: number | null,
) {
  try {
    const rows = await db
      .select({
        name: pickInFantasy.submittername,
        totalpoints: sum(pickInFantasy.score).as("totalpoints"),
      })
      .from(pickInFantasy)
      .leftJoin(
        leaderboardInFantasy,
        eq(pickInFantasy.leaderboardid, leaderboardInFantasy.leaderboardid),
      )
      .leftJoin(
        scheduleInFantasy,
        eq(leaderboardInFantasy.scheduleid, scheduleInFantasy.scheduleid),
      )
      .where(
        and(
          eq(scheduleInFantasy.season, season),
          week ? eq(scheduleInFantasy.week, week) : undefined,
        ),
      )
      .groupBy(pickInFantasy.submittername)
      .orderBy(desc(sum(pickInFantasy.score)));
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      name: row.name,
      totalpoints: Number(row.totalpoints),
    }));
  } catch (e) {
    console.error("Database error: ", e);
    throw new Error("Database failed to retrieve summed picks");
  }
}