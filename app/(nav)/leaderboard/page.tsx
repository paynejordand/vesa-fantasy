import { DivisionNavLoader } from "@/app/components/DivisionNavLoader";
import { Metadata } from "next";
export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Divisional leaderboard showing rankings for each division in the VESA Fantasy League.",
};
export default async function Page() {
  return <DivisionNavLoader route="/leaderboard/match" />;
}
