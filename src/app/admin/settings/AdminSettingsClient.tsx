"use client";

import { useState } from "react";

type Settings = {
  season: string;
  siteTitle: string;
  tagline: string;
  about: string;
  logo: string;
  tournamentLogo: string;
  pointsRules: { win: number; draw: number; loss: number };
};

export default function AdminSettingsClient({ initialSettings }: { initialSettings: Settings }) {
  const [siteTitle, setSiteTitle] = useState(initialSettings.siteTitle || "");
  const [tagline, setTagline] = useState(initialSettings.tagline || "");
  const [about, setAbout] = useState(initialSettings.about || "");
  const [logo, setLogo] = useState(initialSettings.logo || "");
  const [tournamentLogo, setTournamentLogo] = useState(initialSettings.tournamentLogo || "");

  const [win, setWin] = useState<number>(initialSettings.pointsRules?.win ?? 3);
  const [draw, setDraw] = useState<number>(initialSettings.pointsRules?.draw ?? 1);
  const [loss, setLoss] = useState<number>(initialSettings.pointsRules?.loss ?? 0);

  const [saving, setSaving] = useState(false);

  async function uploadLogo(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    setLogo(data.fileId);
  }

  async function uploadTournamentLogo(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    setTournamentLogo(data.fileId);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          siteTitle: siteTitle.trim(),
          tagline: tagline.trim(),
          about: about.trim(),
          logo: logo.trim(),
          tournamentLogo: tournamentLogo.trim(),
          pointsRules: { win: Number(win), draw: Number(draw), loss: Number(loss) },
        }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      alert("Settings updated");
    } catch (err: any) {
      alert(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="card p-5">
        <h1 className="text-2xl font-black tracking-tight text-white">League Settings</h1>
        <div className="mt-2 text-sm text-white/60">Update overall content and points rules used in the league table.</div>
      </div>

      <form className="card p-5 space-y-5" onSubmit={onSave}>
        <div>
          <h2 className="text-lg font-black text-white">Site Content</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <div className="mb-1 text-xs font-bold text-white/60">Site Title</div>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
              />
            </label>
            <label className="block md:col-span-2">
              <div className="mb-1 text-xs font-bold text-white/60">Tagline</div>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </label>
            <label className="block md:col-span-2">
              <div className="mb-1 text-xs font-bold text-white/60">About</div>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </label>
            <label className="block md:col-span-2">
              <div className="mb-1 text-xs font-bold text-white/60">League Logo</div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      await uploadLogo(file);
                      alert("Logo uploaded successfully");
                    } catch (err: any) {
                      alert(err?.message || "Upload failed");
                    }
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
              {logo && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={`/api/images/${logo}`} alt="League Logo" className="h-16 w-16 object-contain" />
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete the league logo?")) {
                        try {
                          setLogo("");
                          await fetch("/api/admin/settings", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ logo: "" }),
                          });
                          alert("League logo deleted");
                        } catch (err: any) {
                          alert(err?.message || "Delete failed");
                        }
                      }
                    }}
                    className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200 transition hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              )}
            </label>
            <label className="block md:col-span-2">
              <div className="mb-1 text-xs font-bold text-white/60">Tournament Logo</div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      await uploadTournamentLogo(file);
                      alert("Tournament logo uploaded successfully");
                    } catch (err: any) {
                      alert(err?.message || "Upload failed");
                    }
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
              {tournamentLogo && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={`/api/images/${tournamentLogo}`} alt="Tournament Logo" className="h-16 w-16 object-contain" />
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete the tournament logo?")) {
                        try {
                          setTournamentLogo("");
                          await fetch("/api/admin/settings", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ tournamentLogo: "" }),
                          });
                          alert("Tournament logo deleted");
                        } catch (err: any) {
                          alert(err?.message || "Delete failed");
                        }
                      }
                    }}
                    className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200 transition hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black text-white">Points Rules</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <label className="block">
              <div className="mb-1 text-xs font-bold text-white/60">Win</div>
              <input
                type="number"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={win}
                onChange={(e) => setWin(Number(e.target.value))}
              />
            </label>
            <label className="block">
              <div className="mb-1 text-xs font-bold text-white/60">Draw</div>
              <input
                type="number"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={draw}
                onChange={(e) => setDraw(Number(e.target.value))}
              />
            </label>
            <label className="block">
              <div className="mb-1 text-xs font-bold text-white/60">Loss</div>
              <input
                type="number"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={loss}
                onChange={(e) => setLoss(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="mt-2 text-xs text-white/50">
            These rules are applied when computing standings on `/results`.
          </div>
        </div>

        <button
          disabled={saving}
          type="submit"
          className="w-full rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </section>
  );
}

