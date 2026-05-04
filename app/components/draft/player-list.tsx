import { useMemo } from "react";
import { PlayerSelect, TeamSelect } from "@/app/db/schema";
import { Player } from "@/app/db/definitions";
import Link from "next/link";

interface PlayerListProps {
  allPlayers: Player[];
  allTeams: TeamSelect[];
  maxPlayers: number;
  selectedPlayers: string[];
  selectPlayerAction: (player: PlayerSelect) => void;
}

export function PlayerList({
  allPlayers,
  allTeams,
  maxPlayers,
  selectedPlayers,
  selectPlayerAction,
}: PlayerListProps) {
  const playerTeamMap = useMemo(() => {
    const map = new Map<string, TeamSelect>();
    for (const team of allTeams) {
      if (team.player1id) map.set(team.player1id, team);
      if (team.player2id) map.set(team.player2id, team);
      if (team.player3id) map.set(team.player3id, team);
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
          const isSelected = selectedPlayers.some((p) => p === player.playerid);
          const teamName = playerTeamMap.get(player.playerid ?? "")?.name;

          return (
            <div
              key={player.playerid}
              className={`w-full border p-4 rounded-lg ${isSelected ? "bg-green-600" : "bg-black"}`}
            >
              <div className="flex flex-col items-center justify-between h-9/10 gap-2">
                <Link
                  className="text-lg font-semibold text-blue-500 text-center overflow-wrap-anywhere"
                  href={player.osLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  {player.name}
                </Link>
                <p className="text-sm font-medium text-white">
                  Team: {teamName ?? "Unaffiliated"}
                </p>
                <p className="text-sm font-medium text-white">
                  Average Points:{" "}
                  {(
                    (Number(player.overallpoints) ?? 0) / (player.gamesplayed || 1)
                  ).toFixed(2)}
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
