import { DraftComponent } from "@/app/components/draft";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Please log in to access the draft.
        </h1>
      </div>
    );
  }
  return (
    <div>
      <DraftComponent />
    </div>
  );
}
