interface OverallLeaderboardEntry {
  name: string;
  totalpoints: number;
}

interface OverallLeaderboardComponentInterface {
  entries: OverallLeaderboardEntry[] | null;
}

export function OverallLeaderboard({
  entries,
}: OverallLeaderboardComponentInterface) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center text-red-600">
        <p>No entries found for this week.</p>
      </div>
    );
  }
  return (
    <div className="scrollable-table-container overflow-y-auto max-h-108">
      <table className="scrollable-table">
        <thead className="sticky top-0 dark:bg-black bg-white">
          <tr>
            <th>Name</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index}>
              <td className="p-2">{entry.name}</td>
              <td className="p-2">{entry.totalpoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
