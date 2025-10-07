import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal } from 'lucide-react'


interface LeaderboardData {
rank: number
team_id: string
team_name: string
points: number
matches_played: number
wins: number
win_rate: string
}


export function LeaderboardTable({ data }: { data: LeaderboardData[] }) {
const icon = (rank: number) => rank === 1 ? <Trophy className="w-5 h-5"/> : rank <= 3 ? <Medal className="w-5 h-5"/> : null


return (
<div className="bg-white/[0.03] rounded-3xl border border-white/10 overflow-hidden">
{/* Mobile cards */}
<div className="md:hidden space-y-3 p-4">
{data.map(team => (
<Link key={team.team_id} href={`/teams/${team.team_id}`} className="block bg-surface/40 rounded-2xl p-4 border border-white/10 hover:border-white/20 transition">
<div className="flex items-start justify-between mb-2">
<div className="flex items-center gap-2">{icon(team.rank)}<span className="text-lg font-bold">#{team.rank}</span></div>
<Badge variant="secondary">{team.points} pts</Badge>
</div>
<h3 className="font-semibold text-base mb-2">{team.team_name}</h3>
<div className="flex gap-4 text-sm text-white/70"><span>Matches: {team.matches_played}</span><span>Wins: {team.wins}</span><span>Win Rate: {team.win_rate}</span></div>
</Link>
))}
</div>


{/* Desktop table */}
<table className="hidden md:table w-full text-sm">
<thead className="bg-surface/40">
<tr>
<th className="text-left p-3 w-20">Rank</th>
<th className="text-left p-3">Team</th>
<th className="text-right p-3">Points</th>
<th className="text-right p-3">Matches</th>
<th className="text-right p-3">Wins</th>
<th className="text-right p-3">Win Rate</th>
</tr>
</thead>
<tbody>
{data.map(team => (
<tr key={team.team_id} className="border-t border-white/10 hover:bg-surface/30">
<td className="p-3"><div className="flex items-center gap-2">{icon(team.rank)}<span className="font-medium">{team.rank}</span></div></td>
<td className="p-3"><Link href={`/teams/${team.team_id}`} className="hover:text-white font-medium">{team.team_name}</Link></td>
<td className="p-3 text-right font-semibold">{team.points}</td>
<td className="p-3 text-right">{team.matches_played}</td>
<td className="p-3 text-right">{team.wins}</td>
<td className="p-3 text-right">{team.win_rate}</td>
</tr>
))}
</tbody>
</table>
</div>
)
}