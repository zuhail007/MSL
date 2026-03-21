import { connectToDatabase } from "@/lib/mongoose";
import { computeStandings } from "@/lib/standings";
import { FixtureModel } from "@/models/Fixture";
import { TeamModel } from "@/models/Team";
import { LeagueSettingsModel } from "@/models/LeagueSettings";

function BracketVisualization({ qualifiedTeams }: { qualifiedTeams: any[] }) {
  // For 8 teams: Quarterfinals (4 matches), Semifinals (2 matches), Final (1 match)
  const quarters = [
    [qualifiedTeams[0], qualifiedTeams[7]], // 1 vs 8
    [qualifiedTeams[1], qualifiedTeams[6]], // 2 vs 7
    [qualifiedTeams[2], qualifiedTeams[5]], // 3 vs 6
    [qualifiedTeams[3], qualifiedTeams[4]], // 4 vs 5
  ];

  const semis = [
    ["QF1 Winner", "QF2 Winner"],
    ["QF3 Winner", "QF4 Winner"],
  ];

  const final = ["SF1 Winner", "SF2 Winner"];

  return (
    <div className="space-y-8">
      {/* Quarterfinals */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Quarterfinals</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quarters.map((match, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {match[0]?.logoFileId ? (
                    <img src={`/api/images/${match[0].logoFileId}`} alt={match[0].teamName} className="h-6 w-6 rounded object-contain" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-white/5 text-xs font-black text-white/60">T</span>
                  )}
                  <span className="text-sm font-semibold text-white">{match[0]?.teamName || "TBD"}</span>
                </div>
                <div className="text-center text-white/40">vs</div>
                <div className="flex items-center gap-2">
                  {match[1]?.logoFileId ? (
                    <img src={`/api/images/${match[1].logoFileId}`} alt={match[1].teamName} className="h-6 w-6 rounded object-contain" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-white/5 text-xs font-black text-white/60">T</span>
                  )}
                  <span className="text-sm font-semibold text-white">{match[1]?.teamName || "TBD"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semifinals */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Semifinals</h3>
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
          {semis.map((match, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="space-y-2">
                <div className="text-center text-sm font-semibold text-white">{match[0]}</div>
                <div className="text-center text-white/40">vs</div>
                <div className="text-center text-sm font-semibold text-white">{match[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Final</h3>
        <div className="max-w-sm mx-auto">
          <div className="rounded-lg border border-orange-400/30 bg-orange-500/10 p-6">
            <div className="space-y-2">
              <div className="text-center text-sm font-semibold text-white">{final[0]}</div>
              <div className="text-center text-white/40">vs</div>
              <div className="text-center text-sm font-semibold text-white">{final[1]}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function KnockoutPage() {
  await connectToDatabase();

  const [teams, fixtures] = (await Promise.all([
    TeamModel.find().lean(),
    FixtureModel.find({ season: "default" }).lean(),
  ])) as any;

  const settings = (await LeagueSettingsModel.findOne({ season: "default" }).lean()) as any;
  const pointsRules = settings?.pointsRules || { win: 3, draw: 1, loss: 0 };

  const groupStandings = computeStandings({
    fixtures,
    teams: teams.map((t: any) => ({
      _id: t._id,
      name: t.name,
      logoFileId: t.logoFileId,
      group: t.group,
    })),
    pointsRules,
  });

  // Get top 2 teams from each group for knockout
  const qualifiedTeams: any[] = [];
  for (const [group, standings] of groupStandings) {
    const top2 = standings.slice(0, 2);
    qualifiedTeams.push(...top2.map(s => ({ ...s, group })));
  }

  // Sort qualified teams by points, then GD, then GF for seeding
  qualifiedTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  return (
    <section className="space-y-7">
      <div className="card p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/80">
          KNOCKOUT TOURNAMENT
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          MSL Knockout Cup
        </h1>
        <p className="mt-2 text-white/70">Championship tournament for the best teams</p>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-black text-white mb-4">Qualified Teams</h2>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {qualifiedTeams.map((team, idx) => (
            <div key={team.teamId} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-bold text-emerald-300">#{idx + 1}</div>
              {team.logoFileId ? (
                <img
                  src={`/api/images/${team.logoFileId}`}
                  alt={team.teamName}
                  className="h-8 w-8 rounded-lg object-contain"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-black text-white/60">
                  T
                </span>
              )}
              <div>
                <div className="text-sm font-extrabold text-white">{team.teamName}</div>
                <div className="text-xs text-white/60">Group {team.group}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-black text-white mb-4">Tournament Bracket</h2>
        <BracketVisualization qualifiedTeams={qualifiedTeams} />
      </div>
    </section>
  );
}