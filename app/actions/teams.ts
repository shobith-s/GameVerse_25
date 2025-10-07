'use server';

import { z } from 'zod';
import { appendRow } from '@/lib/sheets';

const TeamSchema = z
  .object({
    team_name: z.string().min(2),
    college: z.string().min(2),
    game: z.enum(['BGMI', 'Free Fire', 'Clash Royale']),
    captain_name: z.string().min(2),
    captain_email: z.string().email(),
    captain_phone: z.string().min(7),
    player2: z.string().optional(),
    player3: z.string().optional(),
    player4: z.string().optional(),
    player5: z.string().optional(),
    agree: z.literal(true),
  })
  .superRefine((val, ctx) => {
    if (val.game !== 'Clash Royale') {
      (['player2', 'player3', 'player4'] as const).forEach((f) => {
        const v = (val as any)[f];
        if (!v || v.trim().length < 2) {
          ctx.addIssue({ code: 'custom', path: [f], message: 'Required for squad games' });
        }
      });
    }
  });

export type TeamForm = z.infer<typeof TeamSchema>;

export async function registerTeam(form: TeamForm) {
  try {
    const data = TeamSchema.parse(form);
    const id = `t_${Date.now()}`;

    // Columns A:O must match your Teams header
    const row = [
      id,
      data.team_name,
      data.game,
      data.college,
      data.captain_name,
      data.captain_email,
      'active',
      0,
      0,
      0,
      data.captain_phone,
      data.player2 ?? '',
      data.player3 ?? '',
      data.player4 ?? '',
      data.player5 ?? '',
    ];

    await appendRow('Teams!A:O', row);
    return { ok: true as const, id };
  } catch (err: any) {
    return { ok: false as const, error: String(err?.message || err) };
  }
}
