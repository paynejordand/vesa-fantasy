import { relations } from "drizzle-orm/relations";
import { playerInFantasy, teamInFantasy, pickInFantasy, leaderboardInFantasy } from "./schema";

export const teamInFantasyRelations = relations(teamInFantasy, ({one, many}) => ({
	playerInFantasy_player1Id: one(playerInFantasy, {
		fields: [teamInFantasy.player1Id],
		references: [playerInFantasy.playerid],
		relationName: "teamInFantasy_player1Id_playerInFantasy_playerid"
	}),
	playerInFantasy_player2Id: one(playerInFantasy, {
		fields: [teamInFantasy.player2Id],
		references: [playerInFantasy.playerid],
		relationName: "teamInFantasy_player2Id_playerInFantasy_playerid"
	}),
	playerInFantasy_player3Id: one(playerInFantasy, {
		fields: [teamInFantasy.player3Id],
		references: [playerInFantasy.playerid],
		relationName: "teamInFantasy_player3Id_playerInFantasy_playerid"
	}),
	pickInFantasies: many(pickInFantasy),
}));

export const playerInFantasyRelations = relations(playerInFantasy, ({many}) => ({
	teamInFantasies_player1Id: many(teamInFantasy, {
		relationName: "teamInFantasy_player1Id_playerInFantasy_playerid"
	}),
	teamInFantasies_player2Id: many(teamInFantasy, {
		relationName: "teamInFantasy_player2Id_playerInFantasy_playerid"
	}),
	teamInFantasies_player3Id: many(teamInFantasy, {
		relationName: "teamInFantasy_player3Id_playerInFantasy_playerid"
	}),
	pickInFantasies_player1Id: many(pickInFantasy, {
		relationName: "pickInFantasy_player1Id_playerInFantasy_playerid"
	}),
	pickInFantasies_player2Id: many(pickInFantasy, {
		relationName: "pickInFantasy_player2Id_playerInFantasy_playerid"
	}),
	pickInFantasies_player3Id: many(pickInFantasy, {
		relationName: "pickInFantasy_player3Id_playerInFantasy_playerid"
	}),
}));

export const pickInFantasyRelations = relations(pickInFantasy, ({one}) => ({
	playerInFantasy_player1Id: one(playerInFantasy, {
		fields: [pickInFantasy.player1Id],
		references: [playerInFantasy.playerid],
		relationName: "pickInFantasy_player1Id_playerInFantasy_playerid"
	}),
	playerInFantasy_player2Id: one(playerInFantasy, {
		fields: [pickInFantasy.player2Id],
		references: [playerInFantasy.playerid],
		relationName: "pickInFantasy_player2Id_playerInFantasy_playerid"
	}),
	playerInFantasy_player3Id: one(playerInFantasy, {
		fields: [pickInFantasy.player3Id],
		references: [playerInFantasy.playerid],
		relationName: "pickInFantasy_player3Id_playerInFantasy_playerid"
	}),
	teamInFantasy: one(teamInFantasy, {
		fields: [pickInFantasy.teamid],
		references: [teamInFantasy.teamid]
	}),
	leaderboardInFantasy: one(leaderboardInFantasy, {
		fields: [pickInFantasy.leaderboardid],
		references: [leaderboardInFantasy.leaderboardid]
	}),
}));

export const leaderboardInFantasyRelations = relations(leaderboardInFantasy, ({many}) => ({
	pickInFantasies: many(pickInFantasy),
}));