import { Metadata } from "next";
import { getUser } from "@/app/lib/dal";
import { AdminPage } from "@/app/components/admin/admin";
import { RemovePlayerFromTeamForm } from "@/app/components/admin/remove-player-team";
import { AddPlayerToTeamForm } from "@/app/components/admin/add-player-team";
import { RemoveTeamForm } from "@/app/components/admin/remove-team";
import { AddTeamForm } from "@/app/components/admin/add-team";
import { getTeamsWithPlayerNames } from "@/app/db/data";
import {
  removePlayersFromTeam,
  addPlayerToTeam,
  removeTeam,
  addTeam,
} from "@/app/db/actions";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin stuff.",
};

export default async function Page() {
  const user = await getUser();
  if (user?.role !== "Admin") {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h1 className="text-2xl font-bold">
          Fuck off, this page isn&apos;t for you.
        </h1>
        <h1 className="text-2xl font-bold">
          It&apos;s not even linked in the nav bar
        </h1>
      </div>
    );
  }

  const teams = await getTeamsWithPlayerNames();
  if (!teams || teams.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h1 className="text-2xl font-bold">Error loading admin data.</h1>
      </div>
    );
  }
  const divisions = [...new Set(teams.map((t) => t.Division))].sort();
  const divisionCounts = [1, 2, 3, 4, 5, 6, 7].map((div) => ({
    division: div,
    count: teams.filter((t) => t.Division === div).length,
  }));

  const tabs = [
    {
      label: "Remove Player",
      component: (
        <RemovePlayerFromTeamForm
          teams={teams}
          divisions={divisions}
          onRemove={removePlayersFromTeam}
        />
      ),
    },
    {
      label: "Add Player",
      component: (
        <AddPlayerToTeamForm
          teams={teams}
          divisions={divisions}
          onAdd={addPlayerToTeam}
        />
      ),
    },
    {
      label: "Remove Team",
      component: (
        <RemoveTeamForm
          teams={teams}
          divisions={divisions}
          onRemove={removeTeam}
        />
      ),
    },
    {
      label: "Add Team",
      component: (
        <AddTeamForm divisionCounts={divisionCounts} onAdd={addTeam} />
      ),
    },
  ];

  return <AdminPage tabs={tabs} />;
}
