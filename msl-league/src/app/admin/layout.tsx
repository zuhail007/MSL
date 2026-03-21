"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin";

  async function onLogout() {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/admin");
      router.refresh();
    }
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-3 order-2 lg:order-1">
        <div className="card p-3 sm:p-4 sticky top-4">
          <div className="text-xs sm:text-sm font-extrabold text-white">Admin Panel</div>
          <div className="mt-2 sm:mt-3 flex flex-col gap-1 sm:gap-2">
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10" href="/admin/dashboard">Dashboard</Link>
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10" href="/admin/teams">Teams</Link>
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10" href="/admin/fixtures">Fixtures</Link>
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10" href="/admin/champions">Champions</Link>
            <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10" href="/admin/settings">Settings</Link>
            <button
              type="button"
              onClick={onLogout}
              className="mt-1 sm:mt-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs sm:text-sm font-semibold text-red-200 transition hover:border-red-400/50"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
      <div className="lg:col-span-9 order-1 lg:order-2">{children}</div>
    </div>
  );
}

