import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
  >
    {label}
  </Link>
);

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

  return (
    <header className="mx-auto max-w-6xl px-4 pt-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-emerald-500/30 to-sky-500/20 shadow-glow">
            <span className="text-lg font-black tracking-tight">MSL</span>
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wide text-white">
              College League Football
            </div>
            <div className="text-xs text-white/60">MSL League • Sport. Pride. Fire.</div>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2">
            <NavLink href="/" label="MSL" />
            <NavLink href="/teams" label="Teams" />
            <NavLink href="/fixtures" label="Fixtures" />
            <NavLink href="/results" label="Results" />
            <NavLink href="/champions" label="Champions" />
            {isAdminLoggedIn ? (
              <NavLink href="/admin/dashboard" label="Admin" />
            ) : (
              <NavLink href="/admin" label="Admin Login" />
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

