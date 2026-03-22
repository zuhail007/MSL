import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import TopNavClient from "./TopNavClient";

export async function TopNav() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  let isAdminLoggedIn = false;
  if (token) {
    try {
      verifyAdminToken(token);
      isAdminLoggedIn = true;
    } catch {
      isAdminLoggedIn = false;
    }
  }

  return <TopNavClient isAdminLoggedIn={isAdminLoggedIn} />;
}

