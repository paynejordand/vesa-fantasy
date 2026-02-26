import { getUser } from "@/app/lib/dal";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getUser();
  if (!user)
    return (
      <div className="flex justify-center items-center">
        <h1 className="text-2xl text-center">
          <p>
            This site uses Discord for sign in and to manage your fantasy team.
          </p>
          <p>So press that Sign in with Discord button up there in the top right</p>
        </h1>
      </div>
    );

  redirect("/");
}
