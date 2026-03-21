import mongoose from "mongoose";

export type TeamMemberRole = "owner" | "keyplayer" | "player";

export type TeamMember = {
  _id: mongoose.Types.ObjectId;
  name: string;
  position: string;
  role: TeamMemberRole;
  photoFileId?: mongoose.Types.ObjectId | null;
};

export type TeamDoc = mongoose.InferSchemaType<typeof TeamSchema>;

const TeamMemberSchema = new mongoose.Schema<TeamMember>(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["owner", "keyplayer", "player"],
    },
    photoFileId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: true }
);

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true, default: "" },
    logoFileId: { type: mongoose.Schema.Types.ObjectId, default: null },
    members: { type: [TeamMemberSchema], default: [] },
  },
  { timestamps: true }
);

export const TeamModel: any =
  mongoose.models.Team || mongoose.model("Team", TeamSchema);

export { TeamSchema };

