import { connectToDatabase } from "@/lib/mongoose";
import { ChampionModel } from "@/models/Champion";
import { TeamModel } from "@/models/Team";

export default async function ChampionsPage() {
  await connectToDatabase();
  const championDocs = await ChampionModel.find().sort({ season: -1 }).lean();
  const allEntries = championDocs.flatMap(doc => 
    (doc.entries || []).map((e: any) => ({ ...e, season: doc.season }))
  );

  const ids = allEntries.map((e: any) => String(e.teamId));
  const teams = ids.length ? await TeamModel.find({ _id: { $in: ids } }).lean() : [];
  const teamById = new Map(teams.map((t: any) => [String(t._id), t] as const));

  // Group by season
  const championsBySeason = allEntries.reduce((acc, e) => {
    const season = e.season;
    if (!acc[season]) acc[season] = [];
    acc[season].push(e);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <section className="space-y-5 sm:space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Champions</h1>

      {Object.keys(championsBySeason).length === 0 ? (
        <div className="card p-5 sm:p-6 text-sm text-white/70">No champions set yet. Admin can update this page.</div>
      ) : (
        Object.entries(championsBySeason).map(([season, entries]) => (
          <div key={season} className="space-y-3 sm:space-y-4">
            <h2 className="text-xl font-bold text-white sm:text-2xl">{season} Champions</h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((e: any) => {
                const team = teamById.get(String(e.teamId));
                const championPhoto = e.photoFileId ? `/api/images/${String(e.photoFileId)}` : null;
                const logo = team?.logoFileId ? `/api/images/${String(team.logoFileId)}` : null;
                return (
                  <div key={String(e.teamId)} className="card overflow-hidden">
                    <div className="relative h-32 bg-white/5 sm:h-44">
                      {championPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={championPhoto} alt="Champion photo" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs sm:text-sm text-white/60">Upload photo</div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:h-12 sm:w-12">
                          {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt={`${team?.name || "Team"} logo`} className="h-9 w-9 rounded-xl object-contain sm:h-10 sm:w-10" />
                          ) : (
                            <span className="text-xs font-black text-white/60">T</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold text-white sm:text-base">{team?.name || "Unknown"}</div>
                          <div className="truncate text-xs text-white/60">MSN • MSL League Champions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

