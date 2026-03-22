import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";

export default async function GroupsPage() {
  await connectToDatabase();

  const teams = (await TeamModel.find().sort({ name: 1 }).lean()) as any[];

  // Group teams by their group field
  const groupMap = new Map<string, typeof teams>();
  for (const t of teams) {
    const key = t.group || "A";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(t);
  }

  // Sort groups alphabetically
  const sortedGroups = new Map([...groupMap.entries()].sort());

  return (
    <section className="space-y-5 sm:space-y-7">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Groups</h1>
        <p className="mt-1 text-sm text-white/60">Teams organised by group stage.</p>
      </div>

      {sortedGroups.size === 0 ? (
        <div className="card p-8 text-center text-sm text-white/60">No teams have been added yet.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from(sortedGroups.entries()).map(([group, groupTeams]) => (
            <div key={group} className="card p-4 sm:p-5">
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <span className="text-lg font-black text-emerald-300">{group}</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Group {group}</h2>
                  <p className="text-xs text-white/50">{groupTeams.length} team{groupTeams.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Teams List */}
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
          ))}
        </div>
      )}
    </section>
  );
}
