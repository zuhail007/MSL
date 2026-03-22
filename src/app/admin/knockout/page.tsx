import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { RequireAdmin } from "@/components/RequireAdmin";
import AdminKnockoutClient from "./AdminKnockoutClient";

export default async function AdminKnockoutPage() {
  await RequireAdmin();
  await connectToDatabase();
  const teams = (await TeamModel.find().sort({ name: 1 }).lean()) as any[];

  const teamChoices = teams.map((t) => ({
    _id: String(t._id),
    name: t.name,
    logoFileId: t.logoFileId ? String(t.logoFileId) : null,
  }));

  return <AdminKnockoutClient initialTeams={teamChoices} />;
}
