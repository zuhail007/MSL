import { NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { requireAdminToken } from "@/lib/adminAccess";

const CreateTeamSchema = z.object({
  name: z.string().min(1),
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

export async function GET() {
  await requireAdminToken();
  await connectToDatabase();
  const teams = await TeamModel.find().sort({ name: 1 }).lean();
  return NextResponse.json(teams.map(mapTeam));
}

export async function POST(req: Request) {
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = CreateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();

  const logoFileId =
    parsed.data.logoFileId && parsed.data.logoFileId !== "null"
      ? new ObjectId(parsed.data.logoFileId)
      : null;

  const team = await TeamModel.create({
    name: parsed.data.name,
    shortName: parsed.data.shortName || "",
    logoFileId,
    members: [],
  });

  return NextResponse.json(mapTeam(team));
}

