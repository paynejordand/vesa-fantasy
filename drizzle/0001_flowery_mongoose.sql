CREATE SCHEMA "fantasy";
--> statement-breakpoint
CREATE TABLE "fantasy"."admin" (
	"adminid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy"."leaderboard" (
	"leaderboardid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scheduleid" uuid NOT NULL,
	"matchlink" text NOT NULL,
	CONSTRAINT "uq_leaderboard_scheduleid" UNIQUE("scheduleid"),
	CONSTRAINT "chk_leaderboard_match_link" CHECK (matchlink ~* '^https://overstat.gg/tournament/vesa(?:w|%20)?league/[0-9]+'::text)
);
--> statement-breakpoint
CREATE TABLE "fantasy"."pick" (
	"pickid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submittedon" timestamp with time zone DEFAULT now() NOT NULL,
	"submitterid" text NOT NULL,
	"submittername" text NOT NULL,
	"leaderboardid" uuid NOT NULL,
	"teamid" uuid NOT NULL,
	"player1id" uuid NOT NULL,
	"player2id" uuid NOT NULL,
	"player3id" uuid NOT NULL,
	"score" numeric(10, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "uq_pick_submitter_leaderboard" UNIQUE("submitterid","leaderboardid"),
	CONSTRAINT "chk_players_distinct" CHECK ((player1id <> player2id) AND (player1id <> player3id) AND (player2id <> player3id))
);
--> statement-breakpoint
CREATE TABLE "fantasy"."player" (
	"playerid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"os_link" text NOT NULL,
	CONSTRAINT "uq_player_os_link" UNIQUE("os_link"),
	CONSTRAINT "chk_player_os_link" CHECK (os_link ~ '^https://overstat.gg/player/[0-9]+$'::text)
);
--> statement-breakpoint
CREATE TABLE "fantasy"."playermatchresult" (
	"playerresultid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playerid" uuid NOT NULL,
	"leaderboardid" uuid NOT NULL,
	"points" numeric(10, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "uq_playermatchresult_player_leaderboard" UNIQUE("playerid","leaderboardid")
);
--> statement-breakpoint
CREATE TABLE "fantasy"."playerpick" (
	"playerpickid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pickid" uuid NOT NULL,
	"playerid" uuid NOT NULL,
	"points" numeric(10, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "uq_playerpick_pick_player" UNIQUE("pickid","playerid")
);
--> statement-breakpoint
CREATE TABLE "fantasy"."playerseason" (
	"playerseasonid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playerid" uuid NOT NULL,
	"season" smallint NOT NULL,
	"divisions" smallint[] DEFAULT '{}' NOT NULL,
	"overallpoints" numeric(10, 2) DEFAULT '0' NOT NULL,
	"gamesplayed" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "uq_playerseason_player_season" UNIQUE("playerid","season")
);
--> statement-breakpoint
CREATE TABLE "fantasy"."schedule" (
	"scheduleid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season" smallint NOT NULL,
	"week" smallint NOT NULL,
	"division" smallint NOT NULL,
	"gamedate" timestamp with time zone NOT NULL,
	CONSTRAINT "uq_schedule_season_week_division" UNIQUE("season","week","division"),
	CONSTRAINT "schedule_week_check" CHECK ((week >= 1) AND (week <= 7)),
	CONSTRAINT "schedule_division_check" CHECK ((division >= 1) AND (division <= 7))
);
--> statement-breakpoint
CREATE TABLE "fantasy"."team" (
	"teamid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"division" smallint NOT NULL,
	"season" smallint NOT NULL,
	"weeksplayed" integer DEFAULT 0 NOT NULL,
	"overallpoints" numeric(10, 2) DEFAULT '0' NOT NULL,
	"player1id" uuid,
	"player2id" uuid,
	"player3id" uuid,
	CONSTRAINT "chk_players_distinct" CHECK (((player1id IS NULL) OR (player2id IS NULL) OR (player1id <> player2id)) AND ((player1id IS NULL) OR (player3id IS NULL) OR (player1id <> player3id)) AND ((player2id IS NULL) OR (player3id IS NULL) OR (player2id <> player3id))),
	CONSTRAINT "team_division_check" CHECK ((division >= 1) AND (division <= 7))
);
--> statement-breakpoint
CREATE TABLE "fantasy"."teampick" (
	"teampickid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pickid" uuid NOT NULL,
	"teamid" uuid NOT NULL,
	"points" numeric(10, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "uq_teampick_pick_team" UNIQUE("pickid","teamid")
);
--> statement-breakpoint
DROP TABLE "teams" CASCADE;--> statement-breakpoint
DROP TABLE "stinkerbot_channels" CASCADE;--> statement-breakpoint
ALTER TABLE "fantasy"."leaderboard" ADD CONSTRAINT "leaderboard_scheduleid_fkey" FOREIGN KEY ("scheduleid") REFERENCES "fantasy"."schedule"("scheduleid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."pick" ADD CONSTRAINT "pick_leaderboardid_fkey" FOREIGN KEY ("leaderboardid") REFERENCES "fantasy"."leaderboard"("leaderboardid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."pick" ADD CONSTRAINT "pick_player1id_fkey" FOREIGN KEY ("player1id") REFERENCES "fantasy"."player"("playerid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."pick" ADD CONSTRAINT "pick_player2id_fkey" FOREIGN KEY ("player2id") REFERENCES "fantasy"."player"("playerid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."pick" ADD CONSTRAINT "pick_player3id_fkey" FOREIGN KEY ("player3id") REFERENCES "fantasy"."player"("playerid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."pick" ADD CONSTRAINT "pick_teamid_fkey" FOREIGN KEY ("teamid") REFERENCES "fantasy"."team"("teamid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."playermatchresult" ADD CONSTRAINT "playermatchresult_playerid_fkey" FOREIGN KEY ("playerid") REFERENCES "fantasy"."player"("playerid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."playermatchresult" ADD CONSTRAINT "playermatchresult_leaderboardid_fkey" FOREIGN KEY ("leaderboardid") REFERENCES "fantasy"."leaderboard"("leaderboardid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."playerpick" ADD CONSTRAINT "playerpick_pickid_fkey" FOREIGN KEY ("pickid") REFERENCES "fantasy"."pick"("pickid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."playerpick" ADD CONSTRAINT "playerpick_playerid_fkey" FOREIGN KEY ("playerid") REFERENCES "fantasy"."player"("playerid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."playerseason" ADD CONSTRAINT "playerseason_playerid_fkey" FOREIGN KEY ("playerid") REFERENCES "fantasy"."player"("playerid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."team" ADD CONSTRAINT "team_player1id_fkey" FOREIGN KEY ("player1id") REFERENCES "fantasy"."player"("playerid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."team" ADD CONSTRAINT "team_player2id_fkey" FOREIGN KEY ("player2id") REFERENCES "fantasy"."player"("playerid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."team" ADD CONSTRAINT "team_player3id_fkey" FOREIGN KEY ("player3id") REFERENCES "fantasy"."player"("playerid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."teampick" ADD CONSTRAINT "teampick_pickid_fkey" FOREIGN KEY ("pickid") REFERENCES "fantasy"."pick"("pickid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy"."teampick" ADD CONSTRAINT "teampick_teamid_fkey" FOREIGN KEY ("teamid") REFERENCES "fantasy"."team"("teamid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pick_leaderboard" ON "fantasy"."pick" USING btree ("leaderboardid");