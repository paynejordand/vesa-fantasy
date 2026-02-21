import { scoreDraft } from "@/app/db/actions";

export function LeaderboardComponent() {
  async function ScorePicks(formData: FormData) {
    "use server";
    const rawFormData = {
      link: formData.get("MatchLink"),
    };
    scoreDraft(1, 1, rawFormData.link as string);
  }
  return (
    <form action={ScorePicks}>
      <label>
        Overstat Link
        <input type="text" name="MatchLink" id="Link" required />
        <button>Submit</button>
      </label>
    </form>
  );
}
