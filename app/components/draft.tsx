"use client";

import { PlayerList } from "@/app/components/player-list";
import { TeamList } from "@/app/components/team-list";

import { Team, Player } from "@/app/db/definitions";
import { useState } from "react";

import { submitDraft } from "@/app/db/actions";

export function DraftComponent({
  players,
  teams,
}: {
  players: Array<Player>;
  teams: Array<Team>;
}) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const maxPlayers = 3;

  function handlePlayerClick(player: Player) {
    console.log("Player clicked:", player);
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p !== player));
      return;
    }
    if (selectedPlayers.length >= maxPlayers) {
      return;
    }
    setSelectedPlayers([...selectedPlayers, player]);
  }

  function handleTeamClick(team: Team) {
    console.log("Team clicked:", team);
    setSelectedTeam(selectedTeam === team ? null : team);
  }

  return (
    <div className="flex  bg-zinc-50 font-sans dark:bg-black">
      <main className="flex bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-6 text-center sm:items-start sm:text-left p-4">
          <h1
            className="flex text-3xl font-semibold tracking-tight text-black dark:text-zinc-50"
            style={{ width: "75%" }}
          >
            Vesa Fantasy Draft
          </h1>
          <PlayerList
            allPlayers={players}
            allTeams={teams}
            maxPlayers={maxPlayers}
            selectedPlayers={selectedPlayers}
            selectPlayerAction={(p) => handlePlayerClick(p)}
          />
          <TeamList
            allTeams={teams}
            selectedTeam={selectedTeam}
            selectTeamAction={(t) => handleTeamClick(t)}
          />
        </div>
      </main>
      <button
        onClick={async () => {
          if (!selectedTeam) {
            alert("Please select a team before submitting.");
            return;
          }
          if (selectedPlayers.length !== maxPlayers) {
            alert("Please select exactly three players before submitting.");
            return;
          }
          submitDraft(selectedTeam, selectedPlayers);
        }}
      >
        Submit
      </button>
    </div>
  );
}
