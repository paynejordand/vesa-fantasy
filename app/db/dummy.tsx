export interface Player {
  id: number;
  name: string;
  overstat: string;
  team: string;
}

export interface Team {
  id: number;
  name: string;
  players: string[];
}

export const players = [
  {
    id: 1,
    name: "Stinkerson",
    overstat: "https://overstat.gg/player/2189329/overview",
    team: "Ruh Roh",
  },
  {
    id: 2,
    name: "Hova",
    overstat: "https://overstat.gg/player/753391/overview",
    team: "Ruh Roh",
  },
  {
    id: 3,
    name: "Heuman",
    overstat: "https://overstat.gg/player/357606/overview",
    team: "Ruh Roh",
  },
  {
    id: 4,
    name: "Sparky",
    overstat: "https://overstat.gg/player/123456/overview",
    team: "Scooby Doo",
  },
  {
    id: 5,
    name: "Velma",
    overstat: "https://overstat.gg/player/654321/overview",
    team: "Scooby Doo",
  },
{
    id: 6,
    name: "Daphne",
    overstat: "https://overstat.gg/player/789012/overview",
    team: "Scooby Doo",
  },
  {
    id: 7,
    name: "Fred",
    overstat: "https://overstat.gg/player/345678/overview",
    team: "Stupud",
  }
];

export const teams = [
  {
    id: 1,
    name: "Ruh Roh",
    players: ["Stinkerson", "Hova", "Heuman"],
  },
  {
    id: 2,
    name: "Scooby Doo",
    players: ["Sparky"],
  },
];
