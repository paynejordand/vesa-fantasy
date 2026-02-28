import { getUser } from "@/app/lib/dal";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in with Discord to manage your fantasy team and compete in the VESA Fantasy League!",
};

export default async function Page() {
  const user = await getUser();
  if (!user)
    return (
      <div className="flex justify-center items-center">
        <h1 className="text-2xl text-center">
          <p>
            This site uses Discord to sign in and to manage your fantasy picks.
          </p>
          <p>So press that Sign in with Discord button up there in the top right</p>
        </h1>
      </div>
    );

  redirect("/");
}
