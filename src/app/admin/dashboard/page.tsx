import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import { FixtureModel } from "@/models/Fixture";
import { RequireAdmin } from "@/components/RequireAdmin";

export default async function AdminDashboardPage() {
  await RequireAdmin();
  await connectToDatabase();

  const [teams, fixtures] = await Promise.all([
    TeamModel.countDocuments({}),
    FixtureModel.countDocuments({ season: "default" }),
  ]);

  const completed = await FixtureModel.countDocuments({
    season: "default",
    status: "completed",
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-black tracking-tight text-white">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm font-bold text-white/60">Teams</div>
          <div className="mt-2 text-3xl font-black text-emerald-200">{teams}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-bold text-white/60">Fixtures</div>
          <div className="mt-2 text-3xl font-black text-sky-200">{fixtures}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-bold text-white/60">Completed</div>
          <div className="mt-2 text-3xl font-black text-emerald-300">{completed}</div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-bold text-white/60">Quick actions</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
            href="/admin/teams"
          >
            Manage Teams
          </a>
          <a
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
            href="/admin/fixtures"
          >
            Update Fixtures / Scores
          </a>
          <a
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
            href="/admin/champions"
          >
            Set Champions
          </a>
          <a
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
            href="/admin/settings"
          >
            League Settings
          </a>
        </div>
      </div>
    </section>
  );
}

