"use client";

import { useState, useTransition } from "react";
import { submitBRBatch } from "@/app/actions/results";

// Keep a local union so this file stays client-only
export type BRGame = "BGMI" | "Free Fire";

type Parsed = { teamName: string; placement: number; kills: number };

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

function parseInput(text: string): Parsed[] {
  // Accept CSV or TSV or pasted table. Skip header if present.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rows: Parsed[] = [];
  for (const line of lines) {
    const parts = line.split(/[\t,]/).map((p) => p.trim());
    if (parts.length < 3) continue;
    const [name, placeStr, killsStr] = parts;
    if (!name || !/\d+/.test(placeStr)) {
      // likely a header row like: team_name,placement,kills
      if (/team/i.test(name) && /place/i.test(placeStr)) continue;
    }
    rows.push({ teamName: name, placement: Number(placeStr || 0), kills: Number(killsStr || 0) });
  }
  return rows;
}

export default function UploadForm() {
  const [game, setGame] = useState<BRGame>("BGMI");
  const [matchId, setMatchId] = useState("");
  const [raw, setRaw] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    const entries = parseInput(raw);
    if (!matchId || entries.length === 0) {
      setMsg("Provide a match id and at least one row");
      return;
    }

    start(async () => {
      try {
        const res = await submitBRBatch({
          matchId,
          game,
          entries,
        });
        if (res.unknown.length) {
          setMsg(`Saved ${res.appended} rows. Unknown teams: ${res.unknown.join(", ")}`);
        } else {
          setMsg(`Saved ${res.appended} rows.`);
        }
        setRaw("");
      } catch (e: any) {
        setMsg(e?.message || "Failed to save");
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-white/70 mb-1">Game</label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value as BRGame)}
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2"
          >
            <option>BGMI</option>
            <option>Free Fire</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-white/70 mb-1">Match ID</label>
          <input
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="e.g. BGMI-QUAL-03"
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1">Paste CSV / Table</label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={`team_name,placement,kills\nTeam Alpha,1,12\nTeam Beta,2,9`}
          rows={10}
          className="w-full resize-y rounded-2xl bg-white/[0.03] border border-white/10 px-3 py-2 font-mono text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className={cx(
            "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
            "bg-white text-black hover:bg-white/90",
            pending && "opacity-60 cursor-not-allowed"
          )}
        >
          Save Results
        </button>
        <span className="ml-auto text-white/70 text-sm">{pending ? "Saving…" : msg}</span>
      </div>

      <div className="text-xs text-white/50">
        Format: <code>team_name,placement,kills</code>. Unknown team names will be reported; ensure they match <b>Teams</b> tab.
      </div>
    </form>
  );
}
