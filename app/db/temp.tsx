import { Player, Team } from "@/app/db/definitions"
export const players: Player[] = [
  // Team 1
  {
    PlayerID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    Name: "TsF Stinkerson",
    OS_Link: "https://overstat.gg/player/2189329.TsF%20Stinkerson/overview",
    Division: 1,
  },
  {
    PlayerID: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    Name: "TsF Rampage",
    OS_Link: "https://overstat.gg/player/2189330.TsF%20Rampage/overview",
    Division: 1,
  },
  {
    PlayerID: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    Name: "TsF Vortex",
    OS_Link: "https://overstat.gg/player/2189331.TsF%20Vortex/overview",
    Division: 1,
  },
  // Team 2
  {
    PlayerID: "d4e5f6a7-b8c9-0123-defa-234567890123",
    Name: "NRG Phantom",
    OS_Link: "https://overstat.gg/player/2189332.NRG%20Phantom/overview",
    Division: 2,
  },
  {
    PlayerID: "e5f6a7b8-c9d0-1234-efab-345678901234",
    Name: "NRG Specter",
    OS_Link: "https://overstat.gg/player/2189333.NRG%20Specter/overview",
    Division: 2,
  },
  {
    PlayerID: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    Name: "NRG Blaze",
    OS_Link: "https://overstat.gg/player/2189334.NRG%20Blaze/overview",
    Division: 2,
  },
  // Team 3
  {
    PlayerID: "a7b8c9d0-e1f2-3456-abcd-567890123456",
    Name: "FaZe Cipher",
    OS_Link: "https://overstat.gg/player/2189335.FaZe%20Cipher/overview",
    Division: 3,
  },
  {
    PlayerID: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    Name: "FaZe Nova",
    OS_Link: "https://overstat.gg/player/2189336.FaZe%20Nova/overview",
    Division: 3,
  },
  {
    PlayerID: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    Name: "FaZe Wraith",
    OS_Link: "https://overstat.gg/player/2189337.FaZe%20Wraith/overview",
    Division: 3,
  },
];

export const teams: Team[] = [
  {
    TeamID: "d0e1f2a3-b4c5-6789-defa-890123456789",
    Name: "Ruh Roh",
    Division: 1,
    Player1ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    Player2ID: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    Player3ID: "c3d4e5f6-a7b8-9012-cdef-123456789012",
  },
  {
    TeamID: "e1f2a3b4-c5d6-7890-efab-901234567890",
    Name: "NRG",
    Division: 2,
    Player1ID: "d4e5f6a7-b8c9-0123-defa-234567890123",
    Player2ID: "e5f6a7b8-c9d0-1234-efab-345678901234",
    Player3ID: "f6a7b8c9-d0e1-2345-fabc-456789012345",
  },
  {
    TeamID: "f2a3b4c5-d6e7-8901-fabc-012345678901",
    Name: "FaZe Clan",
    Division: 3,
    Player1ID: "a7b8c9d0-e1f2-3456-abcd-567890123456",
    Player2ID: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    Player3ID: "c9d0e1f2-a3b4-5678-cdef-789012345678",
  },
];
