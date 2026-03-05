"use client";

import { PlayerList } from "@/app/components/draft/player-list";
import { TeamList } from "@/app/components/draft/team-list";

import { Team, Player, Pick } from "@/app/db/definitions";
import { useState } from "react";

interface DraftComponentProps {
  players: Player[];
  teams: Team[];
  division: number;
  week: number;
  initialPick?: Pick | null;
  onSubmit: (
    team: string,
    players: string[],
    division: number,
    week: number,
  ) => void;
  onDelete: (name: string, division: number, week: number) => void;
}

export function DraftComponent({
  players,
  teams,
  division,
  week,
  initialPick,
  onSubmit,
  onDelete,
}: DraftComponentProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    initialPick?.TeamID ?? null,
  );
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    initialPick
      ? [initialPick.Player1ID, initialPick.Player2ID, initialPick.Player3ID]
      : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(
    initialPick ? false : true,
  );
  const maxPlayers = 3;

  function handlePlayerClick(player: Player) {
    const isSelected = selectedPlayers.some((p) => p === player.PlayerID);
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter((p) => p !== player.PlayerID));
      return;
    }
    if (selectedPlayers.length >= maxPlayers) return;
    setSelectedPlayers([...selectedPlayers, player.PlayerID!]);
  }

  function handleTeamClick(team: Team) {
    setSelectedTeam((prev) => (prev === team.TeamID ? null : team.TeamID!));
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

  if (!isEditing) {
    return (
      <div className="flex flex-col items-center gap-6 p-4">
        <p className="text-base text-center">
          Your picks for Div {division}, Week {week} are saved. Hope you picked someone getting subbed out. 
        </p>
        <div className="flex gap-6">
          <button
            onClick={() => setIsEditing(true)}
            className="border border-black dark:border-white px-6 py-2 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Edit Pick
          </button>
          <button
            onClick={() =>
              onDelete(initialPick?.SubmittedBy ?? "", division, week)
            }
            className="border border-red-500 px-6 py-2 font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            Delete Pick
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1 p-4 flex flex-col gap-6">
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
      </main>

      <div className="flex justify-start p-4 gap-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="border border-black dark:border-white px-6 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          {initialPick ? "Update" : "Submit"}
        </button>

        {initialPick && (
          <button
            onClick={() => setIsEditing(false)}
            className="border border-black dark:border-white px-6 py-2 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
