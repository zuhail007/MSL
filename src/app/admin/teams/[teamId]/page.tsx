import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { RequireAdmin } from "@/components/RequireAdmin";
import AdminTeamEditClient from "./AdminTeamEditClient";

export default async function AdminTeamEditPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  await RequireAdmin();
  await connectToDatabase();
  const team = (await TeamModel.findById(teamId).lean()) as any;
  if (!team) return <div className="card p-6 text-sm text-white/70">Team not found.</div>;

  const initialTeam = {
    _id: String(team._id),
    name: team.name,
    shortName: team.shortName || "",
    logoFileId: team.logoFileId ? String(team.logoFileId) : null,
    members: (team.members || []).map((m: any) => ({
      _id: String(m._id),
      name: m.name,
      position: m.position,
      role: m.role,
      photoFileId: m.photoFileId ? String(m.photoFileId) : null,
    })),
  };

  return <AdminTeamEditClient initialTeam={initialTeam} />;
}

