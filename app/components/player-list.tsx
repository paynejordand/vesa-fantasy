"use client";
import { Player, players } from "../db/dummy";

export function PlayerList({
  maxPlayers,
  selectedPlayers,
  selectPlayerAction,
}: {
  maxPlayers: number;
  selectedPlayers: Player[];
  selectPlayerAction: (player: Player) => void;
}) {
  return (
    <h1 className="text-2xl font-bold mb-4">
      Select Players: {maxPlayers - selectedPlayers.length} Remaining
      <div className="container flex flex-wrap gap-4">
        {players.map((player) => (
          <div
            className="border p-4 rounded-lg"
            key={player.id}
            style={{
              backgroundColor: selectedPlayers.includes(player)
                ? "green"
                : "black",
            }}
          >
            <div className="container flex flex-col items-center">
              <a
                className="flex text-lg font-semibold text-blue-500"
                href={player.overstat}
                target="_blank"
              >
                {player.name}
              </a>
              <a className="flex text-sm font-medium">Team: {player.team}</a>
              <button
                className="flex text-white rounded"
                onClick={() => selectPlayerAction(player)}
              >
                {selectedPlayers.includes(player) ? "Deselect" : "Select"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </h1>
  );
}
