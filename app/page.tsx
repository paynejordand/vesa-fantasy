import {
  placementScores,
  damageScore,
  assistScore,
  knockdownScore,
  killScore,
  respawnScore,
} from "@/app/lib/constants";
import { LocalTime } from "@/app/components/local-time";

export default function Page() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-12 underline">
          WELCOME TO VESA FANTASY
        </h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Rules:</h2>
            <ul className="ml-8 space-y-2">
              <div className="text-xl">
                <p className="mb-2">
                  - Each week, you will draft a team of 3 players and 1 team
                  from each division.
                </p>
                <p className="mb-2">
                  - Games are played starting at 8:00 PM eastern time (
                  <LocalTime date={new Date("2024-01-01T20:00:00-05:00")} />
                  ){" "}
                </p>
              </div>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Scoring:</h2>
            <div className="ml-8 space-y-2">
              <div className="text-xl">
                <p className="mb-2">
                  - Teams are scored by their placement per game:
                </p>
                <ul className="ml-8 space-y-1">
                  {Object.entries(placementScores).map(
                    ([placement, points]) => (
                      <li key={placement}>
                        {placement === "1"
                          ? "1st"
                          : placement === "2"
                            ? "2nd"
                            : placement === "3"
                              ? "3rd"
                              : `${placement}th`}
                        : {points} points
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="text-xl">
                <p className="mb-2">
                  - Players are scored by their overall stats:
                </p>
                <ul className="ml-8 space-y-1">
                  <li>damage * {damageScore}</li>
                  <li>assists * {assistScore}</li>
                  <li>knockdowns * {knockdownScore}</li>
                  <li>kills * {killScore}</li>
                  <li>respawns * {respawnScore}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
