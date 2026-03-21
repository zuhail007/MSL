import { NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel, type TeamMemberRole } from "@/models/Team";
import { requireAdminToken } from "@/lib/adminAccess";

const MemberUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  role: z.enum(["owner", "keyplayer", "player"] satisfies TeamMemberRole[]).optional(),
  photoFileId: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  const { teamId, memberId } = await params;
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = MemberUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await connectToDatabase();
  const team = await TeamModel.findById(teamId);
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const member = team.members.id(memberId) as any;
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const nextRole = parsed.data.role;
  if (nextRole === "owner") {
    team.members.forEach((m: any) => {
      if (String(m._id) !== String(memberId) && m.role === "owner") m.role = "player";
    });
  }
  if (nextRole === "keyplayer") {
    team.members.forEach((m: any) => {
      if (String(m._id) !== String(memberId) && m.role === "keyplayer")
        m.role = "player";
    });
  }

  if (parsed.data.name !== undefined) member.name = parsed.data.name;
  if (parsed.data.position !== undefined) member.position = parsed.data.position;
  if (parsed.data.role !== undefined) member.role = parsed.data.role;
  if (parsed.data.photoFileId !== undefined) {
    member.photoFileId = parsed.data.photoFileId ? new ObjectId(String(parsed.data.photoFileId)) : null;
  }

  await team.save();
  return NextResponse.json({
    _id: String(member._id),
    name: member.name,
    position: member.position,
    role: member.role,
    photoFileId: member.photoFileId ? String(member.photoFileId) : null,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  const { teamId, memberId } = await params;
  await requireAdminToken();
  await connectToDatabase();
  const team = await TeamModel.findById(teamId);
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const removed = team.members.id(memberId) as any;
  if (!removed) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  removed.remove();
  await team.save();
  return NextResponse.json({ ok: true });
}

