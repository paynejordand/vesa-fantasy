import { PlayerList } from "@/app/components/player-list";
import { TeamList } from "@/app/components/team-list";

export default async function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-6 text-center sm:items-start sm:text-left p-4">
          <h1
            className="flex text-3xl font-semibold tracking-tight text-black dark:text-zinc-50"
            style={{ width: "75%" }}
          >
            Vesa Fantasy Draft
          </h1>
          <PlayerList />
          <TeamList />
        </div>
      </main>
    </div>
  );
}
