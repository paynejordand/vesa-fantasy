import { getNumberOfDivisions } from "@/app/db/data";
import { DivisionNav } from "@/app/components/DivisionNav";

export default async function Page() {
  const numDivs = await getNumberOfDivisions();
  if (!numDivs) return <div> Database has no players </div>;

  return (
    <div>
      <DivisionNav divisions={numDivs} weeks={6} route={"/leaderboard/match"} />
    </div>
  );
}
