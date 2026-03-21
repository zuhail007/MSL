import mongoose from "mongoose";

export type FixtureStatus = "scheduled" | "completed";

const FixtureSchema = new mongoose.Schema(
  {
    season: { type: String, default: "default", index: true },
    homeTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    scheduledAt: { type: Date, default: () => new Date() },
    status: { type: String, enum: ["scheduled", "completed"], default: "scheduled" },
    homeScore: { type: Number, default: null },
    awayScore: { type: Number, default: null },
  },
  { timestamps: true }
);

FixtureSchema.index({ season: 1, homeTeamId: 1, awayTeamId: 1, scheduledAt: 1 });

export const FixtureModel: any =
  mongoose.models.Fixture || mongoose.model("Fixture", FixtureSchema);

export { FixtureSchema };

