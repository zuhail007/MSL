import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { FixtureModel } from "@/models/Fixture";
import { LeagueSettingsModel } from "@/models/LeagueSettings";
import { computeStandings } from "@/lib/standings";

export default async function GroupsPage() {
  try {
    await connectToDatabase();

    const [rawTeams, rawFixtures, settings] = (await Promise.all([
      TeamModel.find().sort({ name: 1 }).lean(),
      FixtureModel.find({ season: "default", stage: "group" }).lean(),
      LeagueSettingsModel.findOne({ season: "default" }).lean(),
    ])) as any;

    const teams = Array.isArray(rawTeams) ? rawTeams : [];
    const fixtures = Array.isArray(rawFixtures) ? rawFixtures : [];
    const pointsRules = settings?.pointsRules || { win: 3, draw: 1, loss: 0 };

    // Group teams by their group field and keep only populated groups.
    const groupMap = new Map<string, any[]>();
    for (const t of teams) {
      const normalizedGroup = String(t?.group || "A").trim().toUpperCase();
      const key = normalizedGroup.length > 0 ? normalizedGroup : "A";
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(t);
    }

    // Sort groups alphabetically and exclude empty groups.
    const sortedGroups = new Map(
      [...groupMap.entries()]
        .filter(([, groupedTeams]) => Array.isArray(groupedTeams) && groupedTeams.length > 0)
        .sort((a, b) => a[0].localeCompare(b[0]))
    );

    // Calculate standings for each group.
    const groupStandingsMap = new Map<string, any[]>();
    for (const [group, groupTeams] of sortedGroups.entries()) {
      const standings = computeStandings({
        fixtures,
        teams: groupTeams.map((t: any) => ({
          _id: t._id,
          name: t.name,
          logoFileId: t.logoFileId,
        })),
        pointsRules,
      });
      groupStandingsMap.set(group, Array.isArray(standings) ? standings : []);
    }

  return (
    <section className="space-y-5 sm:space-y-7">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Groups</h1>
        <p className="mt-1 text-sm text-white/60">Teams organised by group stage.</p>
      </div>

      {sortedGroups.size === 0 ? (
        <div className="card p-8 text-center text-sm text-white/60">No teams have been added yet.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from(sortedGroups.entries()).map(([group, groupTeams]) => {
            const standings = groupStandingsMap.get(group) || [];
            return (
              <div key={group} className="space-y-4">
                {/* Group Header */}
                <div className="card p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                      <span className="text-lg font-black text-emerald-300">{group}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Group {group}</h2>
                      <p className="text-xs text-white/50">{groupTeams.length} team{groupTeams.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Standings Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2 text-xs">
                      <thead className="text-xs uppercase text-white/50">
                        <tr>
                          <th className="text-left px-1">#</th>
                          <th className="text-left px-1">Team</th>
                          <th className="text-right px-1">Pld</th>
                          <th className="text-right px-1">W</th>
                          <th className="text-right px-1">D</th>
                          <th className="text-right px-1">L</th>
                          <th className="text-right px-1">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((r: any, idx: number) => (
                          <tr key={r.teamId} className="text-white/90">
                            <td className="px-1 text-xs font-black">{idx + 1}</td>
                            <td className="px-1">
                              <div className="flex items-center gap-2 min-w-0">
                                {r.logoFileId ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={`/api/images/${r.logoFileId}`}
                                    alt={r.teamName}
                                    className="h-6 w-6 rounded-lg flex-shrink-0 object-contain"
                                  />
                                ) : (
                                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[9px] font-black text-white/60">
                                    T
                                  </span>
                                )}
                                <span className="truncate font-extrabold text-xs">{r.teamName}</span>
                              </div>
                            </td>
                            <td className="text-right px-1 text-xs">{r.played}</td>
                            <td className="text-right px-1 text-xs">{r.won}</td>
                            <td className="text-right px-1 text-xs">{r.drawn}</td>
                            <td className="text-right px-1 text-xs">{r.lost}</td>
                            <td className="text-right px-1 font-black text-emerald-300 text-xs">{r.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Teams List */}
                <div className="card p-4 sm:p-5">
                  <h3 className="text-sm font-black text-white mb-3">Squad</h3>
                  <div className="space-y-2">
                    {groupTeams.map((t: any) => (
                      <div
                        key={String(t._id)}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
                      >
                        {t.logoFileId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/images/${String(t.logoFileId)}`}
                            alt={t.name}
                            className="h-9 w-9 rounded-lg flex-shrink-0 object-contain"
                          />
                        ) : (
                          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-black text-white/60">
                            T
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-extrabold text-sm text-white">{t.name}</div>
                          {t.shortName && (
                            <div className="text-xs text-white/40">{t.shortName}</div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-xs text-white/40">
                          {(t.members || []).length} players
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <section className="space-y-5 sm:space-y-7">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Groups</h1>
          <p className="mt-1 text-sm text-red-300">Error loading groups: {message}</p>
        </div>
      </section>
    );
  }
}
