import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { RequireAdmin } from "@/components/RequireAdmin";
import AdminGroupsClient from "./AdminGroupsClient";

export default async function AdminGroupsPage() {
  await RequireAdmin();
  await connectToDatabase();
  const teams = await TeamModel.find().sort({ group: 1, name: 1 }).lean();

  const initialTeams = teams.map((t: any) => ({
    _id: String(t._id),
    name: t.name,
    shortName: t.shortName || "",
    logoFileId: t.logoFileId ? String(t.logoFileId) : null,
    group: t.group || "A",
    memberCount: (t.members || []).length,
  }));

  return <AdminGroupsClient initialTeams={initialTeams} />;
}
