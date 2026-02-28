import { Team } from "@/app/db/definitions";

interface TeamListProps {
  allTeams: Team[];
  selectedTeam: string | null;
  selectTeamAction: (team: Team) => void;
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
          const isSelected = selectedTeam === team.TeamID;

          return (
            <div
              key={team.TeamID}
              className={`w-full border p-4 rounded-lg ${isSelected ? "bg-green-600" : "bg-black"}`}
            >
              <div className="flex flex-col items-center justify-between h-20 w-full">
                <p className="text-lg font-semibold">{team.Name}</p>
                <p className="text-sm font-medium">
                  Average Points: {((team.OverallPoints ?? 0) / (team.WeeksPlayed || 1)).toFixed(2)}
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
