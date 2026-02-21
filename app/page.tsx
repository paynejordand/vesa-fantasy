import { DraftComponent } from "@/app/components/draft";
import { auth } from "@/auth";
import { LeaderboardComponent } from "@/app/components/leaderboard";
import { getPlayersByDivision, getTeamsByDivision } from "@/app/db/data";

export default async function Page() {
  const session = await auth();
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Please log in to access the draft.
        </h1>
      </div>
    );
  }
  const players = await getPlayersByDivision(1);
  if (players === null) return <div> No players in this division</div>
  const teams = await getTeamsByDivision(1);
  if (teams === null) return <div> No teams in this division</div>
    return (
    <div>
      <DraftComponent players={players} teams={teams}/>
      <LeaderboardComponent />
    </div>
  );
}
