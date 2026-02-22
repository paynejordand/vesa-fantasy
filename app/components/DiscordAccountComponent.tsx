import { signIn, signOut } from "@/auth";
import { DiscordAvatar } from "@/app/components/DiscordAvatar";
import discordIcon from "@/public/discord.svg";
import Image from "next/image";

export function DiscordSignIn() {
  console.log("uh oh");
  return (
    <button
      onClick={async () => {
        "use server";
        await signIn("discord");
      }}
      className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#5865F2] px-6 text-white font-medium transition-colors hover:bg-[#4752C4] dark:hover:bg-[#7289DA]"
    >
      {<Image src={discordIcon} alt="Discord Logo" width={20} height={20} />}
      Sign in with Discord
    </button>
  );
}

export function DiscordSignOut() {
  return (
    <button
      onClick={async () => {
        "use server";
        await signOut();
      }}
      className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#5865F2] px-6 text-white font-medium transition-colors hover:bg-[#4752C4] dark:hover:bg-[#7289DA]"
    >
      <DiscordAvatar />
      Sign out
    </button>
  );
}
