"use client";

import { useEffect, useState } from "react";

type Team = {
  id: string;
  name: string;
  logoFileId?: string | null;
};

type ChampionEntry = {
  teamId: string;
  photoFileId: string | null;
};

type Champion = {
  season: string;
  entries: ChampionEntry[];
};

export default function AdminChampionsClient({
  initialTeams,
}: {
  initialTeams: Team[];
}) {
  const [teams] = useState<Team[]>(initialTeams);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [season, setSeason] = useState("default");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [champion, setChampion] = useState<Champion | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Load existing champions
  useEffect(() => {
    const loadChampion = async () => {
      try {
        const res = await fetch(`/api/admin/champions?season=${season}`);
        const data = await res.json();

        setChampion(data);
      } catch (err) {
        console.error("Failed to load champions:", err);
        setChampion({ season, entries: [] });
      }
    };

    loadChampion();
  }, [season]);

  // 🗑️ Delete Champion
  const deleteEntry = async (index: number) => {
    if (!confirm("Are you sure you want to delete this champion?")) return;

    setLoading(true);

    try {
      const currentEntries = champion?.entries || [];
      const newEntries = currentEntries.filter((_, i) => i !== index);

      const res = await fetch("/api/admin/champions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          season,
          entries: newEntries,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete champion");

      alert("Champion deleted successfully!");

      // reload
      const updated = await fetch(`/api/admin/champions?season=${season}`);
      const data = await updated.json();
      setChampion(data);
    } catch (err) {
      console.error(err);
      alert("Error deleting champion");
    } finally {
      setLoading(false);
    }
  };

  // 📤 Upload File
  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.fileId;
  };

  // 🏆 Add Champion
  const addChampion = async () => {
    if (!selectedTeam) {
      alert("Please select a team");
      return;
    }

    setLoading(true);

    try {
      let photoFileId = null;
      if (selectedFile) {
        photoFileId = await uploadFile(selectedFile);
      }

      const currentEntries = champion?.entries || [];
      const newEntries = [...currentEntries, { teamId: selectedTeam, photoFileId }];

      const res = await fetch("/api/admin/champions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          season,
          entries: newEntries,
        }),
      });

      if (!res.ok) throw new Error("Failed to add champion");

      alert("Champion added successfully!");

      // reload
      const updated = await fetch(`/api/admin/champions?season=${season}`);
      const data = await updated.json();
      setChampion(data);

      setSelectedTeam("");
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Error adding champion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 text-white">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">🏆 Champions Admin</h1>

      {/* Season Input */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium mb-2">Season</label>
        <input
          type="text"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g. 2023-2024"
        />
      </div>

      {/* 🔽 Dropdown + Button */}
      <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="flex-1 bg-gray-800 text-white border border-gray-600 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="" className="text-gray-400">
              Select Team
            </option>

            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="flex-1 bg-gray-800 text-white border border-gray-600 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-600 file:text-white"
          />

          <button
            onClick={addChampion}
            disabled={loading}
            className="flex-1 sm:flex-none whitespace-nowrap bg-green-600 hover:bg-green-700 px-3 sm:px-4 py-2 rounded-md transition text-sm sm:text-base font-medium"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Current Champions - {season}</h2>
        <button
          onClick={async () => {
            if (!confirm(`Delete all champions for season ${season}?`)) return;
            setLoading(true);
            try {
              const res = await fetch(`/api/admin/champions?season=${season}`, {
                method: "DELETE",
              });
              if (!res.ok) throw new Error("Failed to delete season champions");
              setChampion({ season, entries: [] });
              alert("Season champions deleted");
            } catch (err) {
              console.error(err);
              alert("Error deleting season champions");
            } finally {
              setLoading(false);
            }
          }}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-medium whitespace-nowrap"
          disabled={loading}
        >
          Clear season
        </button>
      </div>

      {champion?.entries?.length ? (
        <div className="space-y-2 sm:space-y-3">
          {champion.entries.map((entry: ChampionEntry, index: number) => {
            const team = teams.find(t => t.id === entry.teamId);
            return (
              <div
                key={index}
                className="p-3 sm:p-4 bg-gray-800 border border-gray-700 rounded-md shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {entry.photoFileId && (
                    <img
                      src={`/api/images/${entry.photoFileId}`}
                      alt="Champion"
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <span className="text-sm sm:text-base truncate">{team?.name || "Unknown Team"}</span>
                </div>
                <button
                  onClick={() => deleteEntry(index)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">No champions yet</p>
      )}
    </div>
  );
}