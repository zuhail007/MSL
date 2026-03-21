import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ChampionModel } from "@/models/Champion";

const MONGO_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
}

export async function GET() {
  try {
    await connectDB();

    const champions = await ChampionModel.find().populate("entries.teamId");

    return NextResponse.json(champions);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "GET failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const newChampion = await ChampionModel.create({
      season: body.season,
      entries: body.entries.map((e: any) => ({
        teamId: new mongoose.Types.ObjectId(e.teamId),
      })),
    });

    return NextResponse.json(newChampion);
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: "POST failed" }, { status: 500 });
  }
}