// app/dashboard/results/manual/manual-form.tsx
"use client";

import { submitBRBatch } from "@/app/actions/results";
import type { Game } from "@/lib/scoring";
import { useMemo, useState, useTransition } from "react";

/* --- tiny helpers --- */
function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2",
        props.className
      )}
    />
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2",
        props.className
      )}
    />
  );
}
function Button({
  children,
  variant = "default",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
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
    <button {...rest} className={cx(base, styles, rest.className)}>{children}</button>
  );
}

/* --- client form --- */
export default function ManualFormClient({
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-white/70 mb-1">Game</label>
          <Select value={game} onChange={(e) => setGame(e.target.value as Game)}>
            <option>BGMI</option>
            <option>Free Fire</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-white/70 mb-1">Match ID</label>
          <Input
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="e.g. BGMI-QUAL-01"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="primary" onClick={autofillPlacements}>
          Auto-fill Placements 1→25
        </Button>
        <Button type="button" variant="ghost" onClick={clear}>
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
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, ix) =>
                          ix === i ? { ...x, placement: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={r.kills}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, ix) =>
                          ix === i ? { ...x, kills: e.target.value } : x
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

      {/* team name suggestions from Teams sheet */}
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
  );
}
