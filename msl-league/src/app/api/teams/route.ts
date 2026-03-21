import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";

export async function GET() {
  await connectToDatabase();
  const teams = await TeamModel.find().sort({ name: 1 }).lean();

  const payload = teams.map((t) => ({
    _id: String(t._id),
    name: t.name,
    shortName: t.shortName || "",
    logoFileId: t.logoFileId ? String(t.logoFileId) : null,
    members: (t.members || []).map((m) => ({
      _id: String(m._id),
      name: m.name,
      position: m.position,
      role: m.role,
      photoFileId: m.photoFileId ? String(m.photoFileId) : null,
    })),
  }));

  return NextResponse.json(payload);
}

