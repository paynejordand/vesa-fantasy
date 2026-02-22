export interface Player {
  PlayerID?: string;
  Name: string;
  OS_Link: string;
  OverallPoints?: number;
  Division?: number | null;
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
  }[];
}

export interface PlayerStat {
  damageDealt: number;
  assists: number;
  knockdowns: number;
  kills: number;
  respawnsGiven: number;
  playerId: string;
};

export interface SessionUser {
  name: string,
  image: string, 
  role: string,
}