import mongoose from "mongoose";

const LeagueSettingsSchema = new mongoose.Schema(
  {
    season: { type: String, default: "default", index: true },
    siteTitle: { type: String, default: "MSL League" },
    tagline: { type: String, default: "Sport. Pride. Fire." },
    about: {
      type: String,
      default:
        "MSN is hosted by the MSL League. Follow teams, fixtures, results and champions in one place.",
    },
    pointsRules: {
      win: { type: Number, default: 3 },
      draw: { type: Number, default: 1 },
      loss: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const LeagueSettingsModel: any =
  mongoose.models.LeagueSettings ||
  mongoose.model("LeagueSettings", LeagueSettingsSchema);

export type LeagueSettingsDoc = mongoose.InferSchemaType<typeof LeagueSettingsSchema>;

