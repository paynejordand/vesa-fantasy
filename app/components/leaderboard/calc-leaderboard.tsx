"use client";

import { useState } from "react";
import { scoreDraft } from "@/app/db/actions";

interface CalcLeaderboardProps {
  week: number;
  division: number;
}

export function CalcLeaderboard({ division, week }: CalcLeaderboardProps) {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isFormValid = link && division && week;

  return (
    <div className="flex justify-center">
      <form
        action={async (formData: FormData) => {
          try {
            await scoreDraft(
              division,
              week,
              formData.get("MatchLink") as string,
            );
          } catch {
            setError(
              "An error occurred while submitting the match link. Please try again.",
            );
          }
        }}
      >
        <label>
          Overstat Link
          <input
            type="text"
            name="MatchLink"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </label>
        <button disabled={!isFormValid}>Submit</button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
