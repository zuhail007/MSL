import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { FixtureModel } from "@/models/Fixture";
import { requireAdminToken } from "@/lib/adminAccess";

const UpdateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  shortName: z.string().optional(),
  group: z.string().optional(),
});

function mapTeam(t: any) {
  return {
    _id: String(t._id),
    name: t.name,
    shortName: t.shortName || "",
    logoFileId: t.logoFileId ? String(t.logoFileId) : null,
    group: t.group || "A",
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
  { params }: { params: { id: string } }
) {
  await requireAdminToken();
  await connectToDatabase();
  const team = await TeamModel.findById(params.id).lean();
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapTeam(team));
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = UpdateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await connectToDatabase();
  const update: Record<string, any> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.shortName !== undefined) update.shortName = parsed.data.shortName;
  if (parsed.data.group !== undefined) update.group = parsed.data.group;

  const team = await TeamModel.findByIdAndUpdate(
    params.id,
    { $set: update },
    { new: true }
  ).lean();
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapTeam(team));
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await requireAdminToken();
  await connectToDatabase();
  await TeamModel.findByIdAndDelete(params.id);
  await FixtureModel.deleteMany({
    $or: [{ homeTeamId: params.id }, { awayTeamId: params.id }],
  });
  return NextResponse.json({ ok: true });
}