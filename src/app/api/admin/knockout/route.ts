import { NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongoose";
import { FixtureModel } from "@/models/Fixture";
import { TeamModel } from "@/models/Team";
import { requireAdminToken } from "@/lib/adminAccess";

const KnockoutCreateSchema = z.object({
  round: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  scheduledAt: z.string().optional(),
  status: z.enum(["scheduled", "completed"]).optional(),
  homeScore: z.number().int().nullable().optional(),
  awayScore: z.number().int().nullable().optional(),
});

function mapKnockout(f: any, teamsById: Map<string, any>) {
  const home = teamsById.get(String(f.homeTeamId));
  const away = teamsById.get(String(f.awayTeamId));
  return {
    _id: String(f._id),
    round: f.round,
    scheduledAt: f.scheduledAt ? new Date(f.scheduledAt).toISOString() : null,
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
}

export async function GET() {
  await requireAdminToken();
  await connectToDatabase();

  const [teams, fixtures] = await Promise.all([
    TeamModel.find().lean(),
    FixtureModel.find({ season: "default", stage: "knockout" }).sort({ scheduledAt: 1 }).lean(),
  ]);

  const teamsById = new Map(teams.map((t) => [String(t._id), t] as const));
  return NextResponse.json(fixtures.map((f) => mapKnockout(f, teamsById)));
}

export async function POST(req: Request) {
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = KnockoutCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await connectToDatabase();

  const homeTeamId = new ObjectId(parsed.data.homeTeamId);
  const awayTeamId = new ObjectId(parsed.data.awayTeamId);
  const scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : new Date();
  const status = parsed.data.status || "scheduled";

  const fixture = await FixtureModel.create({
    season: "default",
    homeTeamId,
    awayTeamId,
    scheduledAt,
    status,
    stage: "knockout",
    round: parsed.data.round,
    homeScore: status === "completed" ? (parsed.data.homeScore ?? null) : null,
    awayScore: status === "completed" ? (parsed.data.awayScore ?? null) : null,
  });

  return NextResponse.json({ _id: String(fixture._id) });
}
