import { TeamSelect } from "@/app/db/schema";

interface TeamListProps {
  allTeams: TeamSelect[];
  selectedTeam: string | null;
  selectTeamAction: (team: TeamSelect) => void;
}

export function TeamList({
  allTeams,
  selectedTeam,
  selectTeamAction,
}: TeamListProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Select a Team</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {allTeams.map((team) => {
          const isSelected = selectedTeam === team.teamid;

          return (
            <div
              key={team.teamid}
              className={`w-full border p-4 rounded-lg ${isSelected ? "bg-green-600" : "bg-black"}`}
            >
              <div className="flex flex-col items-center justify-between h-20 w-full">
                <p className="text-lg font-semibold text-white">{team.name}</p>
                <p className="text-sm font-medium text-white">
                  Average Points: {((Number(team.overallpoints) ?? 0) / (team.weeksplayed || 1)).toFixed(2)}
                </p>
                <button
                  className="text-white rounded"
                  onClick={() => selectTeamAction(team)}
                >
                  {isSelected ? "Deselect" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
