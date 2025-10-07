import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'


export const metadata: Metadata = {
title: "GameVerse '25",
description: 'Mobile-first tournaments and leaderboards',
}


export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="en">
<body className="min-h-screen bg-background text-foreground">
<Header />
<main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
<Footer />
</body>
</html>
)
}