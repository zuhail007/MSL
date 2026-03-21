"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-5">
      <div className="card p-6">
        <h1 className="text-2xl font-black text-white">Admin Login</h1>
        <p className="mt-1 text-sm text-white/70">Update teams, fixtures, results, champions and settings.</p>
        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Username</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Password</div>
            <input
              type="password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-200">{error}</div> : null}
          <button
            className="w-full rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
      <div className="text-center text-xs text-white/50">
        Default admin is seeded using env vars on first run.
      </div>
    </section>
  );
}

