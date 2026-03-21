import { connectToDatabase } from "@/lib/mongoose";
import { LeagueSettingsModel } from "@/models/LeagueSettings";
import { RequireAdmin } from "@/components/RequireAdmin";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  await RequireAdmin();
  await connectToDatabase();
  const doc = await LeagueSettingsModel.findOne({ season: "default" }).lean();
  const rawSettings =
    doc ||
    (await LeagueSettingsModel.create({
      season: "default",
    })).toObject();

  const settings = {
    season: String(rawSettings.season || "default"),
    siteTitle: String(rawSettings.siteTitle || "MSL League"),
    tagline: String(rawSettings.tagline || "Sport. Pride. Fire."),
    about: String(
      rawSettings.about ||
        "MSN is hosted by the MSL League. Follow teams, fixtures, results and champions in one place."
    ),
    logo: String(rawSettings.logo || ""),
    tournamentLogo: String(rawSettings.tournamentLogo || ""),
    pointsRules: {
      win: Number(rawSettings.pointsRules?.win ?? 3),
      draw: Number(rawSettings.pointsRules?.draw ?? 1),
      loss: Number(rawSettings.pointsRules?.loss ?? 0),
    },
  };

  return <AdminSettingsClient initialSettings={settings} />;
}

