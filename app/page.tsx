// app/page.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Zap,
  ChevronRight,
  Trophy,
  Users2,
  Gamepad,
  Target,
  Ribbon,
  Calendar as CalendarIcon,
} from "lucide-react";
import { getCounts } from "@/lib/teams";

// Revalidate (ISR) every 60s so counts update without full SSR on every hit
export const revalidate = 60;

/* ---------- Small helper UI blocks (server-only; no client hooks) ---------- */
function Stat({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-white/10">{icon}</div>
      <div className="text-3xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-white/60 text-sm">{label}</div>
    </div>
  );
}

function GameCard({
  icon,
  title,
  tag,
  bullets,
}: {
  icon: ReactNode;
  title: string;
  tag: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">{icon}</div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm">{tag}</span>
      </div>
      <ul className="mt-3 space-y-2 text-white/80">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-white/70" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchCard({ title, date, time }: { title: string; date: string; time: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
        Scheduled
      </div>
      <h4 className="mt-3 text-xl font-semibold">{title}</h4>
      <div className="mt-2 flex items-center gap-3 text-white/70">
        <CalendarIcon className="h-4 w-4" />
        <span>{date}</span>
        <span>•</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl font-bold">
        {num}
      </div>
      <h4 className="text-xl font-semibold">{title}</h4>
      <p className="text-white/60 max-w-sm">{desc}</p>
    </div>
  );
}

/* ---------- Page ---------- */
export default async function HomePage() {
  const counts = await getCounts();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-3xl border border-white/10 bg-surface/30 p-5 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
          <Zap className="h-4 w-4" />
          <span>Inter-College Gaming 2025</span>
        </div>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
          Welcome to
          <br />
          GameVerse &apos;25
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

      {/* Dynamic Stats (from Google Sheets) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat icon={<Users2 className="h-5 w-5" />} value={counts.teams} label="Teams" />
        <Stat icon={<Trophy className="h-5 w-5" />} value={counts.matches} label="Matches" />
        <Stat icon={<Gamepad className="h-5 w-5" />} value={counts.games} label="Games" />
      </section>

      {/* Featured Games */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-center">Featured Games</h2>
        <p className="text-center text-white/60">Compete in three exciting battle royale and strategy games</p>
        <div className="space-y-4">
          <GameCard
            icon={<Target className="h-5 w-5" />}
            title="BGMI"
            tag="Battle Royale"
            bullets={["Squad-based gameplay", "Points for kills and placement", "Multiple matches per tournament"]}
          />
          <GameCard
            icon={<Zap className="h-5 w-5" />}
            title="Free Fire"
            tag="Battle Royale"
            bullets={["Quick matches", "Character-based abilities", "Strategic team play"]}
          />
          <GameCard
            icon={<Ribbon className="h-5 w-5" />}
            title="Clash Royale"
            tag="Strategy"
            bullets={["1v1 competitive matches", "Strategic deck building", "Win-based scoring"]}
          />
        </div>
      </section>

      {/* Upcoming Matches (static sample) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upcoming Matches</h2>
          <Link href="/leaderboard" className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          <MatchCard title="BGMI - Match 1" date="Feb 1, 2025" time="03:00 PM" />
          <MatchCard title="BGMI - Match 2" date="Feb 1, 2025" time="06:00 PM" />
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <p className="text-center text-white/60">Simple steps to join the competition</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Step num={1} title="Register Team" desc="Create your team with 4–5 players from your college" />
          <Step num={2} title="Join Matches" desc="Participate in scheduled tournament matches" />
          <Step num={3} title="Submit Results" desc="Upload screenshots and submit your match results" />
          <Step num={4} title="Climb Leaderboard" desc="Earn points and compete for the top spot" />
        </div>
      </section>
    </div>
  );
}
