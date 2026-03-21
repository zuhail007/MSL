import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { ChampionModel } from "@/models/Champion";
import { TeamModel } from "@/models/Team";

export async function GET() {
  await connectToDatabase();

  const championDoc = await ChampionModel.findOne({ season: "default" }).lean();
  if (!championDoc) return NextResponse.json({ entries: [] });

  const entryTeamIds = championDoc.entries.map((e) => String(e.teamId));
  const teams = await TeamModel.find({ _id: { $in: entryTeamIds } }).lean();
  const teamById = new Map(teams.map((t) => [String(t._id), t] as const));

  const entries = championDoc.entries.map((e) => {
    const team = teamById.get(String(e.teamId));
    return {
      teamId: String(e.teamId),
      teamName: team?.name || "Unknown",
      logoFileId: team?.logoFileId ? String(team.logoFileId) : null,
      championPhotoFileId: e.photoFileId ? String(e.photoFileId) : null,
    };
  });

  return NextResponse.json({ entries });
}

