"use client";

import { useEffect, useState } from "react";

type TeamChoice = {
  _id: string;
  name: string;
  logoFileId: string | null;
};

type KnockoutRow = {
  _id: string;
  round: string;
  scheduledAt: string | null;
  status: "scheduled" | "completed";
  homeTeam: { _id: string; name: string; logoFileId: string | null };
  awayTeam: { _id: string; name: string; logoFileId: string | null };
  homeScore: number | null;
  awayScore: number | null;
};

const ROUNDS = ["Quarter-Final", "Semi-Final", "Final"];

async function refreshKnockouts(setKnockouts: (v: KnockoutRow[]) => void) {
  const res = await fetch("/api/admin/knockout", { credentials: "include" });
  if (!res.ok) return;
  const data = await res.json();
  setKnockouts(data as KnockoutRow[]);
}

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function AdminKnockoutClient({
  initialTeams,
}: {
  initialTeams: TeamChoice[];
}) {
  const [knockouts, setKnockouts] = useState<KnockoutRow[]>([]);
  const [teams] = useState(initialTeams);

  const [round, setRound] = useState(ROUNDS[0]);
  const [homeTeamId, setHomeTeamId] = useState(initialTeams[0]?._id || "");
  const [awayTeamId, setAwayTeamId] = useState(initialTeams[1]?._id || "");
  const [scheduledAt, setScheduledAt] = useState<string>(
    toLocalInputValue(new Date().toISOString())
  );
  const [status, setStatus] = useState<"scheduled" | "completed">("scheduled");
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({
    round: "",
    homeTeamId: "",
    awayTeamId: "",
    scheduledAt: "",
    status: "scheduled" as "scheduled" | "completed",
    homeScore: "",
    awayScore: "",
  });

  useEffect(() => {
    refreshKnockouts(setKnockouts);
  }, []);

  function startEdit(k: KnockoutRow) {
    setEditingId(k._id);
    setEditDraft({
      round: k.round,
      homeTeamId: k.homeTeam._id,
      awayTeamId: k.awayTeam._id,
      scheduledAt: toLocalInputValue(k.scheduledAt ? String(k.scheduledAt) : null),
      status: k.status,
      homeScore: k.homeScore != null ? String(k.homeScore) : "",
      awayScore: k.awayScore != null ? String(k.awayScore) : "",
    });
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: any = {
        round,
        homeTeamId,
        awayTeamId,
        scheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : new Date().toISOString(),
        status,
      };
      if (status === "completed") {
        payload.homeScore = homeScore === "" ? null : Number(homeScore);
        payload.awayScore = awayScore === "" ? null : Number(awayScore);
      }

      const res = await fetch("/api/admin/knockout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create knockout match");
      setRound(ROUNDS[0]);
      setHomeScore("");
      setAwayScore("");
      setStatus("scheduled");
      setEditingId(null);
      await refreshKnockouts(setKnockouts);
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
        round: editDraft.round,
        homeTeamId: editDraft.homeTeamId,
        awayTeamId: editDraft.awayTeamId,
        scheduledAt: editDraft.scheduledAt
          ? new Date(editDraft.scheduledAt).toISOString()
          : new Date().toISOString(),
        status: editDraft.status,
      };
      if (editDraft.status === "completed") {
        payload.homeScore =
          editDraft.homeScore === "" ? null : Number(editDraft.homeScore);
        payload.awayScore =
          editDraft.awayScore === "" ? null : Number(editDraft.awayScore);
      } else {
        payload.homeScore = null;
        payload.awayScore = null;
      }

      const res = await fetch(`/api/admin/knockout/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update knockout match");
      setEditingId(null);
      await refreshKnockouts(setKnockouts);
    } catch (err: any) {
      alert(err?.message || "Update failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this knockout match?")) return;
    try {
      const res = await fetch(`/api/admin/knockout/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      await refreshKnockouts(setKnockouts);
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  }

  function onCancelEdit() {
    setEditingId(null);
    setEditDraft({
      round: "",
      homeTeamId: "",
      awayTeamId: "",
      scheduledAt: "",
      status: "scheduled",
      homeScore: "",
      awayScore: "",
    });
  }

  // Group knockouts by round
  const byRound = new Map<string, KnockoutRow[]>();
  for (const k of knockouts) {
    if (!byRound.has(k.round)) byRound.set(k.round, []);
    byRound.get(k.round)!.push(k);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
        Knockout Bracket Management
      </h1>

      {/* Create Form */}
      {editingId === null && (
        <form onSubmit={onCreate} className="card p-6 space-y-4">
          <h2 className="text-lg font-black text-white">Add Knockout Match</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Round
              </label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              >
                {ROUNDS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "scheduled" | "completed")
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Home Team
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              >
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Away Team
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              >
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              />
            </div>

            {status === "completed" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Home Score
                  </label>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    min="0"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Away Score
                  </label>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    min="0"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Match"}
            </button>
          </div>
        </form>
      )}

      {/* Edit Form */}
      {editingId !== null && (
        <form onSubmit={onSaveEdit} className="card p-6 space-y-4 border-l-4 border-yellow-500">
          <h2 className="text-lg font-black text-white">Edit Knockout Match</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Round
              </label>
              <select
                value={editDraft.round}
                onChange={(e) =>
                  setEditDraft({ ...editDraft, round: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              >
                {ROUNDS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Status
              </label>
              <select
                value={editDraft.status}
                onChange={(e) =>
                  setEditDraft({
                    ...editDraft,
                    status: e.target.value as "scheduled" | "completed",
                  })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Home Team
              </label>
              <select
                value={editDraft.homeTeamId}
                onChange={(e) =>
                  setEditDraft({ ...editDraft, homeTeamId: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              >
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Away Team
              </label>
              <select
                value={editDraft.awayTeamId}
                onChange={(e) =>
                  setEditDraft({ ...editDraft, awayTeamId: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              >
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={editDraft.scheduledAt}
                onChange={(e) =>
                  setEditDraft({ ...editDraft, scheduledAt: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              />
            </div>

            {editDraft.status === "completed" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Home Score
                  </label>
                  <input
                    type="number"
                    value={editDraft.homeScore}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, homeScore: e.target.value })
                    }
                    min="0"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Away Score
                  </label>
                  <input
                    type="number"
                    value={editDraft.awayScore}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, awayScore: e.target.value })
                    }
                    min="0"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Knockouts List */}
      <div className="space-y-6">
        {knockouts.length === 0 ? (
          <div className="card p-6 text-center text-sm text-white/60">
            No knockout matches yet.
          </div>
        ) : (
          ROUNDS.map((roundName) => {
            const roundMatches = byRound.get(roundName) || [];
            if (roundMatches.length === 0) return null;

            return (
              <div key={roundName} className="card p-6 space-y-4">
                <h3 className="text-lg font-black text-white">{roundName}</h3>
                <div className="space-y-3">
                  {roundMatches.map((k) => (
                    <div
                      key={k._id}
                      className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-extrabold text-white truncate">
                            {k.homeTeam.name} vs {k.awayTeam.name}
                          </div>
                          <div className="text-sm font-black text-emerald-300 flex-shrink-0">
                            {k.status === "completed"
                              ? `${k.homeScore} : ${k.awayScore}`
                              : "Not Played"}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          {new Date(k.scheduledAt || "").toLocaleDateString()} |{" "}
                          {k.status}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => startEdit(k)}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(k._id)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
