import { connectToDatabase } from "@/lib/mongoose";
import { LeagueSettingsModel } from "@/models/LeagueSettings";
import Link from "next/link";

export default async function HomePage() {
  await connectToDatabase();
  const doc = await LeagueSettingsModel.findOne({ season: "default" }).lean();
  const settings = doc || (await LeagueSettingsModel.create({ season: "default" })).toObject();

  return (
    <section className="space-y-6">
      <div className="card p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/80">
          MATCH DAY READY
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          {settings.siteTitle}
        </h1>
        <p className="mt-2 text-white/70">{settings.tagline}</p>
        <p className="mt-5 leading-relaxed text-white/85">{settings.about}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link className="card p-5 transition hover:shadow-glow" href="/teams">
          <div className="text-sm font-semibold text-white/70">Teams</div>
          <div className="mt-2 text-xl font-black text-white">Meet the squads</div>
        </Link>
        <Link className="card p-5 transition hover:shadow-glow" href="/fixtures">
          <div className="text-sm font-semibold text-white/70">Fixtures</div>
          <div className="mt-2 text-xl font-black text-white">Schedule & battles</div>
        </Link>
        <Link className="card p-5 transition hover:shadow-glow" href="/results">
          <div className="text-sm font-semibold text-white/70">Results</div>
          <div className="mt-2 text-xl font-black text-white">Standings & scoring</div>
        </Link>
      </div>
    </section>
  );
}

