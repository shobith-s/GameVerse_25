'use server'
import { readSheet } from '@/lib/sheets';
import type { Game } from '@/lib/types';


export async function getLeaderboard(game: Game) {
const rows = await readSheet('Teams!A:L');
if (rows.length <= 1) return [] as any[];
const body = rows.slice(1);
const byGame = body.filter(r => r[2] === game && r[6] === 'active');
const mapped = byGame.map((r: any, i: number) => ({
rank: i + 1,
team_id: r[0], team_name: r[1],
points: parseInt(r[7] || '0'),
matches_played: parseInt(r[8] || '0'),
wins: parseInt(r[9] || '0'),
win_rate: (parseInt(r[8]||'0')>0) ? `${((parseInt(r[9]||'0')/parseInt(r[8]||'1'))*100).toFixed(1)}%` : '0%'
}));
mapped.sort((a,b) => b.points - a.points);
return mapped.map((t, idx) => ({ ...t, rank: idx+1 }));
}