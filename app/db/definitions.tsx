export interface Player {
  PlayerID?: string;
  Name: string;
  OS_Link: string;
  OverallPoints?: number;
  Divisions?: number[];
  GamesPlayed?: number;
}

export interface Team {
  TeamID?: string;
  Name: string;
  Division: number;
  WeeksPlayed?: number;
  OverallPoints?: number;
  Player1ID?: string | null;
  Player2ID?: string | null;
  Player3ID?: string | null;
}

export interface TeamWithPlayers {
  TeamID: string;
  Name: string;
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

export interface Pick {
  PickID?: string;
  Division: number;
  Week: number;
  SubmittedOn?: Date;
  SubmittedBy: string;
  Score?: number;
  TeamID: string;
  Player1ID: string;
  Player2ID: string;
  Player3ID: string;
  LeaderboardID?: string | null;
  P1Score?: number;
  P2Score?: number;
  P3Score?: number;
  TScore?: number;
}

export interface Leaderboard {
  LeaderboardID?: string;
  Division: number;
  Week: number;
  MatchLink: string;
}

export interface LeaderboardWithPicks extends Leaderboard {
  Picks: Pick[];
}

export interface LeaderboardWithPickNames extends Leaderboard {
  Picks: {
    PickID: string;
    SubmittedOn: Date;
    SubmittedBy: string;
    Score: number;
    LeaderboardID: string | null;
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

export interface Schedule {
  ScheduleID: string;
  Season: number;
  Week: number;
  Division: number;
  GameDate: Date;
}
