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

  // 🔥 Load existing champions (SAFE)
  useEffect(() => {
    const loadChampion = async () => {
      try {
        const res = await fetch("/api/champions");
        const data = await res.json();

        // If API returns array → take first
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
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Champions Admin
      </h1>

      {/* 🧩 Select Team */}
      <select
        value={selectedTeam}
        onChange={(e) => setSelectedTeam(e.target.value)}
        style={{ padding: "10px", marginRight: "10px" }}
      >
        <option value="">Select Team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      {/* ➕ Add Button */}
      <button
        onClick={addChampion}
        disabled={loading}
        style={{
          padding: "10px 15px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Adding..." : "Add Champion"}
      </button>

      {/* 🏆 Show Champions */}
      <div style={{ marginTop: "30px" }}>
        <h2>Current Champions</h2>

        {!champion?.entries?.length && <p>No champions yet</p>}

        {champion?.entries?.map((entry: any, index: number) => (
          <div
            key={index}
            style={{
              padding: "10px",
              marginTop: "10px",
              border: "1px solid #ccc",
            }}
          >
            {entry.teamId?.name || "Unknown Team"}
          </div>
        ))}
      </div>
    </div>
  );
}