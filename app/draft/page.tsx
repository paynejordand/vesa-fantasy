import { DivisionNav } from "@/app/components/DivisionNav";
import { getNumberOfDivisions } from "@/app/db/data";

export default async function Page() {
  const numDivs = await getNumberOfDivisions();
  if (!numDivs) return <div> Database has no players </div>;
  
  return <DivisionNav divisions={numDivs} weeks={6} route={'/draft/pick'} />;
}
