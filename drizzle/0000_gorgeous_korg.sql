-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_username" text NOT NULL,
	"team_name" text NOT NULL,
	"players" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stinkerbot_channels" (
	"userid" text PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL
);

*/