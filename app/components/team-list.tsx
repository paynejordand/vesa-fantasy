"use client";
import { Team, teams } from "../db/dummy";
import { useState } from "react";

export function TeamList() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  function handleTeamClick(team: Team) {
    console.log("Team clicked:", team);
    setSelectedTeam(selectedTeam === team ? null : team);
  }

  return (
    <h1 className="text-2xl font-bold mb-4">
      Select a Team
      <div className="container flex flex-wrap gap-4">
        {teams.map((team) => (
          <div
            className="border p-4 rounded-lg"
            key={team.id}
            style={{
              backgroundColor: selectedTeam === team ? "green" : "black",
            }}
          >
            <div className="container flex flex-col items-center">
              <a className="flex">{team.name}</a>
              <button
                className="flex text-white rounded"
                onClick={() => handleTeamClick(team)}
              >
                {selectedTeam === team ? "Deselect" : "Select"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </h1>
  );
}
