"use client";

import Link from "next/link";
import { useState } from "react";

type TopNavClientProps = {
  isAdminLoggedIn: boolean;
};

const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
  <Link
    href={href}
    onClick={onClick}
    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
  >
    {label}
  </Link>
);

export default function TopNavClient({ isAdminLoggedIn }: TopNavClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminHref = isAdminLoggedIn ? "/admin/dashboard" : "/admin";
  const adminLabel = isAdminLoggedIn ? "Admin" : "Admin Login";

  return (
    <header className="mx-auto max-w-6xl px-4 pt-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-orange-500/30 to-orange-700/30 shadow-glow">
              <span className="text-lg font-black tracking-tight">MSL</span>
            </div>
            <div className="min-w-0">
              <div className="text-base font-extrabold tracking-wide text-white truncate">College League Football</div>
              <div className="text-xs text-white/60 truncate">MSL League • Sport. Pride. Fire.</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2">
              <NavLink href="/" label="MSL" />
              <NavLink href="/teams" label="Teams" />
              <NavLink href="/group" label="Groups" />
              <NavLink href="/fixtures" label="Fixtures" />
              <NavLink href="/results" label="Results" />
              <NavLink href="/knockout" label="Knockout" />
              <NavLink href="/champions" label="Champions" />
              <NavLink href={adminHref} label={adminLabel} />
            </div>
          </nav>
        </div>

        {mobileOpen && (
          <nav className="mt-4 grid gap-2 md:hidden">
            <NavLink href="/" label="MSL" onClick={() => setMobileOpen(false)} />
            <NavLink href="/teams" label="Teams" onClick={() => setMobileOpen(false)} />
            <NavLink href="/group" label="Groups" onClick={() => setMobileOpen(false)} />
            <NavLink href="/fixtures" label="Fixtures" onClick={() => setMobileOpen(false)} />
            <NavLink href="/results" label="Results" onClick={() => setMobileOpen(false)} />
            <NavLink href="/knockout" label="Knockout" onClick={() => setMobileOpen(false)} />
            <NavLink href="/champions" label="Champions" onClick={() => setMobileOpen(false)} />
            <NavLink href={adminHref} label={adminLabel} onClick={() => setMobileOpen(false)} />
          </nav>
        )}
      </div>
    </header>
  );
}
