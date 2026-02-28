import { DivisionNavWrapper } from "@/app/components/division-nav";
import { Metadata } from "next";
export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Draft",
  description:
    "Weekly fantasy draft for the VESA esports league.",
};
export default async function Page() {
  return <DivisionNavWrapper route="/draft/pick" />;
}
