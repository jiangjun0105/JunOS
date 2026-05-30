import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { OSRoot } from '@/os/OSRoot'
import { WindowManagerProvider } from '@/os/WindowManager'
import './globals.css'

// Soft, rounded type to match the cozy 3D / claymorphism look.
const sans = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'cozy-os',
  description: 'A desktop OS in the browser.',
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
