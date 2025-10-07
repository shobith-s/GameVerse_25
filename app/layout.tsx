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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Header />
        <main>
          {/* Single, shared container for all routes */}
          <div className="mx-auto w-full max-w-3xl px-4 py-8">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  )
}