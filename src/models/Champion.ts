import mongoose from "mongoose";

const ChampionEntrySchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    photoFileId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: true }
);

const ChampionSchema = new mongoose.Schema(
  {
    season: { type: String, default: "default", index: true },
    entries: { type: [ChampionEntrySchema], default: [] },
  },
  { timestamps: true }
);

export type ChampionDoc = mongoose.InferSchemaType<typeof ChampionSchema>;

export const ChampionModel: any =
  mongoose.models.Champion || mongoose.model("Champion", ChampionSchema);

export { ChampionSchema };

