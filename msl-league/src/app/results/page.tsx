import { connectToDatabase } from "@/lib/mongoose";
import { computeStandings } from "@/lib/standings";
import { FixtureModel } from "@/models/Fixture";
import { TeamModel } from "@/models/Team";
import { LeagueSettingsModel } from "@/models/LeagueSettings";

export default async function ResultsPage() {
  await connectToDatabase();

  const [teams, fixtures] = (await Promise.all([
    TeamModel.find().lean(),
    FixtureModel.find({ season: "default" }).lean(),
  ])) as any;

  const settings = (await LeagueSettingsModel.findOne({ season: "default" }).lean()) as any;
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
    <section className="space-y-5 sm:space-y-7">
      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Results</h1>

      <div className="grid gap-4 lg:gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 card p-4 sm:p-5">
          <h2 className="text-lg font-black text-white sm:text-xl">League Table</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-full lg:min-w-max border-separate border-spacing-y-2 text-xs sm:text-sm">
              <thead className="text-xs uppercase text-white/50">
                <tr>
                  <th className="text-left px-1">#</th>
                  <th className="text-left px-1">Team</th>
                  <th className="text-right px-1">Pld</th>
                  <th className="text-right px-1">W</th>
                  <th className="text-right px-1">D</th>
                  <th className="text-right px-1">L</th>
                  <th className="text-right px-1">GD</th>
                  <th className="text-right px-1">Pts</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm">
                {standings.map((r: any, idx: number) => (
                  <tr key={r.teamId} className="text-white/90">
                    <td className="px-1">{idx + 1}</td>
                    <td className="px-1">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {r.logoFileId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/images/${r.logoFileId}`}
                            alt={r.teamName}
                            className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex-shrink-0 object-contain"
                          />
                        ) : (
                          <span className="flex h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[9px] sm:text-[11px] font-black text-white/60">
                            T
                          </span>
                        )}
                        <span className="truncate font-extrabold">{r.teamName}</span>
                      </div>
                    </td>
                    <td className="text-right px-1">{r.played}</td>
                    <td className="text-right px-1">{r.won}</td>
                    <td className="text-right px-1">{r.drawn}</td>
                    <td className="text-right px-1">{r.lost}</td>
                    <td className="text-right px-1">{r.gd}</td>
                    <td className="text-right px-1 font-black text-emerald-300">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 card p-4 sm:p-5">
          <h2 className="text-lg font-black text-white sm:text-xl">Matchday Recap</h2>
          <div className="mt-4 space-y-2 sm:space-y-3">
            {completed.length === 0 ? (
              <div className="text-xs sm:text-sm text-white/60">No completed matches yet.</div>
            ) : (
              completed.slice(0, 12).map((f: any) => {
                const home = teams.find((t: any) => String(t._id) === String(f.homeTeamId));
                const away = teams.find((t: any) => String(t._id) === String(f.awayTeamId));
                const scoreLine = `${f.homeScore} : ${f.awayScore}`;
                return (
                  <div key={String(f._id)} className="rounded-xl border border-white/10 bg-white/5 p-2 sm:p-3">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="min-w-0 text-xs sm:text-sm font-extrabold text-white truncate">
                        {home?.name || "TBD"} vs {away?.name || "TBD"}
                      </div>
                      <div className="text-right text-base sm:text-lg font-black text-emerald-300 flex-shrink-0">{scoreLine}</div>
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

