import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongoose";
import { AdminUserModel } from "@/models/AdminUser";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

async function ensureSeedAdmin() {
  const existing = await AdminUserModel.findOne();
  if (existing) return;

  const seedUsername = process.env.ADMIN_SEED_USERNAME;
  const seedPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!seedUsername || !seedPassword) return;

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  await AdminUserModel.create({ username: seedUsername, passwordHash });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  await ensureSeedAdmin();

  const { username, password } = parsed.data;
  const admin = await AdminUserModel.findOne({ username }).lean();
  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAdminToken({ sub: String(admin._id), username });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 14 * 24 * 60 * 60,
  });
  return res;
}

