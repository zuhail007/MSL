import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export async function RequireAdmin() {
  const cookieStore = await cookies();

  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/admin");
  }

  try {
    verifyAdminToken(token);
  } catch (err) {
    redirect("/admin");
  }
}
