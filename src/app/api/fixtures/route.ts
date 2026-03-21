import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { FixtureModel } from "@/models/Fixture";
import { TeamModel } from "@/models/Team";

export async function GET() {
  await connectToDatabase();

  const [teams, fixtures] = await Promise.all([
    TeamModel.find().lean(),
    FixtureModel.find({ season: "default" }).sort({ scheduledAt: 1 }).lean(),
  ]);

  const teamById = new Map(teams.map((t) => [String(t._id), t] as const));

  const payload = fixtures.map((f) => {
    const home = teamById.get(String(f.homeTeamId));
    const away = teamById.get(String(f.awayTeamId));
    return {
      _id: String(f._id),
      season: f.season,
      scheduledAt: f.scheduledAt,
      status: f.status,
      homeTeam: home
        ? { _id: String(home._id), name: home.name, logoFileId: home.logoFileId ? String(home.logoFileId) : null }
        : { _id: String(f.homeTeamId), name: "TBD", logoFileId: null },
      awayTeam: away
        ? { _id: String(away._id), name: away.name, logoFileId: away.logoFileId ? String(away.logoFileId) : null }
        : { _id: String(f.awayTeamId), name: "TBD", logoFileId: null },
      homeScore: f.homeScore,
      awayScore: f.awayScore,
    };
  });

  return NextResponse.json(payload);
}

