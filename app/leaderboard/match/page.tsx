import { getUser } from "@/app/lib/dal";
import { clamp } from "@/app/lib/utils";
import { CalcLeaderboardComponent } from "@/app/components/CalcLeaderboardComponent";
import { LeaderboardComponent } from "@/app/components/LeaderboardComponent";
import { getLeaderboardByDivisionAndWeek } from "@/app/db/data";


interface PageProps {
  searchParams: Promise<{
    div?: string;
    week?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const user = await getUser();

  const { div, week } = await searchParams;

  const division = clamp(1, 7, div ? Number(div) : 1);
  const weekNumber = clamp(1, 7, week ? Number(week) : 1);

  const leaderboard = await getLeaderboardByDivisionAndWeek(
    division,
    weekNumber,
  );

  return (
    <div>
      {user?.role === "Admin" && <CalcLeaderboardComponent division={division} week={weekNumber}/>}
      {leaderboard ? (
        <LeaderboardComponent leaderboard={leaderboard} />
      ) : (
        <p>Uh oh</p>
      )}
    </div>
  );
}
