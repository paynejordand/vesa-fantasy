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
    <div className="p-6">
      <h2 className="text-center text-lg font-medium mb-4">
        <Link
          href={MatchLink}
          target="_blank"
          rel="noreferrer"
          className="hover:underline text-blue-500"
        >
          Division {Division}, Week {Week} Scores
        </Link>
      </h2>

      <div className="border border-dashed rounded p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 dark:border-zinc-700">
              <th className="text-left py-2 pr-4 font-semibold underline">
                Submitter
              </th>
              <th className="text-left py-2 pr-4 font-semibold underline">
                Score
              </th>
              <th className="text-left py-2 pr-4 font-semibold underline">
                Team
              </th>
              <th className="text-left py-2 pr-4 font-semibold underline">
                Player 1
              </th>
              <th className="text-left py-2 pr-4 font-semibold underline">
                Player 2
              </th>
              <th className="text-left py-2 pr-4 font-semibold underline">
                Player 3
              </th>
            </tr>
          </thead>
          <tbody>
            {Picks.map((pick, index) => (
              <tr
                key={`${pick.SubmittedBy}-${index}`}
                className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
              >
                <td className="py-2 pr-4">{pick.SubmittedBy}</td>
                <td className="py-2 pr-4">{pick.Score}</td>
                <td className="py-2 pr-4">{pick.TeamName}</td>
                <td className="py-2 pr-4">{pick.Player1Name}</td>
                <td className="py-2 pr-4">{pick.Player2Name}</td>
                <td className="py-2 pr-4">{pick.Player3Name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
