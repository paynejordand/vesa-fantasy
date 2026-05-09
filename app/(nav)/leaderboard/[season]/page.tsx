import { DivisionNavWrapper } from "@/app/components/division-nav";

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
      <DivisionNavWrapper
        route={`/leaderboard/${season}/match`}
        season={Number(season)}
      />
    </div>
  );
}
