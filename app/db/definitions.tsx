import { LeaderboardSelect, PlayerSelect } from "@/app/db/schema";

export interface Player extends PlayerSelect {
  overallpoints: number;
  divisions: number[];
  gamesplayed: number;
}

export interface TeamWithPlayers {
  TeamID: string;
  Name: string;
  Season: number;
  Division: number;
  Player1ID: string | null;
  Player1Name: string | null;
  Player1OSLink: string | null;
  Player2ID: string | null;
  Player2Name: string | null;
  Player2OSLink: string | null;
  Player3ID: string | null;
  Player3Name: string | null;
  Player3OSLink: string | null;
}

export interface LeaderboardWithPickNames extends LeaderboardSelect {
  Division: number;
  Week: number;
  Picks: {
    PickID: string;
    SubmittedOn: Date;
    SubmittedBy: string;
    Score: number;
    LeaderboardID: string;
    TeamName: string;
    Player1Name: string;
    Player2Name: string;
    Player3Name: string;
    P1Score: number;
    P2Score: number;
    P3Score: number;
    TScore: number;
  }[];
}

export interface PlayerStat {
  damageDealt: number;
  assists: number;
  knockdowns: number;
  kills: number;
  respawnsGiven: number;
  playerId: string;
}

export interface SessionUser {
  name: string;
  image: string;
  role: string;
  id: string;
}