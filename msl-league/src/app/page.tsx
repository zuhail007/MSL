import { connectToDatabase } from "@/lib/mongoose";
import { LeagueSettingsModel } from "@/models/LeagueSettings";
import Link from "next/link";

export default async function HomePage() {
  await connectToDatabase();
  const doc = await LeagueSettingsModel.findOne({ season: "default" }).lean();
  const settings = doc || (await LeagueSettingsModel.create({ season: "default" })).toObject();

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="card p-5 sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/80">
          MATCH DAY READY
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:mt-4 sm:text-4xl">
          {settings.siteTitle}
        </h1>
        <p className="mt-2 text-sm text-white/70 sm:text-base">{settings.tagline}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/85 sm:mt-5">{settings.about}</p>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Link className="card p-4 sm:p-5 transition hover:shadow-glow" href="/teams">
          <div className="text-xs font-semibold text-white/70 sm:text-sm">Teams</div>
          <div className="mt-2 text-lg font-black text-white sm:text-xl">Meet the squads</div>
        </Link>
        <Link className="card p-4 sm:p-5 transition hover:shadow-glow" href="/fixtures">
          <div className="text-xs font-semibold text-white/70 sm:text-sm">Fixtures</div>
          <div className="mt-2 text-lg font-black text-white sm:text-xl">Schedule & battles</div>
        </Link>
        <Link className="card p-4 sm:p-5 transition hover:shadow-glow" href="/results">
          <div className="text-xs font-semibold text-white/70 sm:text-sm">Results</div>
          <div className="mt-2 text-lg font-black text-white sm:text-xl">Standings & scoring</div>
        </Link>
      </div>
    </section>
  );
}

