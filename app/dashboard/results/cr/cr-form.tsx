"use client";

import { useMemo, useState, useTransition } from "react";
import { submitClashRoyaleResult } from "@/app/actions/results";

// Local lightweight type (keeps this decoupled from the server page file)
export type CRTeam = { id: string; name: string };

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

export default function CRForm({ teams }: { teams: CRTeam[] }) {
  const [matchId, setMatchId] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const [loserId, setLoserId] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const loserOptions = useMemo(
    () => teams.filter((t) => t.id !== winnerId),
    [teams, winnerId]
  );

  const swap = () => {
    setWinnerId((w) => {
      const prevWinner = w;
      setLoserId(prevWinner);
      return loserId;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (!matchId || !winnerId || !loserId) {
      setMsg("Fill match, winner and loser");
      return;
    }
    if (winnerId === loserId) {
      setMsg("Winner and loser must be different");
      return;
    }

    start(async () => {
      try {
        await submitClashRoyaleResult({
          matchId,
          winnerTeamId: winnerId,
          loserTeamId: loserId,
        });
        setMsg("Saved match result");
        setMatchId("");
        setWinnerId("");
        setLoserId("");
      } catch (e: any) {
        setMsg(e?.message || "Failed to save");
      }
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-sm text-white/70 mb-1">Match ID</label>
          <input
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="e.g. CR-ROUND1-05"
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Winner</label>
          <select
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2"
          >
            <option value="">Select team…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Loser</label>
          <select
            value={loserId}
            onChange={(e) => setLoserId(e.target.value)}
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2"
          >
            <option value="">Select team…</option>
            {loserOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={swap}
          className={cx(
            "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
            "bg-white/10 border-white/20 hover:bg-white/15"
          )}
        >
          Swap
        </button>
        <button
          type="submit"
          disabled={pending}
          className={cx(
            "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
            "bg-white text-black hover:bg-white/90",
            pending && "opacity-60 cursor-not-allowed"
          )}
        >
          Save Result
        </button>
        <span className="ml-auto text-white/70 text-sm">
          {pending ? "Saving…" : msg}
        </span>
      </div>

      <div className="text-xs text-white/50">
        Points rule: <b>Win = 3</b>, <b>Loss = 0</b>. Leaderboard updates automatically after save.
      </div>
    </form>
  );
}
