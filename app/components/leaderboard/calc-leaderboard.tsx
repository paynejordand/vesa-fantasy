"use client";

import { useState } from "react";
import { scoreDraft } from "@/app/db/actions";

interface CalcLeaderboardProps {
  week: number;
  division: number;
}

export function CalcLeaderboard({
  division,
  week,
}: CalcLeaderboardProps) {
  const [link, setLink] = useState("");

  const isFormValid = link && division && week;

  return (
    <div className="flex justify-center">
      <form
        action={async (formData: FormData) => {
          await scoreDraft(division, week, formData.get("MatchLink") as string);
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
    </div>
  );
}
