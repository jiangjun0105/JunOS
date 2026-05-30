import type { Metadata } from 'next'
import { Zen_Maru_Gothic } from 'next/font/google'
import { OSRoot } from '@/os/OSRoot'
import { WindowManagerProvider } from '@/os/WindowManager'
import './globals.css'

// Zen Maru Gothic — soft, rounded, storybook type for the Totoro reskin.
const sans = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'cozy-os',
  description: 'A cozy desktop in a sunny Totoro forest — windows in the browser.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (and any future theme script)
    // can add attributes to <html> before React hydrates; this ignores attribute
    // mismatches on THIS element only (one level deep), not the rest of the tree.
    <html lang="en" className={sans.variable} suppressHydrationWarning>
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
