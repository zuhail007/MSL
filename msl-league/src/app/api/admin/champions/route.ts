import { NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongoose";
import { ChampionModel } from "@/models/Champion";
import { requireAdminToken } from "@/lib/adminAccess";

const UpdateChampionsSchema = z.object({
  entries: z
    .array(
      z.object({
        teamId: z.string().min(1),
        photoFileId: z.string().nullable().optional(),
      })
    )
    .optional(),
});

export async function GET() {
  await requireAdminToken();
  await connectToDatabase();
  const doc = await ChampionModel.findOne({ season: "default" }).lean();
  return NextResponse.json(
    doc
      ? {
          season: doc.season,
          entries: doc.entries.map((e: any) => ({
            teamId: String(e.teamId),
            photoFileId: e.photoFileId ? String(e.photoFileId) : null,
          })),
        }
      : { season: "default", entries: [] }
  );
}

export async function PUT(req: Request) {
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = UpdateChampionsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await connectToDatabase();

  const entries = (parsed.data.entries || []).map((e) => ({
    teamId: new ObjectId(e.teamId),
    photoFileId: e.photoFileId ? new ObjectId(String(e.photoFileId)) : null,
  }));

  const updated = await ChampionModel.findOneAndUpdate(
    { season: "default" },
    { entries },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({ ok: true, entries: updated?.entries || [] });
}

