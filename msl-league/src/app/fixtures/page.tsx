import { connectToDatabase } from "@/lib/mongoose";
import { FixtureModel } from "@/models/Fixture";
import { TeamModel } from "@/models/Team";
import LocalDateTime from "@/components/LocalDateTime";

export default async function FixturesPage() {
  await connectToDatabase();
  const [teams, fixtures] = await Promise.all([
    TeamModel.find().lean(),
    FixtureModel.find({ season: "default" }).sort({ scheduledAt: 1 }).lean(),
  ]);
  const teamById = new Map(teams.map((t: any) => [String(t._id), t] as const));

  return (
    <section className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Fixtures</h1>

      <div className="space-y-3 sm:space-y-4">
        {fixtures.length === 0 ? (
          <div className="card p-6 text-sm text-white/70">No fixtures yet. Admin will add match schedules.</div>
        ) : (
          fixtures.map((f: any) => {
            const home = teamById.get(String(f.homeTeamId));
            const away = teamById.get(String(f.awayTeamId));

            const isDone = f.status === "completed";

            return (
              <div key={String(f._id)} className="card p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 sm:min-w-auto">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:h-12 sm:w-12">
                      {home?.logoFileId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/images/${String(home.logoFileId)}`}
                          alt={home.name}
                          className="h-9 w-9 rounded-xl object-contain sm:h-10 sm:w-10"
                        />
                      ) : (
                        <span className="text-[10px] font-black text-white/60 sm:text-[11px]">H</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-white sm:text-base">
                        {home?.name || "TBD"}
                      </div>
                      <div className="text-xs text-white/60">Home</div>
                    </div>
                  </div>

                  <div className="text-center order-3 sm:order-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-white/55">
                      {isDone ? "FINAL" : "SCHEDULED"}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-white/70">
                      <LocalDateTime value={f.scheduledAt ? String(f.scheduledAt) : null} />
                    </div>
                    {isDone ? (
                      <div className="mt-2 text-xl font-black text-emerald-300 sm:text-2xl">
                        {f.homeScore} : {f.awayScore}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs sm:text-sm text-white/60">Score pending</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 justify-end min-w-0 sm:min-w-auto sm:order-3">
                    <div className="min-w-0 text-right">
                      <div className="truncate text-sm font-extrabold text-white sm:text-base">
                        {away?.name || "TBD"}
                      </div>
                      <div className="text-xs text-white/60">Away</div>
                    </div>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:h-12 sm:w-12">
                      {away?.logoFileId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/images/${String(away.logoFileId)}`}
                          alt={away.name}
                          className="h-9 w-9 rounded-xl object-contain sm:h-10 sm:w-10"
                        />
                      ) : (
                        <span className="text-[10px] font-black text-white/60 sm:text-[11px]">A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

