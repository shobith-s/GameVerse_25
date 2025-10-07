// app/dashboard/results/manual/page.tsx
import { getTeamNamesByGame } from "@/app/actions/results";
import ManualFormClient from "./manual-form";

export const dynamic = "force-dynamic"; // keep fresh while entering results

export default async function ManualResultsPage() {
  const teamsByGame = await getTeamNamesByGame();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h1 className="text-2xl font-bold">Manual Results Entry</h1>
        <p className="text-white/60">
          Fast grid for BGMI / Free Fire (team placement + kills)
        </p>
      </section>

      <ManualFormClient teamsByGame={teamsByGame} />
    </div>
  );
}
