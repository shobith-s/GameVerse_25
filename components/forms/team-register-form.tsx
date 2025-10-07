'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerTeam } from '@/app/actions/teams';

const TeamSchema = z
  .object({
    team_name: z.string().min(2, 'Team name is required'),
    college: z.string().min(2, 'College is required'),
    game: z.enum(['BGMI', 'Free Fire', 'Clash Royale'], { required_error: 'Pick a game' }),
    captain_name: z.string().min(2, 'Captain name is required'),
    captain_email: z.string().email('Valid email required'),
    captain_phone: z.string().min(7, 'Phone required'),
    player2: z.string().optional(),
    player3: z.string().optional(),
    player4: z.string().optional(),
    player5: z.string().optional(),
    agree: z.literal(true, { errorMap: () => ({ message: 'You must agree to the rules' }) }),
  })
  .superRefine((val, ctx) => {
    // BGMI / Free Fire require squad (players 2–4). Clash Royale is solo.
    if (val.game !== 'Clash Royale') {
      (['player2', 'player3', 'player4'] as const).forEach((field) => {
        const v = (val as any)[field];
        if (!v || v.trim().length < 2) {
          ctx.addIssue({ code: 'custom', path: [field], message: 'Required for squad games' });
        }
      });
    }
  });

export type TeamForm = z.infer<typeof TeamSchema>;

export function TeamRegisterForm() {
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<TeamForm>({ resolver: zodResolver(TeamSchema) });

  const game = watch('game');

  const onSubmit = async (data: TeamForm) => {
    setStatus(null);
    const res = await registerTeam(data);
    if (res.ok) {
      setStatus({ ok: true, msg: `Team registered! ID: ${res.id}` });
      reset();
    } else {
      setStatus({ ok: false, msg: res.error || 'Something went wrong' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Team Name" error={errors.team_name?.message}>
          <input
            {...register('team_name')}
            className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            placeholder="Nebula Titans"
          />
        </Field>

        <Field label="College" error={errors.college?.message}>
          <input
            {...register('college')}
            className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            placeholder="ACME Institute"
          />
        </Field>

        <Field label="Game" error={errors.game?.message}>
          <select
            {...register('game')}
            className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            <option value="">Select a game</option>
            <option>BGMI</option>
            <option>Free Fire</option>
            <option>Clash Royale</option>
          </select>
        </Field>
      </div>

      <div className="rounded-2xl border border-white/10 p-4 bg-surface/20">
        <h3 className="font-semibold mb-3">Captain Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Name" error={errors.captain_name?.message}>
            <input
              {...register('captain_name')}
              className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="Aarav Kumar"
            />
          </Field>
          <Field label="Email" error={errors.captain_email?.message}>
            <input
              type="email"
              {...register('captain_email')}
              className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="captain@college.edu"
            />
          </Field>
          <Field label="Phone" error={errors.captain_phone?.message}>
            <input
              {...register('captain_phone')}
              className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="98765 43210"
            />
          </Field>
        </div>
      </div>

      {game !== 'Clash Royale' ? (
        <div className="rounded-2xl border border-white/10 p-4 bg-surface/20">
          <h3 className="font-semibold mb-3">Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Player 2" error={errors.player2?.message}>
              <input
                {...register('player2')}
                className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                placeholder="Player 2 name"
              />
            </Field>
            <Field label="Player 3" error={errors.player3?.message}>
              <input
                {...register('player3')}
                className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                placeholder="Player 3 name"
              />
            </Field>
            <Field label="Player 4" error={errors.player4?.message}>
              <input
                {...register('player4')}
                className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                placeholder="Player 4 name"
              />
            </Field>
            <Field label="Player 5 (optional)" error={errors.player5?.message}>
              <input
                {...register('player5')}
                className="w-full rounded-xl bg-surface/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                placeholder="Player 5 name"
              />
            </Field>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 p-4 bg-surface/20">
          <h3 className="font-semibold mb-1">Solo Game</h3>
          <p className="text-sm text-white/70">
            Clash Royale is a 1v1 game. No additional player names required.
          </p>
        </div>
      )}

      <label className="flex items-start gap-3 text-sm text-white/80">
        <input
          type="checkbox"
          {...register('agree')}
          className="mt-1 h-4 w-4 rounded border-white/20 bg-surface/30"
        />
        <span>I confirm our players are from the same college and agree to the tournament rules.</span>
      </label>
      {errors.agree && <p className="text-red-400 text-sm">{errors.agree.message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          disabled={isSubmitting}
          className="rounded-xl px-4 py-3 bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-70"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Registration'}
        </button>
        <a
          href="/leaderboard"
          className="inline-flex items-center justify-center rounded-xl px-4 py-3 border border-white/20 hover:bg-white/10 font-semibold"
        >
          View Leaderboard
        </a>
      </div>

      {status && (
        <div
          className={`rounded-2xl border p-4 ${
            status.ok ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
          }`}
        >
          {status.msg}
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-white/80">{label}</span>
      {children}
      {error && <span className="mt-1 block text-red-400">{error}</span>}
    </label>
  );
}
