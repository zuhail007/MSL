"use client";

import { useEffect, useState } from "react";

type Team = {
  id: string;
  name: string;
  logoFileId?: string | null;
};

type ChampionEntry = {
  teamId: any;
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
  const [champion, setChampion] = useState<Champion | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Load existing champions
  useEffect(() => {
    const loadChampion = async () => {
      try {
        const res = await fetch("/api/champions");
        const data = await res.json();

        if (Array.isArray(data)) {
          setChampion(data[0] || null);
        } else {
          setChampion(data || null);
        }
      } catch (err) {
        console.error("Failed to load champions:", err);
        setChampion(null);
      }
    };

    loadChampion();
  }, []);

  // 🏆 Add Champion
  const addChampion = async () => {
    if (!selectedTeam) {
      alert("Please select a team");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/champions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          season: "default",
          entries: [{ teamId: selectedTeam }],
        }),
      });

      if (!res.ok) throw new Error("Failed to add champion");

      alert("Champion added successfully!");

      // reload champions
      const updated = await fetch("/api/champions");
      const data = await updated.json();

      if (Array.isArray(data)) {
        setChampion(data[0] || null);
      } else {
        setChampion(data || null);
      }

      setSelectedTeam("");
    } catch (err) {
      console.error(err);
      alert("Error adding champion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">🏆 Champions Admin</h1>

      {/* 🔽 Dropdown + Button */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

        <button
          onClick={addChampion}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition"
        >
          {loading ? "Adding..." : "Add Champion"}
        </button>
      </div>

      {/* 🏆 Champions List */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Current Champions</h2>

        {!champion?.entries?.length && (
          <p className="text-gray-400">No champions yet</p>
        )}

        <div className="space-y-3">
          {champion?.entries?.map((entry: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-gray-800 border border-gray-700 rounded-md shadow"
            >
              {entry.teamId?.name || "Unknown Team"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}