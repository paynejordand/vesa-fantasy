import { DivisionNavLoader } from "@/app/components/DivisionNavLoader";
export const revalidate = 3600;
export default async function Page() {
  return <DivisionNavLoader route="/draft/pick" />;
}
