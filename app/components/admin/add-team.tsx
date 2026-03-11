"use client";
import { useState } from "react";
import { ActionResult } from "@/app/db/actions";

interface DivisionCount {
  division: number;
  count: number;
}

interface AddTeamComponentProps {
  divisionCounts: DivisionCount[];
  onAdd: (
    teamName: string,
    division: number,
    players: { name: string; osLink: string }[],
  ) => Promise<ActionResult>;
}

export function AddTeamForm({ divisionCounts, onAdd }: AddTeamComponentProps) {
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState([
    { name: "", osLink: "" },
    { name: "", osLink: "" },
    { name: "", osLink: "" },
  ]);
  const [error, setError] = useState<string | null>(null);

  const availableDivisions = divisionCounts.filter((d) => d.count < 20);

  function updatePlayer(
    index: number,
    field: "name" | "osLink",
    value: string,
  ) {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  }

  function isPlayerValid(player: { name: string; osLink: string }) {
    return player.name.trim() !== "" && player.osLink.trim() !== "";
  }

  function isPlayerPartial(player: { name: string; osLink: string }) {
    return (player.name.trim() !== "") !== (player.osLink.trim() !== "");
  }

  const hasPartial = players.some(isPlayerPartial);
  const validCount = players.filter(isPlayerValid).length;
  const canSubmit =
    teamName.trim() !== "" &&
    selectedDivision !== null &&
    validCount >= 1 &&
    !hasPartial;

  async function handleSubmit() {
    if (!canSubmit || !selectedDivision) return;
    setError(null);
    const result = await onAdd(teamName, selectedDivision, players);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setTeamName("");
    setSelectedDivision(null);
    setPlayers([
      { name: "", osLink: "" },
      { name: "", osLink: "" },
      { name: "", osLink: "" },
    ]);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <select
        value={selectedDivision ?? ""}
        onChange={(e) => setSelectedDivision(Number(e.target.value))}
      >
        <option value="" disabled>
          Select Division
        </option>
        {availableDivisions.map(({ division }) => (
          <option key={division} value={division}>
            Division {division}
          </option>
        ))}
      </select>

      {selectedDivision && (
        <>
          <input
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          <span className="font-medium">Players</span>
          {players.map((player, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-sm text-gray-500">P{index + 1}</span>
              <input
                placeholder="Player Name"
                value={player.name}
                onChange={(e) => updatePlayer(index, "name", e.target.value)}
              />
              <input
                placeholder="OS Link"
                value={player.osLink}
                onChange={(e) => updatePlayer(index, "osLink", e.target.value)}
              />
            </div>
          ))}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button onClick={handleSubmit} disabled={!canSubmit}>
            Add Team
          </button>
        </>
      )}
    </div>
  );
}
