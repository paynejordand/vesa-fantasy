import { PlayerResults } from "@/app/db/definitions";

interface PlayerResultsComponentInterface {
  playerResults: PlayerResults[];
}

export function PlayerResultsComponent({
  playerResults,
}: PlayerResultsComponentInterface) {
  if (!playerResults) return <></>
  playerResults.sort((a, b) => Number(b.points) - Number(a.points));
  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-center text-lg font-medium mb-4">All Players </h2>
      <div className="scrollable-table-container overflow-y-auto max-h-108">
        <table className="scrollable-table">
          <thead className="sticky top-0 dark:bg-black bg-white">
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {playerResults.map((player, index) => {
              return (
                <tr key={`${player.Name}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{player.Name}</td>
                  <td>{player.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
