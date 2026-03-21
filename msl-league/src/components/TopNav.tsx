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
    <header className="mx-auto max-w-6xl px-4 pt-4 sm:pt-6">
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur sm:gap-4 sm:p-4">
        <div className="flex items-center gap-2 min-w-0 sm:gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-emerald-500/30 to-sky-500/20 shadow-glow sm:h-11 sm:w-11">
            <span className="text-base font-black tracking-tight sm:text-lg">MSL</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold tracking-wide text-white sm:text-base">
              College League Football
            </div>
            <div className="truncate text-xs text-white/60">MSL League • Sport. Pride. Fire.</div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex md:gap-2">
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

