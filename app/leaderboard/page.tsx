// app/leaderboard/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { getLeaderboard } from "@/app/actions/leaderboard";

type Game = "BGMI" | "Free Fire" | "Clash Royale";
const GAMES: Game[] = ["BGMI", "Free Fire", "Clash Royale"];

function hrefFor(game: Game) {
  return `/leaderboard?game=${encodeURIComponent(game)}`;
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const raw = (Array.isArray(searchParams?.game)
    ? searchParams?.game?.[0]
    : searchParams?.game) as string | undefined;

  const game: Game = (GAMES.includes(raw as Game) ? raw : "BGMI") as Game;

  // Safe fetch — never fail the page during build/deploy
  let rows: any[] = [];
  try {
    rows = await getLeaderboard(game);
  } catch (e) {
    console.warn("[leaderboard] falling back to empty rows:", e);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-white/10 bg-surface/30 p-5 md:p-8">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-white/60">Track team rankings across all games</p>

        {/* Tabs (server links) */}
        <div className="mt-5">
          <div className="rounded-2xl border border-white/10 p-2 bg-white/[0.03]">
            <div className="grid grid-cols-3 gap-2">
              {GAMES.map((g) => {
                const active = g === game;
                return (
                  <Link
                    key={g}
                    href={hrefFor(g)}
                    prefetch
                    className={[
                      "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium border",
                      active
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/80 border-white/15 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {g}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-white/70 text-sm">
              <tr className="border-b border-white/10">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Matches</th>
                <th className="py-3 px-4">Wins</th>
                <th className="py-3 px-4">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-white/60">
                    No results yet for {game}. Check back later.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={`${r.team ?? r.name ?? i}`}
                    className="border-t border-white/10"
                  >
                    <td className="py-3 px-4">{r.rank ?? i + 1}</td>
                    <td className="py-3 px-4">{r.team ?? r.name ?? "—"}</td>
                    <td className="py-3 px-4">{r.points ?? 0}</td>
                    <td className="py-3 px-4">{r.matches ?? 0}</td>
                    <td className="py-3 px-4">{r.wins ?? 0}</td>
                    <td className="py-3 px-4">
                      {typeof r.winRate === "number"
                        ? `${Math.round(r.winRate * 100)}%`
                        : typeof r.winRate === "string"
                        ? r.winRate
                        : "0%"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
