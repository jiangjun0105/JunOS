import type { Metadata } from 'next'
import { Exo_2, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { WindowManagerProvider } from '@/os/WindowManager'
import { DESCRIPTION } from '@/site'
import './globals.css'
import '@/city/city.css'

// Self-hosted by next/font (preloaded, size-adjusted fallbacks, no render-blocking
// @import). Each family is exposed as a CSS variable on <html>; tailwind.config.ts
// maps font-display / font-body / font-mono to them.
const exo = Exo_2({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-chrome',
  display: 'swap',
})
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JunOS',
  description: DESCRIPTION,
  icons: {
    icon: '/icons/reticle.svg',
    apple: '/icons/reticle-180.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions add attributes to <html> before hydration.
    <html
      lang="en"
      className={`${exo.variable} ${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <WindowManagerProvider>{children}</WindowManagerProvider>
      </body>
    </html>
  )
}
