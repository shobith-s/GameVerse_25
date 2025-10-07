// app/dashboard/results/manual/page.tsx
import { getTeamNamesByGame, submitBRBatch } from "@/app/actions/results";
import { type Game } from "@/lib/scoring";

export const dynamic = "force-dynamic"; // always fresh in dev

export default async function ManualResultsPage() {
  const teamsByGame = await getTeamNamesByGame();
  return <ManualForm teamsByGame={teamsByGame} />;
}

/* ---------- Shared small UI helpers ---------- */
function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

function Select({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cx(
        "rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2",
        className
      )}
    >
      {children}
    </select>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value as any}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cx(
        "rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2",
        className
      )}
    />
  );
}

function Button({
  children,
  onClick,
  type = "button",
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "default" | "ghost" | "primary";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border";
  const styles =
    variant === "ghost"
      ? "bg-transparent border-white/10 hover:bg-white/5"
      : variant === "primary"
      ? "bg-white text-black border-white/10 hover:bg-white/90"
      : "bg-white/10 border-white/20";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(base, styles, disabled && "opacity-60 cursor-not-allowed")}
    >
      {children}
    </button>
  );
}

/* ---------- Client component ---------- */
"use client";
import { useMemo, useState, useTransition } from "react";

function ManualForm({
  teamsByGame,
}: {
  teamsByGame: Record<Game, string[]>;
}) {
  const [game, setGame] = useState<Game>("BGMI");
  const [matchId, setMatchId] = useState("");
  const [rows, setRows] = useState(
    Array.from({ length: 25 }, () => ({
      teamName: "",
      placement: "",
      kills: "",
    }))
  );
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string>("");

  const teamNames = useMemo(() => teamsByGame[game] || [], [teamsByGame, game]);

  const autofillPlacements = () =>
    setRows((r) => r.map((x, i) => ({ ...x, placement: String(i + 1) })));
  const clear = () => {
    setRows(
      Array.from({ length: 25 }, () => ({
        teamName: "",
        placement: "",
        kills: "",
      }))
    );
    setMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entries = rows
      .filter((r) => r.teamName)
      .map((r) => ({
        teamName: r.teamName.trim(),
        placement: Number(r.placement || 0),
        kills: Number(r.kills || 0),
      }));

    start(async () => {
      const res = await submitBRBatch({
        matchId,
        game: game as Exclude<Game, "Clash Royale">,
        entries,
      });
      if (res.unknown.length)
        setMessage(
          `Saved ${res.appended} rows. Unknown teams: ${res.unknown.join(", ")}`
        );
      else setMessage(`Saved ${res.appended} rows.`);
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h1 className="text-2xl font-bold">Manual Results Entry</h1>
        <p className="text-white/60">
          Fast grid for BGMI / Free Fire (team placement + kills)
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Game</label>
            <Select value={game} onChange={(v) => setGame(v as Game)}>
              <option>BGMI</option>
              <option>Free Fire</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-white/70 mb-1">
              Match ID
            </label>
            <Input
              value={matchId}
              onChange={setMatchId}
              placeholder="e.g. BGMI-QUAL-01"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={autofillPlacements}>
            Auto-fill Placements 1→25
          </Button>
          <Button variant="ghost" onClick={clear}>
            Clear
          </Button>
          <div className="ml-auto text-white/70 text-sm">
            {pending ? "Saving…" : message}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-white/70">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-left">Placement</th>
                <th className="p-3 text-left">Kills</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="p-2 text-white/60">{i + 1}</td>
                  <td className="p-2">
                    <input
                      list="team-list"
                      value={r.teamName}
                      onChange={(e) => {
                        const v = e.target.value;
                        setRows((prev) =>
                          prev.map((x, ix) =>
                            ix === i ? { ...x, teamName: v } : x
                          )
                        );
                      }}
                      placeholder="Exact team name"
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.placement}
                      onChange={(v) =>
                        setRows((prev) =>
                          prev.map((x, ix) =>
                            ix === i ? { ...x, placement: v } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.kills}
                      onChange={(v) =>
                        setRows((prev) =>
                          prev.map((x, ix) =>
                            ix === i ? { ...x, kills: v } : x
                          )
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <datalist id="team-list">
          {teamNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending} variant="primary">
            Submit Results
          </Button>
        </div>
      </form>
    </div>
  );
}
