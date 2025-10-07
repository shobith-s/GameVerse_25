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
        {/* Let pages control their own width/padding */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
