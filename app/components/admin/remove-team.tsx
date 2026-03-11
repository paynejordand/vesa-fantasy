"use client";
import { useState } from "react";
import { ActionResult } from "@/app/db/actions";

interface Team {
  TeamID: string;
  Name: string;
  Division: number;
}

interface RemoveTeamComponentProps {
  teams: Team[];
  divisions: number[];
  onRemove: (teamIDs: string[]) => Promise<ActionResult>;
}

export function RemoveTeamForm({
  teams,
  divisions,
  onRemove,
}: RemoveTeamComponentProps) {
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [checkedTeams, setCheckedTeams] = useState<string[]>([]);

  const filteredTeams = teams.filter((t) => t.Division === selectedDivision);

  function handleDivisionChange(division: number) {
    setSelectedDivision(division);
    setCheckedTeams([]);
  }

  function toggleTeam(teamID: string) {
    setCheckedTeams((prev) =>
      prev.includes(teamID)
        ? prev.filter((id) => id !== teamID)
        : [...prev, teamID],
    );
  }

  async function handleSubmit() {
    if (checkedTeams.length === 0) return;
    const result = await onRemove(checkedTeams);
    if (!result.success) {
      console.error(result.message);
      return;
    }
    setCheckedTeams([]);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
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

      {selectedDivision && (
        <div className="flex flex-col gap-2">
          <span className="font-medium">Remove?</span>
          {filteredTeams.map((team) => (
            <label key={team.TeamID} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={checkedTeams.includes(team.TeamID)}
                onChange={() => toggleTeam(team.TeamID)}
              />
              {team.Name}
            </label>
          ))}
          <button
            onClick={handleSubmit}
            disabled={checkedTeams.length === 0}
            className="mt-2"
          >
            Remove Selected
          </button>
        </div>
      )}
    </div>
  );
}
