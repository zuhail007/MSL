import { NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { requireAdminToken } from "@/lib/adminAccess";

const MemberCreateSchema = z.object({
  name: z.string().min(1),
  position: z.string().min(1),
  role: z.enum(["owner", "keyplayer", "player"] as const),
  photoFileId: z.string().nullable().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = MemberCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await connectToDatabase();
  const team = await TeamModel.findById(teamId);
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // If admin sets owner/keyplayer, we normalize so only one of each exists.
  if (parsed.data.role === "owner") {
    team.members.forEach((m: any) => {
      if (m.role === "owner") m.role = "player";
    });
  }
  if (parsed.data.role === "keyplayer") {
    team.members.forEach((m: any) => {
      if (m.role === "keyplayer") m.role = "player";
    });
  }

  const photoFileId =
    parsed.data.photoFileId ? new ObjectId(String(parsed.data.photoFileId)) : null;

  team.members.push({
    name: parsed.data.name,
    position: parsed.data.position,
    role: parsed.data.role,
    photoFileId,
  });

  await team.save();

  const updated = team.toObject();
  return NextResponse.json({
    _id: String(updated._id),
    members: (updated.members || []).map((m: any) => ({
      _id: String(m._id),
      name: m.name,
      position: m.position,
      role: m.role,
      photoFileId: m.photoFileId ? String(m.photoFileId) : null,
    })),
  });
}

