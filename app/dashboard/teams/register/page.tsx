import { TeamRegisterForm } from '@/components/forms/team-register-form';

export default function RegisterTeamPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-surface/30 p-6">
        <h1 className="text-2xl md:text-3xl font-bold">Register Your Team</h1>
        <p className="text-white/70">Create a team with 4–5 players and choose your game.</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <TeamRegisterForm />
      </section>
    </div>
  );
}