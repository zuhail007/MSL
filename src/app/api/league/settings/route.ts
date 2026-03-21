import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { LeagueSettingsModel } from "@/models/LeagueSettings";

export async function GET() {
  await connectToDatabase();

  const doc = await LeagueSettingsModel.findOne({ season: "default" }).lean();
  const settings = doc || (await LeagueSettingsModel.create({ season: "default" }));

  const payload = {
    season: settings.season,
    siteTitle: settings.siteTitle,
    tagline: settings.tagline,
    about: settings.about,
    pointsRules: settings.pointsRules,
  };

  return NextResponse.json(payload);
}

