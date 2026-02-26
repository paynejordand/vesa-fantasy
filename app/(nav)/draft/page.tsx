import { DivisionNavLoader } from "@/app/components/DivisionNavLoader";
import { Metadata } from "next";
export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Draft",
  description:
    "Weekly fantasy draft for the VESA esports league.",
};
export default async function Page() {
  return <DivisionNavLoader route="/draft/pick" />;
}
