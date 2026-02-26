import { LeaderboardWithPickNames } from "@/app/db/definitions";
import Link from "next/link";

interface LeaderboardComponentInterface {
  leaderboard: LeaderboardWithPickNames;
}

export function LeaderboardComponent({
  leaderboard,
}: LeaderboardComponentInterface) {
  const { Division, Week, MatchLink, Picks } = leaderboard;

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-center text-lg font-medium mb-4">
        <Link
          href={MatchLink}
          target="_blank"
          rel="noreferrer"
          className="hover:underline text-blue-500"
        >
          Div {Division}, Week {Week} Scores
        </Link>
      </h2>

      <div className="scrollable-table-container overflow-y-auto max-h-108">
        <table className="scrollable-table">
          <thead className="sticky top-0 dark:bg-black">
            <tr>
              <th>#</th>
              <th>Submitter</th>
              <th>Score</th>
              <th>Team</th>
              <th>Player 1</th>
              <th>Player 2</th>
              <th>Player 3</th>
            </tr>
          </thead>
          <tbody>
            {Picks.map((pick, index) => (
              <tr key={`${pick.SubmittedBy}-${index}`}>
                <td>{index + 1}</td>
                <td>{pick.SubmittedBy}</td>
                <td>{pick.Score}</td>
                <td>{pick.TeamName}</td>
                <td>{pick.Player1Name}</td>
                <td>{pick.Player2Name}</td>
                <td>{pick.Player3Name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
