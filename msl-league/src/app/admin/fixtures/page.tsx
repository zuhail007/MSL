import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { RequireAdmin } from "@/components/RequireAdmin";
import AdminFixturesClient from "./AdminFixturesClient";

export default async function AdminFixturesPage() {
  await RequireAdmin();
  await connectToDatabase();
  const teams = await TeamModel.find().sort({ name: 1 }).lean();

  const initialTeams = teams.map((t: any) => ({
    _id: String(t._id),
    name: t.name,
    logoFileId: t.logoFileId ? String(t.logoFileId) : null,
  }));

  return <AdminFixturesClient initialTeams={initialTeams} />;
}