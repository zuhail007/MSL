import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "msl_admin";

export type AdminTokenPayload = {
  sub: string; // admin user id
  username: string;
  iat?: number;
  exp?: number;
};

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("Missing environment variable ADMIN_JWT_SECRET");
  return secret;
}

export function signAdminToken(payload: Pick<AdminTokenPayload, "sub" | "username">) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "14d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
}

export async function getAdminTokenFromCookies() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!cookie) return null;
  return cookie;
}

