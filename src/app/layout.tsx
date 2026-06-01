import type { Metadata } from 'next'
import { Dosis, Hanken_Grotesk } from 'next/font/google'
import { OSRoot } from '@/os/OSRoot'
import { WindowManagerProvider } from '@/os/WindowManager'
import './globals.css'

// Fonts (Dosis for chrome, Hanken Grotesk for body) are self-hosted by
// next/font/google instead of a render-blocking Google Fonts @import. next/font
// downloads the files at build time, preloads them, and emits a `size-adjust`
// fallback to avoid layout shift — so there's no extra DNS/connect to
// fonts.googleapis.com / fonts.gstatic.com on the critical path.
//
// Each call exposes its family as a CSS variable (--font-chrome / --font-body),
// which we attach to <html> below. tailwind.config.ts maps the `font-chrome` /
// `font-display` / `font-body` utilities to those same vars, so next/font is now
// the single source of truth for the families (theme.css no longer hardcodes them).
// The weights mirror the old @import: Dosis 400–800, Hanken Grotesk 400–700.
const dosis = Dosis({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-chrome',
  display: 'swap',
})
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JunOS',
  description: 'A desktop OS in the browser.',
  icons: {
    icon: '/icons/gear.png',
    apple: '/icons/gear.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (and any future theme script)
    // can add attributes to <html> before React hydrates; this ignores attribute
    // mismatches on THIS element only (one level deep), not the rest of the tree.
    // The two font className hooks define --font-chrome / --font-body on <html>.
    <html lang="en" className={`${dosis.variable} ${hanken.variable}`} suppressHydrationWarning>
      <body>
        {/*
          The provider + OSRoot live in the LAYOUT so the desktop and all open
          windows persist across navigations. `children` (the page) renders as
          the desktop; windows float in a layer on top of it.
        */}
        <WindowManagerProvider>
          <OSRoot>{children}</OSRoot>
        </WindowManagerProvider>
      </body>
    </html>
  )
}
