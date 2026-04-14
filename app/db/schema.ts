import {
  pgTable,
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

export const teamInFantasy = fantasy.table(
  "team",
  {
    teamid: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    division: smallint().notNull(),
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
    division: smallint().notNull(),
    week: smallint().notNull(),
    matchlink: text().notNull(),
  },
  (table) => [
    index("idx_lb_division_week").using(
      "btree",
      table.division.asc().nullsLast().op("int2_ops"),
      table.week.asc().nullsLast().op("int2_ops"),
    ),
    unique("uq_leaderboard_division_week").on(table.division, table.week),
    check(
      "leaderboard_division_check",
      sql`(division >= 1) AND (division <= 7)`,
    ),
    check("leaderboard_week_check", sql`(week >= 1) AND (week <= 7)`),
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
    division: smallint().notNull(),
    week: smallint().notNull(),
    submittedon: timestamp({ withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    submittedby: text().notNull(),
    teamid: uuid().notNull(),
    player1id: uuid().notNull(),
    player2id: uuid().notNull(),
    player3id: uuid().notNull(),
    leaderboardid: uuid(),
    p1score: numeric({ precision: 1000, scale: 2 }).default("0").notNull(),
    p2score: numeric({ precision: 1000, scale: 2 }).default("0").notNull(),
    p3score: numeric({ precision: 1000, scale: 2 }).default("0").notNull(),
    tscore: numeric({ precision: 1000, scale: 2 }).default("0").notNull(),
    score: numeric({ precision: 1000, scale: 2 }).generatedAlwaysAs(
      sql`(((p1score + p2score) + p3score) + tscore)`,
    ),
  },
  (table) => [
    index("idx_pick_division_week").using(
      "btree",
      table.division.asc().nullsLast().op("int2_ops"),
      table.week.asc().nullsLast().op("int2_ops"),
    ),
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
    foreignKey({
      columns: [table.leaderboardid],
      foreignColumns: [leaderboardInFantasy.leaderboardid],
      name: "pick_leaderboardid_fkey",
    }).onDelete("set null"),
    unique("uq_pick_user_division_week").on(
      table.division,
      table.week,
      table.submittedby,
    ),
    check("pick_division_check", sql`(division >= 1) AND (division <= 7)`),
    check("pick_week_check", sql`(week >= 1) AND (week <= 7)`),
    check(
      "chk_players_distinct",
      sql`(player1id <> player2id) AND (player1id <> player3id) AND (player2id <> player3id)`,
    ),
  ],
);

export const playerInFantasy = fantasy.table(
  "player",
  {
    playerid: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    osLink: text("os_link").notNull(),
    overallpoints: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    gamesplayed: integer().default(0).notNull(),
    divisions: smallint().array().default([]).notNull(),
  },
  (table) => [
    unique("uq_player_os_link").on(table.osLink),
    check(
      "chk_player_os_link",
      sql`os_link ~ '^https://overstat\.gg/player/[0-9]+$'::text`,
    ),
  ],
);

export type PlayerSelect = typeof playerInFantasy.$inferSelect;
export type TeamSelect = typeof teamInFantasy.$inferSelect;
export type PickSelect = typeof pickInFantasy.$inferSelect;
export type LeaderboardSelect = typeof leaderboardInFantasy.$inferSelect;
export type ScheduleSelect = typeof scheduleInFantasy.$inferSelect;