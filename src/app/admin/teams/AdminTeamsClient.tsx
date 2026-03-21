"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AdminTeam = {
  _id: string;
  name: string;
  shortName: string;
  logoFileId: string | null;
  group: string;
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
  const [teams, setTeams] = useState<AdminTeam[]>(initialTeams.map(t => ({ ...t, group: t.group || "A" })));
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [group, setGroup] = useState("A");
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
            group: t.group || "A",
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
        group: t.group || "A",
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
        body: JSON.stringify({ name: name.trim(), shortName: shortName.trim(), logoFileId, group }),
      });
      if (!res.ok) throw new Error("Create failed");

      setName("");
      setShortName("");
      setGroup("A");
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
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Teams</h1>
          <div className="mt-1 text-sm text-white/60">Add squads, upload logos, and manage members.</div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-black text-white">Create Team</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onCreate}>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Team Name</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eagles FC"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Short Name (optional)</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. EAG"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Group</div>
            <select
              className="w-full rounded-xl border border-orange-400/60 bg-orange-900/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/80"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="A">Group A</option>
              <option value="B">Group B</option>
              <option value="C">Group C</option>
              <option value="D">Group D</option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <div className="mb-1 text-xs font-bold text-white/60">Logo (image)</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>

          <div className="md:col-span-2">
            <button
              disabled={!canCreate || loading}
              className="w-full rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
              type="submit"
            >
              {loading ? "Working..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {teams.length === 0 ? (
          <div className="card p-6 text-sm text-white/70">No teams yet.</div>
        ) : (
          teams.map((t) => (
            <div key={t._id} className="card p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  {t.logoFileId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/images/${t.logoFileId}`} alt={`${t.name} logo`} className="h-10 w-10 rounded-xl object-contain" />
                  ) : (
                    <span className="text-xs font-black text-white/60">T</span>
                  )}
                </div>
                <div>
                  <div className="text-base font-extrabold text-white">{t.name}</div>
                  <div className="text-xs text-white/60">{t.memberCount} members</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/teams/${t._id}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
                >
                  Manage
                </Link>
                <button
                  onClick={() => onDelete(t._id)}
                  disabled={loading}
                  className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:border-red-400/50 disabled:opacity-60"
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

