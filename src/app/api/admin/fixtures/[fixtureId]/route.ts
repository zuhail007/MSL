import { NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongoose";
import { FixtureModel } from "@/models/Fixture";
import { requireAdminToken } from "@/lib/adminAccess";

const FixtureUpdateSchema = z.object({
  homeTeamId: z.string().min(1).optional(),
  awayTeamId: z.string().min(1).optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(["scheduled", "completed"]).optional(),
  homeScore: z.number().int().nullable().optional(),
  awayScore: z.number().int().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = FixtureUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await connectToDatabase();

  const update: any = {};
  if (parsed.data.homeTeamId) update.homeTeamId = new ObjectId(parsed.data.homeTeamId);
  if (parsed.data.awayTeamId) update.awayTeamId = new ObjectId(parsed.data.awayTeamId);
  if (parsed.data.scheduledAt) update.scheduledAt = new Date(parsed.data.scheduledAt);
  if (parsed.data.status) update.status = parsed.data.status;

  // Only allow scores when completed; still store null otherwise.
  if (parsed.data.status === "completed") {
    if (parsed.data.homeScore !== undefined) update.homeScore = parsed.data.homeScore;
    if (parsed.data.awayScore !== undefined) update.awayScore = parsed.data.awayScore;
  } else {
    if (parsed.data.homeScore !== undefined) update.homeScore = null;
    if (parsed.data.awayScore !== undefined) update.awayScore = null;
  }

  const fixture = await FixtureModel.findByIdAndUpdate(fixtureId, update, { new: true }).lean();
  if (!fixture) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  await requireAdminToken();
  await connectToDatabase();
  await FixtureModel.findByIdAndDelete(fixtureId);
  return NextResponse.json({ ok: true });
}

