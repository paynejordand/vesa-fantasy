import { Team } from "@/app/db/definitions";

export function TeamList({
  allTeams,
  selectedTeam,
  selectTeamAction,
}: {
  allTeams: Team[];
  selectedTeam: Team | null;
  selectTeamAction: (team: Team) => void;
}) {
  return (
    <h1 className="text-2xl font-bold mb-4">
      Select a Team
      <div className="container flex flex-wrap gap-4">
        {allTeams.map((team) => (
          <div
            className="border p-4 rounded-lg"
            key={team.TeamID}
            style={{
              backgroundColor: selectedTeam === team ? "green" : "black",
            }}
          >
            <div className="container flex flex-col items-center">
              <a className="flex">{team.Name}</a>
              <button
                className="flex text-white rounded"
                onClick={() => selectTeamAction(team)}
              >
                {selectedTeam === team ? "Deselect" : "Select"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </h1>
  );
}
