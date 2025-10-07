// app/leaderboard/page.tsx
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getLeaderboard, type Game } from "@/app/actions/leaderboard";

export const revalidate = 60; // refresh server-rendered data roughly every minute

const GAMES: Game[] = ["BGMI", "Free Fire", "Clash Royale"];

type SearchParams = { [key: string]: string | string[] | undefined };

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const param = typeof searchParams?.game === "string" ? searchParams.game : undefined;
  const selected: Game = (GAMES.includes(param as Game) ? (param as Game) : "BGMI");

  const rows = await getLeaderboard(selected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-white/60">Track team rankings across all games</p>
      </section>

      {/* Tabs + Table */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-3">
          {GAMES.map((g) => (
            <Link
              key={g}
              href={{ pathname: "/leaderboard", query: { game: g } }}
              className={cx(
                "inline-flex items-center justify-center rounded-xl px-4 py-3 border text-sm font-medium",
                selected === g
                  ? "bg-white/10 border-white/20"
                  : "bg-transparent border-white/10 hover:bg-white/5"
              )}
            >
              {g}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="grid grid-cols-[56px_1fr_120px_120px_120px_100px] items-center gap-3 px-4 py-3 text-sm text-white/70 border-b border-white/10">
            <div className="font-semibold">Rank</div>
            <div className="font-semibold">Team</div>
            <div className="font-semibold">Points</div>
            <div className="font-semibold">Matches</div>
            <div className="font-semibold">Wins</div>
            <div className="font-semibold">Win Rate</div>
          </div>

          {rows.length === 0 && (
            <div className="px-4 py-6 text-white/60">
              No teams yet for {selected}. Be the first to register!
            </div>
          )}

          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[56px_1fr_120px_120px_120px_100px] items-center gap-3 px-4 py-3 border-t border-white/10"
            >
              <div className="flex items-center gap-2 text-white/80">
                <Trophy className="h-4 w-4" />
                <span>{r.rank}</span>
              </div>
              <div className="truncate">{r.name}</div>
              <div>{r.points}</div>
              <div>{r.matches}</div>
              <div>{r.wins}</div>
              <div>{r.winRate}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
