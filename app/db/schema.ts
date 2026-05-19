import {
  pgSchema,
  uuid,
  text,
  unique,
  check,
  smallint,
  timestamp,
  foreignKey,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const fantasy = pgSchema("fantasy");

export const adminInFantasy = fantasy.table("admin", {
  adminid: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
});

export const scheduleInFantasy = fantasy.table(
  "schedule",
  {
    scheduleid: uuid().defaultRandom().primaryKey().notNull(),
    season: smallint().notNull(),
    week: smallint().notNull(),
    division: smallint().notNull(),
    gamedate: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    unique("uq_schedule_season_week_division").on(
      table.season,
      table.week,
      table.division,
    ),
    check("schedule_week_check", sql`(week >= 1) AND (week <= 7)`),
    check("schedule_division_check", sql`(division >= 1) AND (division <= 7)`),
  ],
);

export const playerInFantasy = fantasy.table(
  "player",
  {
    playerid: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    osLink: text("os_link").notNull(),
  },
  (table) => [
    unique("uq_player_os_link").on(table.osLink),
    check(
      "chk_player_os_link",
      sql`os_link ~ '^https://overstat\.gg/player/[0-9]+$'::text`,
    ),
  ],
);

export const playerSeasonInFantasy = fantasy.table(
  "playerseason",
  {
    playerseasonid: uuid().defaultRandom().primaryKey().notNull(),
    playerid: uuid().notNull(),
    season: smallint().notNull(),
    divisions: smallint().array().default([]).notNull(),
    overallpoints: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    gamesplayed: integer().default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.playerid],
      foreignColumns: [playerInFantasy.playerid],
      name: "playerseason_playerid_fkey",
    }).onDelete("cascade"),
    unique("uq_playerseason_player_season").on(table.playerid, table.season),
  ],
);

export const teamInFantasy = fantasy.table(
  "team",
  {
    teamid: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    division: smallint(),
    season: smallint().notNull(),
    weeksplayed: integer().default(0).notNull(),
    overallpoints: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    player1id: uuid(),
    player2id: uuid(),
    player3id: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.player1id],
      foreignColumns: [playerInFantasy.playerid],
      name: "team_player1id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.player2id],
      foreignColumns: [playerInFantasy.playerid],
      name: "team_player2id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.player3id],
      foreignColumns: [playerInFantasy.playerid],
      name: "team_player3id_fkey",
    }).onDelete("set null"),
    check(
      "chk_players_distinct",
      sql`((player1id IS NULL) OR (player2id IS NULL) OR (player1id <> player2id)) AND ((player1id IS NULL) OR (player3id IS NULL) OR (player1id <> player3id)) AND ((player2id IS NULL) OR (player3id IS NULL) OR (player2id <> player3id))`,
    ),
    check("team_division_check", sql`(division >= 1) AND (division <= 7)`),
  ],
);

export const leaderboardInFantasy = fantasy.table(
  "leaderboard",
  {
    leaderboardid: uuid().defaultRandom().primaryKey().notNull(),
    scheduleid: uuid().notNull(),
    matchlink: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.scheduleid],
      foreignColumns: [scheduleInFantasy.scheduleid],
      name: "leaderboard_scheduleid_fkey",
    }).onDelete("restrict"),
    unique("uq_leaderboard_scheduleid").on(table.scheduleid),
    check(
      "chk_leaderboard_match_link",
      sql`matchlink ~* '^https://overstat\.gg/tournament/vesa(?:\w|%20)?league/[0-9]+'::text`,
    ),
  ],
);

export const pickInFantasy = fantasy.table(
  "pick",
  {
    pickid: uuid().defaultRandom().primaryKey().notNull(),
    submittedon: timestamp({ withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    submitterid: text().notNull(),
    submittername: text().notNull(),
    leaderboardid: uuid().notNull(),
    teamid: uuid().notNull(),
    player1id: uuid().notNull(),
    player2id: uuid().notNull(),
    player3id: uuid().notNull(),
    score: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
  },
  (table) => [
    index("idx_pick_leaderboard").using(
      "btree",
      table.leaderboardid.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.leaderboardid],
      foreignColumns: [leaderboardInFantasy.leaderboardid],
      name: "pick_leaderboardid_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.player1id],
      foreignColumns: [playerInFantasy.playerid],
      name: "pick_player1id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.player2id],
      foreignColumns: [playerInFantasy.playerid],
      name: "pick_player2id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.player3id],
      foreignColumns: [playerInFantasy.playerid],
      name: "pick_player3id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.teamid],
      foreignColumns: [teamInFantasy.teamid],
      name: "pick_teamid_fkey",
    }).onDelete("restrict"),
    unique("uq_pick_submitter_leaderboard").on(
      table.submitterid,
      table.leaderboardid,
    ),
    check(
      "chk_players_distinct",
      sql`(player1id <> player2id) AND (player1id <> player3id) AND (player2id <> player3id)`,
    ),
  ],
);

export const playerPickInFantasy = fantasy.table(
  "playerpick",
  {
    playerpickid: uuid().defaultRandom().primaryKey().notNull(),
    pickid: uuid().notNull(),
    playerid: uuid().notNull(),
    points: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.pickid],
      foreignColumns: [pickInFantasy.pickid],
      name: "playerpick_pickid_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.playerid],
      foreignColumns: [playerInFantasy.playerid],
      name: "playerpick_playerid_fkey",
    }).onDelete("restrict"),
    unique("uq_playerpick_pick_player").on(table.pickid, table.playerid),
  ],
);

export const teamPickInFantasy = fantasy.table(
  "teampick",
  {
    teampickid: uuid().defaultRandom().primaryKey().notNull(),
    pickid: uuid().notNull(),
    teamid: uuid().notNull(),
    points: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.pickid],
      foreignColumns: [pickInFantasy.pickid],
      name: "teampick_pickid_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.teamid],
      foreignColumns: [teamInFantasy.teamid],
      name: "teampick_teamid_fkey",
    }).onDelete("restrict"),
    unique("uq_teampick_pick_team").on(table.pickid, table.teamid),
  ],
);

export const playerMatchResultInFantasy = fantasy.table(
  "playermatchresult",
  {
    playerresultid: uuid().defaultRandom().primaryKey().notNull(),
    playerid: uuid().notNull(),
    leaderboardid: uuid().notNull(),
    points: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.playerid],
      foreignColumns: [playerInFantasy.playerid],
      name: "playermatchresult_playerid_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.leaderboardid],
      foreignColumns: [leaderboardInFantasy.leaderboardid],
      name: "playermatchresult_leaderboardid_fkey",
    }).onDelete("restrict"),
    unique("uq_playermatchresult_player_leaderboard").on(
      table.playerid,
      table.leaderboardid,
    ),
  ],
);

// ---- Inferred Types ----
export type PlayerSelect = typeof playerInFantasy.$inferSelect;
export type PlayerSeasonSelect = typeof playerSeasonInFantasy.$inferSelect;
export type TeamSelect = typeof teamInFantasy.$inferSelect;
export type PickSelect = typeof pickInFantasy.$inferSelect;
export type PlayerPickSelect = typeof playerPickInFantasy.$inferSelect;
export type TeamPickSelect = typeof teamPickInFantasy.$inferSelect;
export type PlayerMatchResultSelect =
  typeof playerMatchResultInFantasy.$inferSelect;
export type LeaderboardSelect = typeof leaderboardInFantasy.$inferSelect;
export type ScheduleSelect = typeof scheduleInFantasy.$inferSelect;
