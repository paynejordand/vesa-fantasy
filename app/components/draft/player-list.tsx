import { useMemo } from "react";
import { Player, Team } from "@/app/db/definitions";

interface PlayerListProps {
  allPlayers: Player[];
  allTeams: Team[];
  maxPlayers: number;
  selectedPlayers: string[];
  selectPlayerAction: (player: Player) => void;
}

export function PlayerList({
  allPlayers,
  allTeams,
  maxPlayers,
  selectedPlayers,
  selectPlayerAction,
}: PlayerListProps) {
  const playerTeamMap = useMemo(() => {
    const map = new Map<string, Team>();
    for (const team of allTeams) {
      if (team.Player1ID) map.set(team.Player1ID, team);
      if (team.Player2ID) map.set(team.Player2ID, team);
      if (team.Player3ID) map.set(team.Player3ID, team);
    }
    return map;
  }, [allTeams]);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        Select Players: {maxPlayers - selectedPlayers.length} Remaining
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {allPlayers.map((player) => {
          const isSelected = selectedPlayers.some((p) => p === player.PlayerID);
          const teamName = playerTeamMap.get(player.PlayerID ?? "")?.Name;

          return (
            <div
              key={player.PlayerID}
              className={`w-full border p-4 rounded-lg ${isSelected ? "bg-green-600" : "bg-black"}`}
            >
              <div className="flex flex-col items-center justify-between h-9/10 gap-2">
                <a
                  className="text-lg font-semibold text-blue-500"
                  href={player.OS_Link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {player.Name}
                </a>
                <p className="text-sm font-medium">
                  Team: {teamName ?? "Unaffiliated"}
                </p>
                <p className="text-sm font-medium">
                  Average Points:{" "}
                  {((player.OverallPoints ?? 0) / (player.GamesPlayed || 1)).toFixed(2)}
                </p>
                <button
                  className="text-white rounded"
                  onClick={() => selectPlayerAction(player)}
                >
                  {isSelected ? "Remove" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
