"use client";
import { useState } from "react";
import { ActionResult } from "@/app/db/actions";

interface Team {
  TeamID: string;
  Name: string;
  Division: number;
  Player1ID: string | null;
  Player2ID: string | null;
  Player3ID: string | null;
}

interface PlayerInput {
  name: string;
  osLink: string;
}

interface AddPlayersComponentProps {
  teams: Team[];
  divisions: number[];
  onAdd: (
    teamID: string,
    division: number,
    players: PlayerInput[],
  ) => Promise<ActionResult>;
}

export function AddPlayerToTeamForm({
  teams,
  divisions,
  onAdd,
}: AddPlayersComponentProps) {
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInput[]>([
    { name: "", osLink: "" },
  ]);

  const filteredTeams = teams.filter((t) => t.Division === selectedDivision);
  const selectedTeam = teams.find((t) => t.TeamID === selectedTeamID);
  const availableSlots = selectedTeam
    ? [
        selectedTeam.Player1ID,
        selectedTeam.Player2ID,
        selectedTeam.Player3ID,
      ].filter((p) => p === null).length
    : 0;

  function handleDivisionChange(division: number) {
    setSelectedDivision(division);
    setSelectedTeamID(null);
    setPlayers([{ name: "", osLink: "" }]);
  }

  function handleTeamChange(teamID: string) {
    setSelectedTeamID(teamID);
    setPlayers([{ name: "", osLink: "" }]);
  }

  function updatePlayer(
    index: number,
    field: keyof PlayerInput,
    value: string,
  ) {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  }

  function addSlot() {
    if (players.length < availableSlots)
      setPlayers((prev) => [...prev, { name: "", osLink: "" }]);
  }

  function removeSlot(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!selectedTeamID || !selectedDivision) return;
    const valid = players.filter((p) => p.name.trim() && p.osLink.trim());
    if (valid.length === 0) return;
    const result = await onAdd(selectedTeamID, selectedDivision, valid);
    if (!result.success) {
      console.error(result.message);
      return;
    }
    setPlayers([{ name: "", osLink: "" }]);
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
        <>
          {availableSlots === 0 ? (
            <p>This team already has 3 players.</p>
          ) : (
            <>
              {players.map((player, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    placeholder="Player Name"
                    value={player.name}
                    onChange={(e) =>
                      updatePlayer(index, "name", e.target.value)
                    }
                  />
                  <input
                    placeholder="OS Link"
                    value={player.osLink}
                    onChange={(e) =>
                      updatePlayer(index, "osLink", e.target.value)
                    }
                  />
                  {players.length > 1 && (
                    <button onClick={() => removeSlot(index)}>Remove</button>
                  )}
                </div>
              ))}

              {players.length < availableSlots && (
                <button onClick={addSlot}>Add Another Player</button>
              )}

              <button
                onClick={handleSubmit}
                disabled={players.every(
                  (p) => !p.name.trim() || !p.osLink.trim(),
                )}
              >
                Add Player(s)
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
