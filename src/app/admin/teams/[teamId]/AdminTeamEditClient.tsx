"use client";

import { useMemo, useState } from "react";

type TeamMemberRole = "owner" | "keyplayer" | "player";

type Member = {
  _id: string;
  name: string;
  position: string;
  role: TeamMemberRole;
  photoFileId: string | null;
};

type TeamInitial = {
  _id: string;
  name: string;
  shortName: string;
  logoFileId: string | null;
  members: Member[];
};

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.fileId as string;
}

export default function AdminTeamEditClient({ initialTeam }: { initialTeam: TeamInitial }) {
  const [teamId] = useState(initialTeam._id);
  const [name, setName] = useState(initialTeam.name);
  const [shortName, setShortName] = useState(initialTeam.shortName);
  const [logoFileId, setLogoFileId] = useState<string | null>(initialTeam.logoFileId);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savingTeam, setSavingTeam] = useState(false);

  const [members, setMembers] = useState<Member[]>(initialTeam.members);
  const [memberForm, setMemberForm] = useState({
    name: "",
    position: "",
    role: "player" as TeamMemberRole,
    photoFile: null as File | null,
  });
  const [addingMember, setAddingMember] = useState(false);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const editingMember = useMemo(
    () => members.find((m) => m._id === editingMemberId) || null,
    [editingMemberId, members]
  );
  const [editForm, setEditForm] = useState({
    name: "",
    position: "",
    role: "player" as TeamMemberRole,
    photoFile: null as File | null,
  });

  function startEdit(member: Member) {
    setEditingMemberId(member._id);
    setEditForm({
      name: member.name,
      position: member.position,
      role: member.role,
      photoFile: null,
    });
  }

  async function refreshMembers() {
    const res = await fetch("/api/admin/teams", { credentials: "include" });
    if (!res.ok) return;
    const allTeams = await res.json();
    const team = allTeams.find((t: any) => t._id === teamId);
    if (!team) return;
    setMembers(
      (team.members || []).map((m: any) => ({
        _id: String(m._id),
        name: m.name,
        position: m.position,
        role: m.role,
        photoFileId: m.photoFileId ? String(m.photoFileId) : null,
      }))
    );
  }

  async function onSaveTeam(e: React.FormEvent) {
    e.preventDefault();
    setSavingTeam(true);
    try {
      const payload: any = { name: name.trim(), shortName: shortName.trim() };
      if (logoFile) {
        const newLogoFileId = await uploadImage(logoFile);
        payload.logoFileId = newLogoFileId;
      }
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update team");
      const updated = await res.json();
      setLogoFileId(updated.logoFileId);
      setLogoFile(null);
      setSavingTeam(false);
    } catch (err: any) {
      alert(err?.message || "Update failed");
      setSavingTeam(false);
    }
  }

  async function onAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (memberForm.name.trim().length < 1) return;
    if (memberForm.role !== "owner" && memberForm.position.trim().length < 1) return;
    setAddingMember(true);
    try {
      let photoFileId: string | null = null;
      if (memberForm.photoFile) {
        photoFileId = await uploadImage(memberForm.photoFile);
      }

      const res = await fetch(`/api/admin/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: memberForm.name.trim(),
          position: memberForm.role === "owner" ? "Owner" : memberForm.position.trim(),
          role: memberForm.role,
          photoFileId,
        }),
      });
      if (!res.ok) throw new Error("Failed to add member");

      setMemberForm({ name: "", position: "", role: "player", photoFile: null });
      await refreshMembers();
    } catch (err: any) {
      alert(err?.message || "Add member failed");
    } finally {
      setAddingMember(false);
    }
  }

  async function onSaveMember(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember) return;

    setAddingMember(true);
    try {
      const payload: any = {
        name: editForm.name.trim(),
        position: editForm.position.trim(),
        role: editForm.role,
      };
      if (editForm.photoFile) {
        const nextPhotoFileId = await uploadImage(editForm.photoFile);
        payload.photoFileId = nextPhotoFileId;
      }

      const res = await fetch(`/api/admin/teams/${teamId}/members/${editingMember._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update member");

      setEditingMemberId(null);
      await refreshMembers();
    } catch (err: any) {
      alert(err?.message || "Update member failed");
    } finally {
      setAddingMember(false);
    }
  }

  async function onDeleteMember(memberId: string) {
    if (!confirm("Delete this member?")) return;
    setAddingMember(true);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete member");
      await refreshMembers();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    } finally {
      setAddingMember(false);
    }
  }

  const owner = members.find((m) => m.role === "owner") || null;
  const keyplayer = members.find((m) => m.role === "keyplayer") || null;

  return (
    <section className="space-y-6">
      <div className="card p-5">
        <h1 className="text-2xl font-black tracking-tight text-white">Manage Team</h1>
        <div className="mt-2 text-sm text-white/60">Edit logo, roster, and roles (Owner/Key Player/Player).</div>
      </div>

      <form className="card p-5 space-y-4" onSubmit={onSaveTeam}>
        <h2 className="text-lg font-black text-white">Team Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Team Name</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-bold text-white/60">Short Name</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
            />
          </label>
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                {logoFileId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/images/${logoFileId}`} alt="Logo" className="h-14 w-14 rounded-xl object-contain" />
                ) : (
                  <span className="text-xs font-black text-white/60">LOGO</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block">
                  <div className="mb-1 text-xs font-bold text-white/60">Upload New Logo</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                </label>
              </div>
            </div>
            <div className="mt-2 text-xs text-white/50">Leave empty to keep the current logo.</div>
          </div>
        </div>
        <div>
          <button
            disabled={savingTeam}
            type="submit"
            className="w-full rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
          >
            {savingTeam ? "Saving..." : "Save Team"}
          </button>
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-black text-white">Roster</h2>
          <div className="mt-1 text-sm text-white/60">Owner and Key Player are highlighted.</div>

          <div className="mt-4 space-y-3">
            {members.length === 0 ? (
              <div className="text-sm text-white/60">No members yet.</div>
            ) : (
              members.map((m) => (
                <div key={m._id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      {m.photoFileId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/images/${m.photoFileId}`} alt={m.name} className="h-10 w-10 rounded-xl object-contain" />
                      ) : (
                        <span className="text-xs font-black text-white/60">#</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-white">{m.name}</div>
                      <div className="text-xs text-white/60">{m.position}</div>
                      <div className="mt-1">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-white/70">
                          {m.role === "owner" ? "OWNER" : m.role === "keyplayer" ? "KEY PLAYER" : "PLAYER"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMember(m._id)}
                      className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-400/50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-black text-white">Add Team Details</h2>
            <div className="mt-1 text-sm text-white/60">
              Add Owner, Key Player, or Players with photo and position.
            </div>
            <form className="mt-4 space-y-3" onSubmit={onAddMember}>
              <div>
                <div className="mb-2 text-xs font-bold text-white/60">Type</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMemberForm((s) => ({ ...s, role: "owner" }))}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      memberForm.role === "owner"
                        ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-200"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/20"
                    }`}
                  >
                    Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberForm((s) => ({ ...s, role: "keyplayer" }))}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      memberForm.role === "keyplayer"
                        ? "border-sky-300/60 bg-sky-500/20 text-sky-200"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/20"
                    }`}
                  >
                    Key Player
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberForm((s) => ({ ...s, role: "player" }))}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      memberForm.role === "player"
                        ? "border-white/30 bg-white/15 text-white"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/20"
                    }`}
                  >
                    Player
                  </button>
                </div>
              </div>
              <label className="block">
                <div className="mb-1 text-xs font-bold text-white/60">
                  {memberForm.role === "owner"
                    ? "Owner Name"
                    : memberForm.role === "keyplayer"
                    ? "Key Player Name"
                    : "Player Name"}
                </div>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm((s) => ({ ...s, name: e.target.value }))}
                />
              </label>
              {memberForm.role !== "owner" ? (
                <label className="block">
                  <div className="mb-1 text-xs font-bold text-white/60">Position</div>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={memberForm.position}
                    onChange={(e) => setMemberForm((s) => ({ ...s, position: e.target.value }))}
                    placeholder={memberForm.role === "keyplayer" ? "e.g. Midfielder" : "e.g. Defender"}
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                  Owner position will be set automatically.
                </div>
              )}
              <label className="block">
                <div className="mb-1 text-xs font-bold text-white/60">
                  {memberForm.role === "owner"
                    ? "Owner Photo"
                    : memberForm.role === "keyplayer"
                    ? "Key Player Photo"
                    : "Player Photo"}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMemberForm((s) => ({ ...s, photoFile: e.target.files?.[0] || null }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </label>
              <button
                disabled={addingMember}
                type="submit"
                className="w-full rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
              >
                {addingMember
                  ? "Adding..."
                  : memberForm.role === "owner"
                  ? "Add Owner"
                  : memberForm.role === "keyplayer"
                  ? "Add Key Player"
                  : "Add Player"}
              </button>
            </form>
          </div>

          {editingMember ? (
            <div className="card p-5">
              <h2 className="text-lg font-black text-white">Edit Member</h2>
              <form className="mt-4 space-y-3" onSubmit={onSaveMember}>
                <label className="block">
                  <div className="mb-1 text-xs font-bold text-white/60">Name</div>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={editForm.name}
                    onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-xs font-bold text-white/60">Position</div>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={editForm.position}
                    onChange={(e) => setEditForm((s) => ({ ...s, position: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-xs font-bold text-white/60">Role</div>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((s) => ({ ...s, role: e.target.value as TeamMemberRole }))}
                    className="w-full rounded-xl border border-orange-400/60 bg-orange-900/60 px-3 py-2 text-sm text-white"
                  >
                    <option value="player">Player</option>
                    <option value="keyplayer">Key Player</option>
                    <option value="owner">Owner</option>
                  </select>
                </label>
                <label className="block">
                  <div className="mb-1 text-xs font-bold text-white/60">New Photo (optional)</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm((s) => ({ ...s, photoFile: e.target.files?.[0] || null }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    disabled={addingMember}
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMemberId(null)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/90 transition hover:border-white/20 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      <div className="text-xs text-white/50">
        Roles are normalized by admin: when you set someone to `owner` or `keyplayer`, others are automatically set back to `player`.
      </div>
    </section>
  );
}

