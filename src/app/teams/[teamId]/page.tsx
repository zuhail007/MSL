import { connectToDatabase } from "@/lib/mongoose";
import { TeamModel } from "@/models/Team";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  await connectToDatabase();
  const team = await TeamModel.findById(teamId).lean();
  if (!team) notFound();

  const logo = team.logoFileId ? `/api/images/${String(team.logoFileId)}` : null;
  const members = team.members || [];

  const owner = members.find((m: any) => m.role === "owner") || null;
  const keyplayer = members.find((m: any) => m.role === "keyplayer") || null;

  return (
    <section className="space-y-6">
      <div className="card p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt={`${team.name} logo`}
                  className="h-14 w-14 rounded-xl object-contain"
                />
              ) : (
                <span className="text-xs font-black text-white/60">LOGO</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">{team.name}</h1>
              <div className="mt-1 text-sm text-white/60">Club roster & match roles</div>
            </div>
          </div>
          <Link
            href="/teams"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
          >
            Back to teams
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="text-sm font-bold text-white/60">Owner</div>
          {owner ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                {owner.photoFileId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/images/${String(owner.photoFileId)}`}
                    alt={owner.name}
                    className="h-12 w-12 rounded-xl object-contain"
                  />
                ) : (
                  <span className="text-xs font-black text-white/60">P</span>
                )}
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{owner.name}</div>
                <div className="text-xs text-white/60">{owner.position}</div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-white/60">No owner set yet.</div>
          )}
        </div>

        <div className="card p-5">
          <div className="text-sm font-bold text-white/60">Key Player</div>
          {keyplayer ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                {keyplayer.photoFileId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/images/${String(keyplayer.photoFileId)}`}
                    alt={keyplayer.name}
                    className="h-12 w-12 rounded-xl object-contain"
                  />
                ) : (
                  <span className="text-xs font-black text-white/60">K</span>
                )}
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{keyplayer.name}</div>
                <div className="text-xs text-white/60">{keyplayer.position}</div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-white/60">No key player set yet.</div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight text-white">Players</h2>
          <div className="text-sm text-white/60">{members.length} total</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members
            .slice()
            .sort((a: any, b: any) => String(a.role).localeCompare(String(b.role)))
            .map((m: any) => (
              <div key={String(m._id)} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    {m.photoFileId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/images/${String(m.photoFileId)}`}
                        alt={m.name}
                        className="h-12 w-12 rounded-xl object-contain"
                      />
                    ) : (
                      <span className="text-xs font-black text-white/60">#</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-extrabold text-white">{m.name}</div>
                    <div className="text-xs text-white/60">{m.position}</div>
                    <div className="mt-1 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-white/70">
                      {m.role === "owner" ? "OWNER" : m.role === "keyplayer" ? "KEY PLAYER" : "PLAYER"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

