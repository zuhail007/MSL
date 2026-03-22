"use client";

import { useEffect, useState, useMemo } from "react";

type AdminTeam = {
  _id: string;
  name: string;
  shortName: string;
  logoFileId: string | null;
  group: string;
  memberCount: number;
};

const GROUP_OPTIONS = ["A", "B", "C", "D"];

export default function AdminGroupsClient({ initialTeams }: { initialTeams: AdminTeam[] }) {
  const [teams, setTeams] = useState<AdminTeam[]>(initialTeams);
  const [loading, setLoading] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ name?: string; shortName?: string; group?: string }>({});

  const groupedTeams = useMemo(() => {
    const grouped: { [key: string]: AdminTeam[] } = {};
    GROUP_OPTIONS.forEach((g) => (grouped[g] = []));
    teams.forEach((t) => {
      const group = t.group || "A";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(t);
    });
    return grouped;
  }, [teams]);

  useEffect(() => {
    refreshTeams();
  }, []);

  async function refreshTeams() {
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
      alert("Failed to load teams");
    }
  }

  async function onEdit(teamId: string, field: string, value: string) {
    setEditingTeamId(teamId);
    setEditingData({ [field]: value });
  }

  async function onSave(teamId: string) {
    if (Object.keys(editingData).length === 0) {
      setEditingTeamId(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingData),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingTeamId(null);
      setEditingData({});
      await refreshTeams();
    } catch (err: any) {
      alert(err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(teamId: string, teamName: string) {
    if (!confirm(`Delete "${teamName}" and all associated fixtures?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      await refreshTeams();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Groups</h1>
        <div className="mt-1 text-sm text-white/60">Manage teams by group, edit details, or remove teams.</div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {GROUP_OPTIONS.map((group) => (
          <div key={group} className="card p-5">
            <h2 className="text-lg font-bold text-white">Group {group}</h2>
            <div className="mt-4 space-y-2">
              {groupedTeams[group].length === 0 ? (
                <div className="text-xs text-white/40">No teams assigned</div>
              ) : (
                groupedTeams[group].map((team) => (
                  <div
                    key={team._id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {team.logoFileId ? (
                        <img src={`/api/images/${team.logoFileId}`} alt={team.name} className="h-8 w-8 rounded-lg flex-shrink-0 object-contain" />
                      ) : (
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[8px] font-black text-white/60">
                          T
                        </span>
                      )}
                      <div className="min-w-0">
                        {editingTeamId === team._id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingData.name || team.name}
                              onChange={(e) => setEditingData((p) => ({ ...p, name: e.target.value }))}
                              placeholder="Team name"
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/20"
                            />
                            <select
                              value={editingData.group || team.group}
                              onChange={(e) => setEditingData((p) => ({ ...p, group: e.target.value }))}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-white/20"
                            >
                              {GROUP_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  Group {g}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-white text-sm truncate">{team.name}</div>
                            <div className="text-xs text-white/40">{team.memberCount} members</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingTeamId === team._id ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => onSave(team._id)}
                          disabled={loading}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingTeamId(null);
                            setEditingData({});
                          }}
                          disabled={loading}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 text-xs font-bold disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingTeamId(team._id);
                            setEditingData({ name: team.name, group: team.group });
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(team._id, team.name)}
                          className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
