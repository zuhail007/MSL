import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { RequireAdmin } from "@/components/RequireAdmin";
import AdminChampionsClient from "./AdminChampionsClient";

export default async function AdminChampionsPage() {
  await RequireAdmin();
  await connectToDatabase();

  const teams = await TeamModel.find().sort({ name: 1 }).lean();

  const initialTeams = teams.map((t: any) => ({
    id: String(t._id), // ✅ correct
    name: t.name,
    logoFileId: t.logoFileId ? String(t.logoFileId) : null,
  }));

  return <AdminChampionsClient initialTeams={initialTeams} />;
}