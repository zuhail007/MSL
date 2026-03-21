"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AdminTeam = {
  _id: string;
  name: string;
  shortName: string;
  logoFileId: string | null;
  memberCount: number;
};

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.fileId as string;
}

export default function AdminTeamsClient({ initialTeams }: { initialTeams: AdminTeam[] }) {
  const [teams, setTeams] = useState<AdminTeam[]>(initialTeams);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const canCreate = useMemo(() => name.trim().length > 0, [name]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/teams", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setTeams(
          (data as any[]).map((t) => ({
            _id: t._id,
            name: t.name,
            shortName: t.shortName,
            logoFileId: t.logoFileId,
            memberCount: (t.members || []).length,
          }))
        );
      } catch {
        // ignore
      }
    })();
  }, []);

  async function refresh() {
    const res = await fetch("/api/admin/teams", { credentials: "include" });
    const data = await res.json();
    setTeams(
      (data as any[]).map((t) => ({
        _id: t._id,
        name: t.name,
        shortName: t.shortName,
        logoFileId: t.logoFileId,
        memberCount: (t.members || []).length,
      }))
    );
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setLoading(true);
    try {
      let logoFileId: string | null = null;
      if (logoFile) {
        logoFileId = await uploadImage(logoFile);
      }

      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), shortName: shortName.trim(), logoFileId }),
      });
      if (!res.ok) throw new Error("Create failed");

      setName("");
      setShortName("");
      setLogoFile(null);
      refresh();
    } catch (err: any) {
      alert(err?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(teamId: string) {
    if (!confirm("Delete this team? Fixtures will be removed too.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      await refresh();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-1 sm:gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Teams</h1>
          <div className="mt-1 text-xs sm:text-sm text-white/60">Add squads, upload logos, and manage members.</div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="text-base sm:text-lg font-black text-white">Create Team</h2>
        <form className="mt-3 sm:mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2" onSubmit={onCreate}>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Team Name</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eagles FC"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Short Name (optional)</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. EAG"
            />
          </label>

          <label className="block sm:col-span-2">
            <div className="mb-1 text-xs font-bold text-white/60">Logo (image)</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-white"
            />
          </label>

          <div className="sm:col-span-2">
            <button
              disabled={!canCreate || loading}
              className="w-full rounded-xl bg-emerald-500/20 px-4 py-2 text-xs sm:text-sm font-black text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
              type="submit"
            >
              {loading ? "Working..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {teams.length === 0 ? (
          <div className="card p-4 sm:p-6 text-xs sm:text-sm text-white/70">No teams yet.</div>
        ) : (
          teams.map((t) => (
            <div key={t._id} className="card p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:h-12 sm:w-12">
                  {t.logoFileId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/images/${t.logoFileId}`} alt={`${t.name} logo`} className="h-9 w-9 rounded-xl object-contain sm:h-10 sm:w-10" />
                  ) : (
                    <span className="text-xs font-black text-white/60">T</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm sm:text-base font-extrabold text-white">{t.name}</div>
                  <div className="text-xs text-white/60">{t.memberCount} members</div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                <Link
                  href={`/admin/teams/${t._id}`}
                  className="flex-1 sm:flex-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10 text-center sm:text-left"
                >
                  Manage
                </Link>
                <button
                  onClick={() => onDelete(t._id)}
                  disabled={loading}
                  className="flex-1 sm:flex-none rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs sm:text-sm font-semibold text-red-200 transition hover:border-red-400/50 disabled:opacity-60 text-center sm:text-left"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

