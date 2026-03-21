import { connectToDatabase } from "@/lib/mongoose";
import { computeStandings } from "@/lib/standings";
import { FixtureModel } from "@/models/Fixture";
import { TeamModel } from "@/models/Team";
import { LeagueSettingsModel } from "@/models/LeagueSettings";

export default async function ResultsPage() {
  await connectToDatabase();

  const [teams, fixtures] = await Promise.all([
    TeamModel.find().lean(),
    FixtureModel.find({ season: "default" }).lean(),
  ]);

  const settings = await LeagueSettingsModel.findOne({ season: "default" }).lean();
  const pointsRules = settings?.pointsRules || { win: 3, draw: 1, loss: 0 };

  const standings = computeStandings({
    fixtures,
    teams: teams.map((t: any) => ({
      _id: t._id,
      name: t.name,
      logoFileId: t.logoFileId,
    })),
    pointsRules,
  });

  const completed = fixtures
    .filter((f: any) => f.status === "completed" && f.homeScore != null && f.awayScore != null)
    .sort((a: any, b: any) => String(b._id).localeCompare(String(a._id)));

  return (
    <section className="space-y-7">
      <h1 className="text-3xl font-black tracking-tight text-white">Results</h1>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 card p-5">
          <h2 className="text-xl font-black text-white">League Table</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-y-2">
              <thead className="text-xs uppercase text-white/50">
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Team</th>
                  <th className="text-right">Pld</th>
                  <th className="text-right">W</th>
                  <th className="text-right">D</th>
                  <th className="text-right">L</th>
                  <th className="text-right">GD</th>
                  <th className="text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {standings.map((r: any, idx: number) => (
                  <tr key={r.teamId} className="text-white/90">
                    <td>{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        {r.logoFileId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/images/${r.logoFileId}`}
                            alt={r.teamName}
                            className="h-8 w-8 rounded-lg object-contain"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-black text-white/60">
                            T
                          </span>
                        )}
                        <span className="font-extrabold">{r.teamName}</span>
                      </div>
                    </td>
                    <td className="text-right">{r.played}</td>
                    <td className="text-right">{r.won}</td>
                    <td className="text-right">{r.drawn}</td>
                    <td className="text-right">{r.lost}</td>
                    <td className="text-right">{r.gd}</td>
                    <td className="text-right font-black text-emerald-300">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 card p-5">
          <h2 className="text-xl font-black text-white">Matchday Recap</h2>
          <div className="mt-4 space-y-3">
            {completed.length === 0 ? (
              <div className="text-sm text-white/60">No completed matches yet.</div>
            ) : (
              completed.slice(0, 12).map((f: any) => {
                const home = teams.find((t: any) => String(t._id) === String(f.homeTeamId));
                const away = teams.find((t: any) => String(t._id) === String(f.awayTeamId));
                const scoreLine = `${f.homeScore} : ${f.awayScore}`;
                return (
                  <div key={String(f._id)} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 text-sm font-extrabold text-white">
                        {home?.name || "TBD"} vs {away?.name || "TBD"}
                      </div>
                      <div className="text-right text-lg font-black text-emerald-300">{scoreLine}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

