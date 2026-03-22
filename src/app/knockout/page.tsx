import { connectToDatabase } from "@/lib/mongoose";
import { FixtureModel } from "@/models/Fixture";
import { TeamModel } from "@/models/Team";

type KnockoutFixture = {
  _id: string;
  round: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

const ROUND_ORDER = ["Quarter-Final", "Semi-Final", "Final"];

function getRoundLabel(round: string) {
  return round;
}

export default async function KnockoutPage() {
  await connectToDatabase();

  const [teams, fixtures] = (await Promise.all([
    TeamModel.find().lean(),
    FixtureModel.find({ season: "default", stage: "knockout" }).lean(),
  ])) as any;

  const teamMap = new Map<string, string>();
  const logoMap = new Map<string, string | null>();
  for (const t of teams) {
    teamMap.set(String(t._id), t.name);
    logoMap.set(String(t._id), t.logoFileId ? String(t.logoFileId) : null);
  }

  // Group fixtures by round
  const byRound = new Map<string, KnockoutFixture[]>();
  for (const f of fixtures as any[]) {
    const round: string = f.round ?? "Unknown";
    if (!byRound.has(round)) byRound.set(round, []);
    byRound.get(round)!.push({
      _id: String(f._id),
      round,
      homeTeamId: String(f.homeTeamId),
      awayTeamId: String(f.awayTeamId),
      homeScore: f.homeScore ?? null,
      awayScore: f.awayScore ?? null,
      status: f.status,
    });
  }

  // Sort rounds in order
  const orderedRounds = ROUND_ORDER.filter((r) => byRound.has(r));
  // Add any rounds not in ROUND_ORDER at the end
  for (const r of byRound.keys()) {
    if (!orderedRounds.includes(r)) orderedRounds.push(r);
  }

  const hasFixtures = fixtures.length > 0;

  return (
    <section className="space-y-7">
      <h1 className="text-3xl font-black tracking-tight text-white">Knockout</h1>

      {!hasFixtures ? (
        <div className="card p-8 text-center text-white/60 text-sm">
          Knockout fixtures have not been set up yet.
        </div>
      ) : (
        <div className="space-y-8">
          {orderedRounds.map((round) => {
            const roundFixtures = byRound.get(round) ?? [];
            return (
              <div key={round}>
                <h2 className="mb-4 text-xl font-black text-white">{getRoundLabel(round)}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {roundFixtures.map((f) => {
                    const homeName = teamMap.get(f.homeTeamId) ?? "TBD";
                    const awayName = teamMap.get(f.awayTeamId) ?? "TBD";
                    const homeLogo = logoMap.get(f.homeTeamId);
                    const awayLogo = logoMap.get(f.awayTeamId);
                    const isCompleted = f.status === "completed";
                    const homeWon =
                      isCompleted &&
                      f.homeScore != null &&
                      f.awayScore != null &&
                      f.homeScore > f.awayScore;
                    const awayWon =
                      isCompleted &&
                      f.homeScore != null &&
                      f.awayScore != null &&
                      f.awayScore > f.homeScore;

                    return (
                      <div
                        key={f._id}
                        className="card p-4 space-y-3"
                      >
                        {/* Home Team */}
                        <div
                          className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                            homeWon ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {homeLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/images/${homeLogo}`}
                                alt={homeName}
                                className="h-8 w-8 rounded-lg object-contain flex-shrink-0"
                              />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-black text-white/60 flex-shrink-0">
                                T
                              </span>
                            )}
                            <span
                              className={`font-extrabold truncate text-sm ${
                                homeWon ? "text-emerald-300" : "text-white/90"
                              }`}
                            >
                              {homeName}
                            </span>
                          </div>
                          <span
                            className={`text-lg font-black flex-shrink-0 ${
                              homeWon ? "text-emerald-300" : "text-white/60"
                            }`}
                          >
                            {isCompleted ? f.homeScore : "-"}
                          </span>
                        </div>

                        {/* VS Divider */}
                        <div className="text-center text-xs font-black text-white/30 uppercase tracking-widest">
                          vs
                        </div>

                        {/* Away Team */}
                        <div
                          className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                            awayWon ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {awayLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/images/${awayLogo}`}
                                alt={awayName}
                                className="h-8 w-8 rounded-lg object-contain flex-shrink-0"
                              />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-black text-white/60 flex-shrink-0">
                                T
                              </span>
                            )}
                            <span
                              className={`font-extrabold truncate text-sm ${
                                awayWon ? "text-emerald-300" : "text-white/90"
                              }`}
                            >
                              {awayName}
                            </span>
                          </div>
                          <span
                            className={`text-lg font-black flex-shrink-0 ${
                              awayWon ? "text-emerald-300" : "text-white/60"
                            }`}
                          >
                            {isCompleted ? f.awayScore : "-"}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="text-right">
                          <span
                            className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-white/10 text-white/40"
                            }`}
                          >
                            {isCompleted ? "Completed" : "Upcoming"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
