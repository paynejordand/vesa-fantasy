import { getWeeksAndDivisionsFromSchedule } from "@/app/db/data";
import { DivisionNav } from "@/app/components/DivisionNav";

export async function DivisionNavLoader({ route }: { route: string }) {
  const divWeeks = await getWeeksAndDivisionsFromSchedule();
  if (!divWeeks) return <div>Database has no schedule</div>;
  return <DivisionNav divisionWeeks={divWeeks} route={route} />;
}
