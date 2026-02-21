import { Player, Team } from "@/app/db/definitions";

function findTeamByPlayer(playerID: string | undefined, allTeams: Team[]): Team | undefined {
  return allTeams.find(
    (t) =>
      t.Player1ID === playerID ||
      t.Player2ID === playerID ||
      t.Player3ID === playerID,
  );
}

export function PlayerList({
  allPlayers,
  allTeams,
  maxPlayers,
  selectedPlayers,
  selectPlayerAction,
}: {
  allPlayers: Player[];
  allTeams: Team[];
  maxPlayers: number;
  selectedPlayers: Player[];
  selectPlayerAction: (player: Player) => void;
}) {
  return (
    <h1 className="text-2xl font-bold mb-4">
      Select Players: {maxPlayers - selectedPlayers.length} Remaining
      <div className="container flex flex-wrap gap-4">
        {allPlayers.map((player) => (
          <div
            className="border p-4 rounded-lg"
            key={player.PlayerID}
            style={{
              backgroundColor: selectedPlayers.includes(player)
                ? "green"
                : "black",
            }}
          >
            <div className="container flex flex-col items-center">
              <a
                className="flex text-lg font-semibold text-blue-500"
                href={player.OS_Link}
                target="_blank"
              >
                {player.Name}
              </a>
              <a className="flex text-sm font-medium">Team: {findTeamByPlayer(player.PlayerID, allTeams)?.Name}</a>
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
