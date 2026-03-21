import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongoose";
import { LeagueSettingsModel } from "@/models/LeagueSettings";
import { requireAdminToken } from "@/lib/adminAccess";

const SettingsUpdateSchema = z.object({
  siteTitle: z.string().min(1).optional(),
  tagline: z.string().min(1).optional(),
  about: z.string().min(1).optional(),
  pointsRules: z
    .object({
      win: z.number().int().nonnegative().optional(),
      draw: z.number().int().nonnegative().optional(),
      loss: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export async function GET() {
  await requireAdminToken();
  await connectToDatabase();
  const doc = await LeagueSettingsModel.findOne({ season: "default" }).lean();
  const settings = doc || (await LeagueSettingsModel.create({ season: "default" })).toObject();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  await requireAdminToken();
  const body = await req.json().catch(() => null);
  const parsed = SettingsUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await connectToDatabase();

  const update: any = {};
  if (parsed.data.siteTitle !== undefined) update.siteTitle = parsed.data.siteTitle;
  if (parsed.data.tagline !== undefined) update.tagline = parsed.data.tagline;
  if (parsed.data.about !== undefined) update.about = parsed.data.about;
  if (parsed.data.pointsRules !== undefined) update.pointsRules = parsed.data.pointsRules;

  await LeagueSettingsModel.findOneAndUpdate({ season: "default" }, update, { upsert: true });
  return NextResponse.json({ ok: true });
}

