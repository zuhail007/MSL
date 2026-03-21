import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export type AdminUserDoc = mongoose.InferSchemaType<typeof AdminUserSchema>;

export const AdminUserModel: any =
  mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

