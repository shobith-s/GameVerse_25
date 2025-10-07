import Link from 'next/link'


export function Footer() {
return (
<footer className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-white/60">
<nav className="flex items-center justify-center gap-6 mb-3">
<Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
<Link href="/matches" className="hover:text-white">Matches</Link>
<Link href="/dashboard/teams/register" className="hover:text-white">Register</Link>
</nav>
<p>© 2025 GameVerse. All rights reserved.</p>
</footer>
)
}