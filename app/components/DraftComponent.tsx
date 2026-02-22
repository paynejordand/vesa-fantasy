"use client";

import { PlayerList } from "@/app/components/player-list";
import { TeamList } from "@/app/components/team-list";

import { Team, Player } from "@/app/db/definitions";
import { useState } from "react";

interface DraftComponentProps {
  players: Player[];
  teams: Team[];
  division: number;
  week: number;
  onSubmit: (
    team: Team,
    players: Player[],
    division: number,
    week: number,
  ) => void;
}

export function DraftComponent({
  players,
  teams,
  division,
  week,
  onSubmit,
}: DraftComponentProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const maxPlayers = 3;

  function handlePlayerClick(player: Player) {
    const isSelected = selectedPlayers.some(
      (p) => p.PlayerID === player.PlayerID,
    );
    if (isSelected) {
      setSelectedPlayers(
        selectedPlayers.filter((p) => p.PlayerID !== player.PlayerID),
      );
      return;
    }
    if (selectedPlayers.length >= maxPlayers) return;
    setSelectedPlayers([...selectedPlayers, player]);
  }

  function handleTeamClick(team: Team) {
    setSelectedTeam((prev) => (prev?.TeamID === team.TeamID ? null : team));
  }

  function handleSubmit() {
    if (!selectedTeam) {
      setError("Please select a team before submitting.");
      return;
    }
    if (selectedPlayers.length !== maxPlayers) {
      setError("Please select exactly three players before submitting.");
      return;
    }
    setError(null);
    onSubmit(selectedTeam, selectedPlayers, division, week);
  }

  const canSubmit =
    selectedTeam !== null && selectedPlayers.length === maxPlayers;

  return (
    <div className="flex flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex-1 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-6 text-center sm:items-start sm:text-left p-4">
          <h1 className="w-3/4 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Vesa Fantasy Draft
          </h1>
          <PlayerList
            allPlayers={players}
            allTeams={teams}
            maxPlayers={maxPlayers}
            selectedPlayers={selectedPlayers}
            selectPlayerAction={handlePlayerClick}
          />
          <TeamList
            allTeams={teams}
            selectedTeam={selectedTeam}
            selectTeamAction={handleTeamClick}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </main>

      <div className="flex justify-start p-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="... disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
