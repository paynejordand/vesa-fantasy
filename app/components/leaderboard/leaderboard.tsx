import { LeaderboardWithPickNames } from "@/app/db/definitions";
import Link from "next/link";

interface LeaderboardComponentInterface {
  leaderboard: LeaderboardWithPickNames;
}

function getSortedPlayers(pick: LeaderboardWithPickNames["Picks"][0]) {
  return [
    { name: pick.Player1Name, score: pick.P1Score },
    { name: pick.Player2Name, score: pick.P2Score },
    { name: pick.Player3Name, score: pick.P3Score },
  ].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function Leaderboard({ leaderboard }: LeaderboardComponentInterface) {
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
          <thead className="sticky top-0 dark:bg-black bg-white">
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
            {Picks.map((pick, index) => {
              const sortedPlayers = getSortedPlayers(pick);
              return (
                <tr key={`${pick.SubmittedBy}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{pick.SubmittedBy}</td>
                  <td>{pick.Score}</td>
                  <td>
                    {pick.TeamName} ({pick.TScore})
                  </td>
                  <td>
                    {sortedPlayers[0].name} ({sortedPlayers[0].score})
                  </td>
                  <td>
                    {sortedPlayers[1].name} ({sortedPlayers[1].score})
                  </td>
                  <td>
                    {sortedPlayers[2].name} ({sortedPlayers[2].score})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
