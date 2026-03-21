import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { FixtureModel } from "@/models/Fixture";
import { TeamModel } from "@/models/Team";
import { computeStandings } from "@/lib/standings";
import { LeagueSettingsModel } from "@/models/LeagueSettings";

export async function GET() {
  await connectToDatabase();

  const [teams, fixtures] = await Promise.all([
    TeamModel.find().lean(),
    FixtureModel.find({ season: "default" }).lean(),
  ]);

  const settings = await LeagueSettingsModel.findOne({ season: "default" }).lean();
  const pointsRules = settings?.pointsRules || { win: 3, draw: 1, loss: 0 };

  const standings = computeStandings({
    fixtures,
    teams: teams.map((t) => ({
      _id: t._id,
      name: t.name,
      logoFileId: t.logoFileId,
    })),
    pointsRules,
  });

  const completed = fixtures
    .filter((f) => f.status === "completed" && f.homeScore != null && f.awayScore != null)
    .sort({ scheduledAt: -1 })
    .map((f) => {
      const home = teams.find((t) => String(t._id) === String(f.homeTeamId));
      const away = teams.find((t) => String(t._id) === String(f.awayTeamId));
      return {
        _id: String(f._id),
        scheduledAt: f.scheduledAt,
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

  return NextResponse.json({ standings, completedFixtures: completed });
}

