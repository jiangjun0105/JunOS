import type { Metadata } from 'next'
import { Exo_2, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { WindowManagerProvider } from '@/os/WindowManager'
import './globals.css'

// Self-hosted by next/font (preloaded, size-adjusted fallbacks, no render-blocking
// @import). Each family is exposed as a CSS variable on <html>; tailwind.config.ts
// maps font-display / font-body / font-mono to them.
const exo = Exo_2({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-chrome', display: 'swap' })
const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-body', display: 'swap' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'JunOS',
  description: 'Jun Jiang, AI engineer: agent harnesses and a digital fly brain, on a 3D map of San Francisco.',
  icons: {
    icon: '/icons/reticle.svg',
    apple: '/icons/reticle-180.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (and any future theme script)
    // can add attributes to <html> before React hydrates; this ignores attribute
    // mismatches on THIS element only (one level deep), not the rest of the tree.
    // The font classNames define --font-chrome / --font-body / --font-mono on <html>.
    <html lang="en" className={`${exo.variable} ${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body>
        {/* The provider lives in the LAYOUT so the open window persists across navigations. */}
        <WindowManagerProvider>{children}</WindowManagerProvider>
      </body>
    </html>
  )
}
