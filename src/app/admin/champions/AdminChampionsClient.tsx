"use client";

import { useEffect, useMemo, useState } from "react";

type TeamChoice = { _id: string; name: string; logoFileId: string | null };
type ChampionEntry = { teamId: string; photoFileId: string | null };

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.fileId as string;
}

async function loadChampions(): Promise<ChampionEntry[]> {
  const res = await fetch("/api/admin/champions", { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.entries || []).map((e: any) => ({
    teamId: String(e.teamId),
    photoFileId: e.photoFileId ? String(e.photoFileId) : null,
  }));
}

async function saveChampions(entries: ChampionEntry[]) {
  const res = await fetch("/api/admin/champions", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ entries: entries.map((e) => ({ ...e })) }),
  });
  if (!res.ok) throw new Error("Failed to update champions");
}

export default function AdminChampionsClient({ initialTeams }: { initialTeams: TeamChoice[] }) {
  const [teams] = useState(initialTeams);
  const [entries, setEntries] = useState<ChampionEntry[]>([]);

  const [teamId, setTeamId] = useState(initialTeams[0]?._id || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);

  const [pendingPhotoByTeam, setPendingPhotoByTeam] = useState<Record<string, File | null>>({});

  useEffect(() => {
    (async () => {
      const loaded = await loadChampions();
      setEntries(loaded);
      if (!loaded.some((e) => e.teamId === teamId) && initialTeams[0]?._id) setTeamId(initialTeams[0]._id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teamById = useMemo(() => new Map(teams.map((t) => [t._id, t] as const)), [teams]);

  async function onAddChampion(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    if (!photoFile) {
      alert("Please upload a champion photo first.");
      return;
    }
    setAdding(true);
    try {
      const photoFileId = await uploadImage(photoFile);
      const next = entries.slice();
      const idx = next.findIndex((x) => x.teamId === teamId);
      if (idx >= 0) next[idx] = { teamId, photoFileId };
      else next.push({ teamId, photoFileId });
      await saveChampions(next);
      setEntries(next);
      setPhotoFile(null);
    } catch (err: any) {
      alert(err?.message || "Failed to add champion");
    } finally {
      setAdding(false);
    }
  }

  async function onDeleteEntry(tid: string) {
    if (!confirm("Remove this champion entry?")) return;
    const next = entries.filter((e) => e.teamId !== tid);
    try {
      await saveChampions(next);
      setEntries(next);
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  }

  async function onUpdatePhoto(tid: string) {
    const file = pendingPhotoByTeam[tid];
    if (!file) return;
    try {
      const photoFileId = await uploadImage(file);
      const next = entries.map((e) => (e.teamId === tid ? { ...e, photoFileId } : e));
      await saveChampions(next);
      setEntries(next);
      setPendingPhotoByTeam((s) => ({ ...s, [tid]: null }));
    } catch (err: any) {
      alert(err?.message || "Photo update failed");
    }
  }

  return (
    <section className="space-y-6">
      <div className="card p-5">
        <h1 className="text-2xl font-black tracking-tight text-white">Champions</h1>
        <div className="mt-2 text-sm text-white/60">Upload champion team photos and set who won.</div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-black text-white">Add / Replace Champion</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onAddChampion}>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Team</div>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Champion Photo</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>
          <div className="md:col-span-2">
            <button
              disabled={adding}
              type="submit"
              className="w-full rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
            >
              {adding ? "Updating..." : "Set Champion Photo"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-black text-white">Current Champions</h2>
        {entries.length === 0 ? (
          <div className="card p-6 text-sm text-white/70">No champions set yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((e) => {
              const team = teamById.get(e.teamId);
              const photoUrl = e.photoFileId ? `/api/images/${e.photoFileId}` : null;
              const logoUrl = team?.logoFileId ? `/api/images/${team.logoFileId}` : null;
              return (
                <div key={e.teamId} className="card overflow-hidden">
                  <div className="relative h-44 bg-white/5">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="Champion" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/60">No photo</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logoUrl} alt={team?.name || "Team"} className="h-10 w-10 rounded-xl object-contain" />
                        ) : (
                          <span className="text-xs font-black text-white/60">T</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-extrabold text-white">{team?.name || "Unknown"}</div>
                        <div className="text-xs text-white/60">Champion</div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="block">
                        <div className="mb-1 text-xs font-bold text-white/60">Update Photo</div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(ev) =>
                            setPendingPhotoByTeam((s) => ({ ...s, [e.teamId]: ev.target.files?.[0] || null }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdatePhoto(e.teamId)}
                          className="flex-1 rounded-xl bg-sky-500/20 px-3 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-500/30 disabled:opacity-60"
                          disabled={!pendingPhotoByTeam[e.teamId]}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEntry(e.teamId)}
                          className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-black text-red-200 transition hover:border-red-400/50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

