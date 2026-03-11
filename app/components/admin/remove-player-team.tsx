"use client";

import { useState } from "react";
import { ActionResult } from "@/app/db/actions";
import { Player, TeamWithPlayers } from "@/app/db/definitions";

interface RemovePlayersComponentProps {
  teams: TeamWithPlayers[];
  divisions: number[];
  onRemove: (teamID: string, playerIDs: string[]) => Promise<ActionResult>;
}

export function RemovePlayerFromTeamForm({
  teams,
  divisions,
  onRemove,
}: RemovePlayersComponentProps) {
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(null);
  const [checkedPlayers, setCheckedPlayers] = useState<string[]>([]);

  const filteredTeams = teams.filter((t) => t.Division === selectedDivision);
  const selectedTeam = teams.find((t) => t.TeamID === selectedTeamID);

  const players: Player[] = selectedTeam
    ? [
        {
          PlayerID: selectedTeam.Player1ID ?? "",
          Name: selectedTeam.Player1Name ?? "",
          OS_Link: selectedTeam.Player1OSLink ?? "",
        },
        {
          PlayerID: selectedTeam.Player2ID ?? "",
          Name: selectedTeam.Player2Name ?? "",
          OS_Link: selectedTeam.Player2OSLink ?? "",
        },
        {
          PlayerID: selectedTeam.Player3ID ?? "",
          Name: selectedTeam.Player3Name ?? "",
          OS_Link: selectedTeam.Player3OSLink ?? "",
        },
      ].filter((p) => p.PlayerID !== "")
    : [];

  function handleDivisionChange(division: number) {
    setSelectedDivision(division);
    setSelectedTeamID(null);
    setCheckedPlayers([]);
  }

  function handleTeamChange(teamID: string) {
    setSelectedTeamID(teamID);
    setCheckedPlayers([]);
  }

  function togglePlayer(playerID: string) {
    setCheckedPlayers((prev) =>
      prev.includes(playerID)
        ? prev.filter((id) => id !== playerID)
        : [...prev, playerID],
    );
  }

  async function handleSubmit() {
    if (!selectedTeamID || checkedPlayers.length === 0) return;
    const result = await onRemove(selectedTeamID, checkedPlayers);
    if (!result.success) {
      console.error(result.message);
      return;
    }
    setCheckedPlayers([]);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex gap-4">
        <select
          value={selectedDivision ?? ""}
          onChange={(e) => handleDivisionChange(Number(e.target.value))}
        >
          <option value="" disabled>
            Select Division
          </option>
          {divisions.map((div) => (
            <option key={div} value={div}>
              Division {div}
            </option>
          ))}
        </select>

        <select
          value={selectedTeamID ?? ""}
          onChange={(e) => handleTeamChange(e.target.value)}
          disabled={!selectedDivision}
        >
          <option value="" disabled>
            Select Team
          </option>
          {filteredTeams.map((team) => (
            <option key={team.TeamID} value={team.TeamID}>
              {team.Name}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <div className="flex flex-col gap-2">
          <span className="font-medium">Remove?</span>
          {players.map((player) => (
            <label key={player.PlayerID} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={checkedPlayers.includes(player.PlayerID!)}
                onChange={() => togglePlayer(player.PlayerID!)}
              />
              {player.Name}
            </label>
          ))}
          <button
            onClick={handleSubmit}
            disabled={checkedPlayers.length === 0}
            className="mt-2"
          >
            Remove Selected
          </button>
        </div>
      )}
    </div>
  );
}
