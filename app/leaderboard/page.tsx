import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { getLeaderboard } from '@/app/actions/leaderboard'


export default async function LeaderboardPage() {
const bgmi = await getLeaderboard('BGMI')
const ff = await getLeaderboard('Free Fire')
const cr = await getLeaderboard('Clash Royale')


return (
<div className="space-y-6">
<section className="rounded-3xl border border-white/10 bg-surface/30 p-6">
<h1 className="text-2xl md:text-3xl font-bold">Leaderboard</h1>
<p className="text-white/60">Track team rankings across all games</p>
</section>


<section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
<Tabs defaultValue="bgmi" className="w-full">
<TabsList className="w-full grid grid-cols-3 gap-2">
<TabsTrigger value="bgmi">BGMI</TabsTrigger>
<TabsTrigger value="ff">Free Fire</TabsTrigger>
<TabsTrigger value="cr">Clash Royale</TabsTrigger>
</TabsList>
<TabsContent value="bgmi" className="mt-6"><LeaderboardTable data={bgmi} /></TabsContent>
<TabsContent value="ff" className="mt-6"><LeaderboardTable data={ff} /></TabsContent>
<TabsContent value="cr" className="mt-6"><LeaderboardTable data={cr} /></TabsContent>
</Tabs>
</section>
</div>
)
}