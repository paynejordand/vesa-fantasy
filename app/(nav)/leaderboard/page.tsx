import { Metadata } from "next";
import Link from "next/link";
import { getSeasonsFromSchedule } from "@/app/db/data";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Divisional leaderboard showing rankings for each division in the VESA Fantasy League.",
};

export default async function Page() {
  const seasons = await getSeasonsFromSchedule();
  if (!seasons) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        Nothing in the leaderboards
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {seasons.map((season) => (
        <Link
          key={season}
          href={`/leaderboard/${season}`}
          className="text-sm font-medium text-blue-500 hover:underline"
        >
          Season {season} Leaderboards
        </Link>
      ))}
    </div>
  );
}
