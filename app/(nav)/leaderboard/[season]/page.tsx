import { DivisionNavWrapper } from "@/app/components/division-nav";
import Link from "next/link";

interface PageProps {
  params: Promise<{ season: string }>;
}

export default async function Page({ params }: PageProps) {
  const { season } = await params;
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold underline">
        Season {season} Leaderboards
      </h2>
      <Link href={`/leaderboard/${season}/overall`} className="text-blue-500 hover:underline">
        Overall Leaderboard
      </Link>
      <DivisionNavWrapper
        route={`/leaderboard/${season}/match`}
        season={Number(season)}
      />
    </div>
  );
}
