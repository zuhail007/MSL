import type { Types } from "mongoose";

export type StandingRow = {
  teamId: string;
  teamName: string;
  logoFileId?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

type FixtureLike = {
  _id: Types.ObjectId | string;
  status: string;
  homeTeamId: Types.ObjectId | string;
  awayTeamId: Types.ObjectId | string;
  homeScore: number | null;
  awayScore: number | null;
};

export function computeStandings(args: {
  fixtures: FixtureLike[];
  teams: Array<{
    _id: Types.ObjectId | string;
    name: string;
    logoFileId?: Types.ObjectId | string | null;
    group?: string;
  }>;
  pointsRules?: { win: number; draw: number; loss: number };
}): Map<string, StandingRow[]> {
  const { fixtures, teams, pointsRules } = args;
  const winPoints = pointsRules?.win ?? 3;
  const drawPoints = pointsRules?.draw ?? 1;
  const _lossPoints = pointsRules?.loss ?? 0;

  const rows = new Map<string, StandingRow>();
  for (const t of teams) {
    rows.set(String(t._id), {
      teamId: String(t._id),
      teamName: t.name,
      logoFileId: t.logoFileId ? String(t.logoFileId) : null,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    });
  }

  const isCompleted = (f: FixtureLike) =>
    f.status === "completed" && f.homeScore != null && f.awayScore != null;

  for (const f of fixtures) {
    if (!isCompleted(f)) continue;
    const homeId = String(f.homeTeamId);
    const awayId = String(f.awayTeamId);
    const home = rows.get(homeId);
    const away = rows.get(awayId);
    if (!home || !away) continue;
    const hs = f.homeScore as number;
    const as_ = f.awayScore as number;
    home.played += 1;
    away.played += 1;
    home.gf += hs;
    home.ga += as_;
    away.gf += as_;
    away.ga += hs;
    if (hs > as_) {
      home.won += 1;
      away.lost += 1;
      home.points += winPoints;
    } else if (hs < as_) {
      away.won += 1;
      home.lost += 1;
      away.points += winPoints;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += drawPoints;
      away.points += drawPoints;
    }
  }

  for (const row of rows.values()) {
    row.gd = row.gf - row.ga;
  }

  // Group teams by their 'group' field
  const groupMap = new Map<string, StandingRow[]>();
  for (const t of teams) {
    const groupKey = t.group ?? "A";
    const row = rows.get(String(t._id));
    if (!row) continue;
    if (!groupMap.has(groupKey)) groupMap.set(groupKey, []);
    groupMap.get(groupKey)!.push(row);
  }

  // Sort each group's standings
  for (const [, standings] of groupMap) {
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.teamName.localeCompare(b.teamName);
    });
  }

  // Return sorted by group name (A, B, C...)
  return new Map([...groupMap.entries()].sort());
}