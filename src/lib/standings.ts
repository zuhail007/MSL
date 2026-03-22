import type { Types } from "mongoose";
export type StandingRow = { teamId: string; teamName: string; logoFileId?: string | null; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number; };
type FixtureLike = { _id: Types.ObjectId | string; status: string; homeTeamId: Types.ObjectId | string; awayTeamId: Types.ObjectId | string; homeScore: number | null; awayScore: number | null; };
export function computeStandings(args: { fixtures: FixtureLike[]; teams: Array<{ _id: Types.ObjectId | string; name: string; logoFileId?: Types.ObjectId | string | null; group?: string; }>; pointsRules?: { win: number; draw: number; loss: number }; }): StandingRow[] {
  const { fixtures, teams, pointsRules } = args;
  const winPoints = pointsRules?.win ?? 3;
  const drawPoints = pointsRules?.draw ?? 1;
  const rows = new Map<string, StandingRow>();
  for (const t of teams) { rows.set(String(t._id), { teamId: String(t._id), teamName: t.name, logoFileId: t.logoFileId ? String(t.logoFileId) : null, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }); }
  for (const f of fixtures) {
    if (f.status !== "completed" || f.homeScore == null || f.awayScore == null) continue;
    const home = rows.get(String(f.homeTeamId)); const away = rows.get(String(f.awayTeamId));
    if (!home || !away) continue;
    const hs = f.homeScore as number; const as_ = f.awayScore as number;
    home.played++; away.played++; home.gf += hs; home.ga += as_; away.gf += as_; away.ga += hs;
    if (hs > as_) { home.won++; away.lost++; home.points += winPoints; }
    else if (hs < as_) { away.won++; home.lost++; away.points += winPoints; }
    else { home.drawn++; away.drawn++; home.points += drawPoints; away.points += drawPoints; }
  }
  const result: StandingRow[] = [];
  for (const row of rows.values()) { row.gd = row.gf - row.ga; result.push(row); }
  result.sort((a, b) => b.points !== a.points ? b.points - a.points : b.gd !== a.gd ? b.gd - a.gd : b.gf !== a.gf ? b.gf - a.gf : a.teamName.localeCompare(b.teamName));
  return result;
}
