import Link from "next/link";
import { Gamepad2, Zap, Target, Ribbon, Trophy, ChevronRight, Users2, Gamepad, Calendar as CalendarIcon } from "lucide-react";

/**
 * Mobile‑first landing page matching the reference UI.
 * NOTE: Removed Tailwind arbitrary values (e.g., bg-[hsl(...)] and supports-[...]:)
 * to avoid runtime parsing errors in some environments. Uses theme tokens instead.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/30 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          <span className="font-semibold">GameVerse '25</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-10">
        {/* Hero */}
        <section className="rounded-3xl border border-white/10 bg-surface/30 p-5 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
            <Zap className="h-4 w-4" />
            <span>Inter-College Gaming 2025</span>
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Welcome to<br/>GameVerse '25</h1>
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

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard icon={<Users2 className="h-6 w-6" />} value="7" label="Teams" />
          <StatCard icon={<Trophy className="h-6 w-6" />} value="5" label="Matches" />
          <StatCard icon={<Gamepad className="h-6 w-6" />} value="3" label="Games" />
        </section>

        {/* Featured Games */}
        <section className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Games</h2>
            <p className="text-white/60">Compete in three exciting battle royale and strategy games</p>
          </div>
          <div className="space-y-4">
            <GameCard
              icon={<Target className="h-6 w-6" />}
              title="BGMI"
              tag="Battle Royale"
              bullets={["Squad-based gameplay", "Points for kills and placement", "Multiple matches per tournament"]}
            />
            <GameCard
              icon={<Zap className="h-6 w-6" />}
              title="Free Fire"
              tag="Battle Royale"
              bullets={["Quick matches", "Character-based abilities", "Strategic team play"]}
            />
            <GameCard
              icon={<Ribbon className="h-6 w-6" />}
              title="Clash Royale"
              tag="Strategy"
              bullets={["1v1 competitive matches", "Strategic deck building", "Win-based scoring"]}
            />
          </div>
        </section>

        {/* Upcoming Matches */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Upcoming Matches</h2>
              <p className="text-white/60 -mt-1">Don't miss these exciting matchups</p>
            </div>
            <Link href="/matches" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-3 py-2 hover:bg-white/10">
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="space-y-3">
            <MatchCard title="BGMI - Match 1" date="Feb 1, 2025" time="03:00 PM" />
            <MatchCard title="BGMI - Match 2" date="Feb 1, 2025" time="05:00 PM" />
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
            <p className="text-white/60">Simple steps to join the competition</p>
          </div>
          <div className="space-y-10">
            <Step num={1} title="Register Team" desc="Create your team with 4–5 players from your college" />
            <Step num={2} title="Join Matches" desc="Participate in scheduled tournament matches" />
            <Step num={3} title="Submit Results" desc="Upload screenshots and submit your match results" />
            <Step num={4} title="Climb Leaderboard" desc="Earn points and compete for the top spot" />
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-3xl border border-white/10 bg-surface/30 p-6 md:p-8 text-center space-y-5">
          <Trophy className="h-10 w-10 mx-auto" />
          <h3 className="text-2xl font-bold">Ready to Compete?</h3>
          <p className="text-white/60 max-w-md mx-auto">Join hundreds of players in the ultimate inter-college gaming tournament</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <Link href="/dashboard/teams/register" className="inline-flex items-center justify-center rounded-xl px-4 py-3 bg-white text-black font-semibold hover:bg-white/90">
              Register Your Team <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/leaderboard" className="inline-flex items-center justify-center rounded-xl px-4 py-3 border border-white/20 hover:bg-white/10 font-semibold">
              View Leaderboard
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-white/60 space-y-3">
          <nav className="flex items-center justify-center gap-6">
            <Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
            <Link href="/matches" className="hover:text-white">Matches</Link>
            <Link href="/dashboard/teams/register" className="hover:text-white">Register</Link>
          </nav>
          <p>© 2025 GameVerse. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-white/10">
        {icon}
      </div>
      <div className="text-3xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-white/60 text-sm">{label}</div>
    </div>
  );
}

function GameCard({ icon, title, tag, bullets }: { icon: React.ReactNode; title: string; tag: string; bullets: string[] }) {
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
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">Scheduled</div>
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
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl font-bold">{num}</div>
      <h4 className="text-xl font-semibold">{title}</h4>
      <p className="text-white/60 max-w-sm">{desc}</p>
    </div>
  );
}
