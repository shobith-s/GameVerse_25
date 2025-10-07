// app/dashboard/results/upload/page.tsx
import { submitBRBatch } from "@/app/actions/results";
import type { Game } from "@/lib/scoring";

export const dynamic = "force-dynamic"; // keep fresh while entering results

export default function UploadResultsPage() {
  return <UploadClient />;
}

/* ----------------------- Client ----------------------- */
"use client";
import { useState, useTransition } from "react";

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

function parseLines(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows = lines.map((l) => l.split(/,|\t/).map((c) => c.trim()));
  return rows;
}

export type BRPreviewRow = { teamName: string; placement: number; kills: number };

function UploadClient() {
  const [game, setGame] = useState<Exclude<Game, "Clash Royale">>("BGMI");
  const [matchId, setMatchId] = useState("");
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<BRPreviewRow[]>([]);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const doPreview = () => {
    const rows = parseLines(raw);
    // Accept header: match_id,team_name,placement,kills (match_id column is ignored; we use form field)
    const body = rows[0] && /match/i.test(rows[0][0]) ? rows.slice(1) : rows;
    const parsed: BRPreviewRow[] = body
      .filter((cols) => cols.length > 0)
      .map((cols) => ({
        teamName: cols[1] || cols[0] || "",
        placement: Number(cols[2] ?? cols[1] ?? 0) || 0,
        kills: Number(cols[3] ?? cols[2] ?? 0) || 0,
      }))
      .filter((r) => r.teamName);
    setPreview(parsed);
    setMsg(parsed.length ? `Parsed ${parsed.length} rows` : "Nothing parsed. Check your CSV format.");
  };

  const onSubmit = () => {
    if (!matchId) {
      setMsg("Enter a Match ID first");
      return;
    }
    if (preview.length === 0) {
      setMsg("No rows to submit. Paste CSV and click Preview.");
      return;
    }

    start(async () => {
      const res = await submitBRBatch({ matchId, game, entries: preview });
      if (res.unknown.length) setMsg(`Saved ${res.appended} rows. Unknown teams: ${res.unknown.join(", ")}`);
      else setMsg(`Saved ${res.appended} rows.`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h1 className="text-2xl font-bold">Upload Results</h1>
        <p className="text-white/60">Paste CSV/TSV for BGMI / Free Fire: <code>team_name,placement,kills</code></p>
      </section>

      {/* Form */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Game</label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value as any)}
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
              placeholder="e.g. BGMI-QUAL-01"
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2"
            />
          </div>
        </div>

        <label className="block text-sm text-white/70 mb-1">Paste CSV / TSV</label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          placeholder={`team_name,placement,kills\nTeam A,1,12\nTeam B,2,9`}
          className="w-full rounded-2xl bg-white/[0.03] border border-white/10 p-3"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={doPreview}
            className={cx(
              "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
              "bg-white/10 border-white/20 hover:bg-white/15"
            )}
          >
            Preview
          </button>
          <button
            onClick={onSubmit}
            disabled={pending || preview.length === 0}
            className={cx(
              "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
              "bg-white text-black hover:bg-white/90",
              pending || preview.length === 0 ? "opacity-60 cursor-not-allowed" : ""
            )}
          >
            Submit
          </button>
          <span className="ml-auto text-white/70 text-sm">{pending ? "Saving…" : msg}</span>
        </div>

        {preview.length > 0 && (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-white/70">
                <tr>
                  <th className="p-2 text-left">Team</th>
                  <th className="p-2 text-left">Placement</th>
                  <th className="p-2 text-left">Kills</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="p-2">{r.teamName}</td>
                    <td className="p-2">{r.placement}</td>
                    <td className="p-2">{r.kills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
