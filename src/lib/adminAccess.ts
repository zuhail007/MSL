import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "./auth";

export async function getJwtFromRequestCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value || null;
}

export async function requireAdminToken() {
  const token = await getJwtFromRequestCookies();
  if (!token) {
    throw new Error("Unauthorized: missing admin session");
  }
  return verifyAdminToken(token);
}

