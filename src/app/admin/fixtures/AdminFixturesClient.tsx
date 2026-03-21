"use client";

import { useEffect, useState } from "react";

type TeamChoice = {
  _id: string;
  name: string;
  logoFileId: string | null;
};

type FixtureRow = {
  _id: string;
  scheduledAt: string | null;
  status: "scheduled" | "completed";
  homeTeam: { _id: string; name: string; logoFileId: string | null };
  awayTeam: { _id: string; name: string; logoFileId: string | null };
  homeScore: number | null;
  awayScore: number | null;
};

async function refreshFixtures(setFixtures: (v: FixtureRow[]) => void) {
  const res = await fetch("/api/admin/fixtures", { credentials: "include" });
  if (!res.ok) return;
  const data = await res.json();
  setFixtures(data as FixtureRow[]);
}

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminFixturesClient({ initialTeams }: { initialTeams: TeamChoice[] }) {
  const [fixtures, setFixtures] = useState<FixtureRow[]>([]);
  const [teams] = useState(initialTeams);

  // create form
  const [homeTeamId, setHomeTeamId] = useState(initialTeams[0]?._id || "");
  const [awayTeamId, setAwayTeamId] = useState(initialTeams[1]?._id || "");
  const [scheduledAt, setScheduledAt] = useState<string>(toLocalInputValue(new Date().toISOString()));
  const [status, setStatus] = useState<"scheduled" | "completed">("scheduled");
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const editingFixture = fixtures.find((f) => f._id === editingId) || null;
  const [editDraft, setEditDraft] = useState({
    homeTeamId: "",
    awayTeamId: "",
    scheduledAt: "",
    status: "scheduled" as "scheduled" | "completed",
    homeScore: "",
    awayScore: "",
  });

  useEffect(() => {
    refreshFixtures(setFixtures);
  }, []);

  function startEdit(f: FixtureRow) {
    setEditingId(f._id);
    setEditDraft({
      homeTeamId: f.homeTeam._id,
      awayTeamId: f.awayTeam._id,
      scheduledAt: toLocalInputValue(f.scheduledAt ? String(f.scheduledAt) : null),
      status: f.status,
      homeScore: f.homeScore != null ? String(f.homeScore) : "",
      awayScore: f.awayScore != null ? String(f.awayScore) : "",
    });
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: any = {
        homeTeamId,
        awayTeamId,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
        status,
      };
      if (status === "completed") {
        payload.homeScore = homeScore === "" ? null : Number(homeScore);
        payload.awayScore = awayScore === "" ? null : Number(awayScore);
      }

      const res = await fetch("/api/admin/fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create fixture");
      setHomeScore("");
      setAwayScore("");
      setStatus("scheduled");
      setEditingId(null);
      await refreshFixtures(setFixtures);
    } catch (err: any) {
      alert(err?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    try {
      const payload: any = {
        homeTeamId: editDraft.homeTeamId,
        awayTeamId: editDraft.awayTeamId,
        scheduledAt: editDraft.scheduledAt ? new Date(editDraft.scheduledAt).toISOString() : new Date().toISOString(),
        status: editDraft.status,
      };
      if (editDraft.status === "completed") {
        payload.homeScore = editDraft.homeScore === "" ? null : Number(editDraft.homeScore);
        payload.awayScore = editDraft.awayScore === "" ? null : Number(editDraft.awayScore);
      } else {
        payload.homeScore = null;
        payload.awayScore = null;
      }

      const res = await fetch(`/api/admin/fixtures/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update fixture");
      setEditingId(null);
      await refreshFixtures(setFixtures);
    } catch (err: any) {
      alert(err?.message || "Update failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this fixture?")) return;
    try {
      const res = await fetch(`/api/admin/fixtures/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      await refreshFixtures(setFixtures);
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  }

  return (
    <section className="space-y-6">
      <div className="card p-5">
        <h1 className="text-2xl font-black tracking-tight text-white">Fixtures / Results</h1>
        <div className="mt-2 text-sm text-white/60">Add matches, set scores, and the league table updates from completed fixtures.</div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-black text-white">Create Fixture</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onCreate}>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Home Team</div>
            <select
              value={homeTeamId}
              onChange={(e) => setHomeTeamId(e.target.value)}
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
            <div className="mb-1 text-xs font-bold text-white/60">Away Team</div>
            <select
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <div className="mb-1 text-xs font-bold text-white/60">Scheduled Time</div>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          {status === "completed" ? (
            <>
              <label className="block">
                <div className="mb-1 text-xs font-bold text-white/60">Home Score</div>
                <input
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs font-bold text-white/60">Away Score</div>
                <input
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </label>
            </>
          ) : (
            <div className="text-sm text-white/60 md:col-span-2">
              Mark as <b>Completed</b> to enter final scores.
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-xl bg-sky-500/20 px-4 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-500/30 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Fixture"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-black text-white">Matches</h2>
        {fixtures.length === 0 ? (
          <div className="card p-6 text-sm text-white/70">No fixtures yet.</div>
        ) : (
          fixtures
            .slice()
            .sort((a, b) => (String(a.scheduledAt || "")).localeCompare(String(b.scheduledAt || "")))
            .reverse()
            .map((f) => (
              <div key={f._id} className="card p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex flex-col">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/55">
                        {f.status === "completed" ? "FINAL" : "MATCHDAY"}
                      </div>
                      <div className="mt-1 text-base font-extrabold text-white truncate">
                        {f.homeTeam.name} vs {f.awayTeam.name}
                      </div>
                      <div className="text-xs text-white/60">{f.scheduledAt ? new Date(f.scheduledAt).toLocaleString() : "TBD"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {f.status === "completed" ? (
                      <div className="text-xl font-black text-emerald-300">
                        {f.homeScore ?? 0} : {f.awayScore ?? 0}
                      </div>
                    ) : (
                      <div className="text-sm text-white/60">Scores pending</div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(f)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(f._id)}
                        className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-400/50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {editingId === f._id ? (
                  <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSaveEdit}>
                    <label className="block">
                      <div className="mb-1 text-xs font-bold text-white/60">Home Team</div>
                      <select
                        value={editDraft.homeTeamId}
                        onChange={(e) => setEditDraft((s) => ({ ...s, homeTeamId: e.target.value }))}
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
                      <div className="mb-1 text-xs font-bold text-white/60">Away Team</div>
                      <select
                        value={editDraft.awayTeamId}
                        onChange={(e) => setEditDraft((s) => ({ ...s, awayTeamId: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      >
                        {teams.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block md:col-span-2">
                      <div className="mb-1 text-xs font-bold text-white/60">Scheduled Time</div>
                      <input
                        type="datetime-local"
                        value={editDraft.scheduledAt}
                        onChange={(e) => setEditDraft((s) => ({ ...s, scheduledAt: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block">
                      <div className="mb-1 text-xs font-bold text-white/60">Status</div>
                      <select
                        value={editDraft.status}
                        onChange={(e) => setEditDraft((s) => ({ ...s, status: e.target.value as any }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </label>
                    {editDraft.status === "completed" ? (
                      <>
                        <label className="block">
                          <div className="mb-1 text-xs font-bold text-white/60">Home Score</div>
                          <input
                            type="number"
                            value={editDraft.homeScore}
                            onChange={(e) => setEditDraft((s) => ({ ...s, homeScore: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                          />
                        </label>
                        <label className="block">
                          <div className="mb-1 text-xs font-bold text-white/60">Away Score</div>
                          <input
                            type="number"
                            value={editDraft.awayScore}
                            onChange={(e) => setEditDraft((s) => ({ ...s, awayScore: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                          />
                        </label>
                      </>
                    ) : (
                      <div className="text-sm text-white/60 md:col-span-2">
                        Mark as <b>Completed</b> to enter scores.
                      </div>
                    )}
                    <div className="md:col-span-2 flex gap-2">
                      <button type="submit" className="flex-1 rounded-xl bg-sky-500/20 px-4 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-500/30">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/90 transition hover:border-white/20 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            ))
        )}
      </div>
    </section>
  );
}

