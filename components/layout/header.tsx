'use client'
import { Gamepad2 } from 'lucide-react'
import Link from 'next/link'


export function Header() {
return (
<header className="sticky top-0 z-30 bg-black/30 backdrop-blur border-b border-white/10">
<div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
<Link href="/" className="flex items-center gap-2 font-semibold">
<Gamepad2 className="h-5 w-5" />
<span>GameVerse &apos;25</span>
</Link>
<nav className="hidden sm:flex items-center gap-4 text-sm text-white/80">
<Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
<Link href="/matches" className="hover:text-white">Matches</Link>
<Link href="/dashboard/teams/register" className="hover:text-white">Register</Link>
</nav>
</div>
</header>
)
}