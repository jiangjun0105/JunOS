import { ImageResponse } from 'next/og'
import { APPS, GLYPH, RETICLE } from '@/city/landmarks'

// Link-preview card per landmark: its map icon, label and place, rendered to PNG at
// build time (social sites don't show SVG). Colours mirror src/styles/theme.css,
// since the renderer can't read CSS variables.
const BG = '#02060a'
const ACCENT = '#ffb23f'
const CYAN = '#19e1ff'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return APPS.map((a) => ({ id: a.id }))
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const app = APPS.find((a) => a.id === id)
  if (!app) return new Response('Not found', { status: 404 })

  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46" fill="none" stroke="${ACCENT}" stroke-linecap="round" stroke-linejoin="round">${RETICLE}<svg x="13" y="13" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.6">${GLYPH[id]}</svg></svg>`

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: BG,
        gap: 28,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
      <img src={`data:image/svg+xml,${encodeURIComponent(icon)}`} width={300} height={300} alt="" />
      <div style={{ fontSize: 72, letterSpacing: 8, color: ACCENT, textTransform: 'uppercase' }}>
        {app.label}
      </div>
      <div style={{ fontSize: 30, letterSpacing: 6, color: CYAN }}>{`${app.place} · JUNOS`}</div>
    </div>,
    { width: 1200, height: 630 },
  )
}
