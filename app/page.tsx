// app/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Trophy, Zap, ChevronRight } from "lucide-react";
import { getCounts } from "@/lib/teams";

export default async function HomePage() {
  // fail-safe so build never crashes
  let counts = { teams: 0, matches: 0, games: 3 };
  try {
    counts = await getCounts();
  } catch (e) {
    console.warn("[home] counts fallback:", e);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="space-y-10">
        <section className="rounded-3xl border border-white/10 bg-surface/30 p-5 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
            <Zap className="h-4 w-4" />
            <span>Inter-College Gaming 2025</span>
          </div>

          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome to<br />GameVerse &apos;25
          </h1>

          <p className="mt-3 text-white/70 max-w-xl">
            The ultimate gaming competition featuring BGMI, Free Fire, and Clash Royale
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/dashboard/teams/register"
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 bg-white text-black font-semibold shadow-sm hover:bg-white/90"
            >
              Register Your Team <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 border border-white/20 bg-transparent hover:bg-white/10 font-semibold"
            >
              <Trophy className="mr-2 h-5 w-5" /> View Leaderboard
            </Link>
          </div>
        </section>

        {/* simple live stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-3xl font-bold">{counts.teams}</div>
            <div className="mt-1 text-white/60 text-sm">Teams</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-3xl font-bold">{counts.matches}</div>
            <div className="mt-1 text-white/60 text-sm">Matches</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-3xl font-bold">{counts.games}</div>
            <div className="mt-1 text-white/60 text-sm">Games</div>
          </div>
        </div>
      </div>
    </main>
  );
}
