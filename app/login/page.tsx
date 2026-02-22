import { getUser } from "@/app/lib/dal";
import { redirect } from "next/navigation";

export default async function Page() {
    const user = await getUser();
    if (!user) return <div> Press that sign in button up there</div>

    redirect('/');
}