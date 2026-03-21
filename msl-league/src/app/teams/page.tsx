import Link from "next/link";
import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";

export default async function TeamsPage() {
  await connectToDatabase();
  const teams = await TeamModel.find().sort({ name: 1 }).lean();

  return (
    <section className="space-y-4 sm:space-y-5">
      <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Teams</h2>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {teams.map((t: any) => {
          const logo = t.logoFileId ? `/api/images/${String(t.logoFileId)}` : null;
          return (
            <Link
              key={String(t._id)}
              href={`/teams/${String(t._id)}`}
              className="card flex items-center gap-4 p-5 transition hover:shadow-glow"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={`${t.name} logo`} className="h-12 w-12 rounded-xl object-contain" />
                ) : (
                  <span className="text-xs font-black text-white/60">LOGO</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-extrabold text-white">{t.name}</div>
                <div className="mt-1 text-xs text-white/60">
                  {Array.isArray(t.members) ? t.members.length : 0} players
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

