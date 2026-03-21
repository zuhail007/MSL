import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { ChampionModel } from "@/models/Champion";

const MONGO_URI = process.env.MONGODB_URI!;

// 🔌 Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
}

// ✅ GET Champions
export async function GET() {
  try {
    await connectDB();

    const champions = await ChampionModel.find()
      .populate("entries.teamId");

    return NextResponse.json(champions);
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch champions" },
      { status: 500 }
    );
  }
}

// ✅ POST Champion (FIXED VERSION)
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("Incoming body:", body); // debug

    const newChampion = await ChampionModel.create({
      season: body.season,
      entries: body.entries.map((e: any) => ({
        teamId: new ObjectId(e.teamId),
      })),
    });

    console.log("Created Champion:", newChampion);

    return NextResponse.json(newChampion);
  } catch (err: any) {
    console.error("POST ERROR:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to create champion" },
      { status: 500 }
    );
  }
}