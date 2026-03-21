import { NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { FixtureModel } from "@/models/Fixture";
import { requireAdminToken } from "@/lib/adminAccess";

const TeamUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  shortName: z.string().optional(),
  logoFileId: z.string().nullable().optional(),
});

function mapTeam(t: any) {
  return {
    _id: String(t._id),
    name: t.name,
    shortName: t.shortName || "",
    logoFileId: t.logoFileId ? String(t.logoFileId) : null,
    members: (t.members || []).map((m: any) => ({
      _id: String(m._id),
      name: m.name,
      position: m.position,
      role: m.role,
      photoFileId: m.photoFileId ? String(m.photoFileId) : null,
    })),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  await requireAdminToken();
  await connectToDatabase();
  const team = await TeamModel.findById(teamId).lean();
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapTeam(team));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = TeamUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await connectToDatabase();

  const update: any = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.shortName !== undefined) update.shortName = parsed.data.shortName;
  if (parsed.data.logoFileId !== undefined) {
    update.logoFileId =
      parsed.data.logoFileId === null ? null : new ObjectId(String(parsed.data.logoFileId));
  }

  const team = await TeamModel.findByIdAndUpdate(teamId, update, { new: true }).lean();
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapTeam(team));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  await requireAdminToken();
  await connectToDatabase();

  await FixtureModel.deleteMany({
    $or: [{ homeTeamId: new ObjectId(teamId) }, { awayTeamId: new ObjectId(teamId) }],
  });
  await TeamModel.findByIdAndDelete(teamId);
  return NextResponse.json({ ok: true });
}

