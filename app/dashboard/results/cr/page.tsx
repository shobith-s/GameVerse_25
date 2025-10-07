import { getRange } from "@/lib/sheets";
import CRForm from "./cr-form";


export const dynamic = "force-dynamic";


export type CRTeam = { id: string; name: string };


export default async function CRResultsPage() {
// Load Clash Royale teams (active only)
const rows = await getRange("Teams!A2:J");
const teams: CRTeam[] = rows
.map((r) => ({
id: r[0]?.toString() || "",
name: r[1]?.toString() || "",
game: (r[2]?.toString() || ""),
status: (r[6]?.toString() || "").toLowerCase(),
}))
.filter((t) => t.id && t.name && t.game === "Clash Royale" && t.status !== "archived")
.sort((a, b) => a.name.localeCompare(b.name))
.map(({ id, name }) => ({ id, name }));


return (
<div className="space-y-6">
<section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
<h1 className="text-2xl font-bold">Clash Royale — Record Match</h1>
<p className="text-white/60">Pick winner & loser for a match. Points: 3 for win, 0 for loss.</p>
</section>


<CRForm teams={teams} />
</div>
);
}