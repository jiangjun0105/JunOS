'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { APPS } from '@/city/landmarks'
import type { City } from '@/city/scene'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { apps, isAppId } from './apps'
import { windowKey } from './url'
import { useWindows, windowTitle } from './WindowManager'
import { WindowUrlSync } from './WindowUrlSync'

/**
 * The desktop: San Francisco in 3D (src/city), with each app as a reticle over a
 * landmark, and ONE window. The window is hidden → `peek` (hovering an icon shows
 * a small card in the top-right corner) → `open` (click: it grows from that card,
 * holding the corner, while the camera swings to the landmark and pushes in).
 */
type Rect = { x: number; y: number; w: number; h: number }

const PEEK = { w: 320, h: 168 }
const OPEN = { left: 0.36, top: 56, m: 20, compact: 720, max: 1600 } // below `compact` px wide the open window takes the full width; never wider than `max`

const peekRect = (W: number): Rect => ({
  x: W - PEEK.w - OPEN.m,
  y: OPEN.top,
  w: PEEK.w,
  h: PEEK.h,
}) // shares the open window's top-right corner
function openRect(W: number, H: number): Rect {
  const x = W < OPEN.compact ? OPEN.m : Math.max(Math.round(W * OPEN.left), W - OPEN.m - OPEN.max)
  return { x, y: OPEN.top, w: W - x - OPEN.m, h: H - OPEN.top - OPEN.m }
}
const openShift = (W: number) => (W - openRect(W, 0).x) / 2 // centres the landmark in the strip left of the open window
const deg = (v: number) => Math.abs(v).toFixed(4) + '°'

export function CityDesktop() {
  const { win, openApp, close, canGoBack, back } = useWindows()
  const rootRef = useRef<HTMLDivElement>(null)
  const winRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [city, setCity] = useState<City | null>(null)
  const [status, setStatus] = useState('LOADING ELEVATION + OPENSTREETMAP …')
  const [peekId, setPeekId] = useState<string | null>(null)
  const [size, setSize] = useState({ W: 0, H: 0 })

  // three.js and the map data load only in the browser, after first paint
  useEffect(() => {
    let made: City | null = null
    let dead = false
    let peekTimer = 0
    import('@/city/scene').then(({ createCity }) => {
      if (dead || !rootRef.current) return
      made = createCity(rootRef.current, {
        open: (id: string) => isAppId(id) && openApp(id),
        hover: (id: string | null) => {
          clearTimeout(peekTimer)
          if (id) setPeekId(id)
          else peekTimer = window.setTimeout(() => setPeekId(null), 150)
        },
        status: setStatus,
      })
      setCity(made)
    })
    return () => {
      dead = true
      clearTimeout(peekTimer)
      made?.dispose()
    }
  }, [openApp])

  useEffect(() => {
    const onResize = () => setSize({ W: innerWidth, H: innerHeight })
    onResize()
    addEventListener('resize', onResize)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('resize', onResize)
      removeEventListener('keydown', onKey)
    }
  }, [close])

  // the window drives the camera: open → fly to its landmark (or just make room), closed → fly back
  useEffect(() => {
    if (!city) return
    if (win) city.focus(win.appId, openShift(innerWidth))
    else city.release()
  }, [city, win])
  useEffect(() => {
    if (win) city?.setShift(openShift(size.W))
  }, [size.W]) // eslint-disable-line react-hooks/exhaustive-deps -- only a resize re-fits the view

  const mode = win ? 'open' : peekId ? 'peek' : 'hidden'
  const lastId = useRef<string | null>(null)
  const shownId = win?.appId ?? peekId ?? lastId.current // keeps content while the window fades out
  lastId.current = shownId
  const meta = APPS.find((a) => a.id === shownId)

  // Position by hand so CSS transitions animate it: from hidden, first jump (untransitioned) to the peek card, then grow.
  const prevMode = useRef('hidden')
  useLayoutEffect(() => {
    const el = winRef.current
    if (!el || !size.W) return
    const put = (r: Rect) =>
      Object.assign(el.style, {
        left: r.x + 'px',
        top: r.y + 'px',
        width: r.w + 'px',
        height: r.h + 'px',
      })
    if (prevMode.current === 'hidden' && mode !== 'hidden') {
      el.style.transition = 'none'
      put(peekRect(size.W))
      void el.offsetWidth // commit, so the next change animates from here
      el.style.transition = ''
    }
    if (mode !== 'hidden') put(mode === 'open' ? openRect(size.W, size.H) : peekRect(size.W))
    if (mode === 'open' && prevMode.current !== 'open') el.focus({ preventScroll: true })
    prevMode.current = mode
  }, [mode, size])

  // new content (e.g. an article opened from Research) starts at the top
  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0)
  }, [win])

  const App = win ? apps[win.appId].Component : null
  const name = String(win?.slug ?? shownId ?? '').toUpperCase()

  return (
    <div className={`city${win ? ' has-win' : ''}`}>
      <WindowUrlSync />
      <div ref={rootRef} className="city-stage" />
      <div className="hud city-status">{status}</div>
      <div className="hud city-hint">
        REAL TERRAIN (AWS, 1.6× HEIGHT) + OPENSTREETMAP · DRAG ORBIT · SCROLL ZOOM · RIGHT-DRAG PAN
        · CLICK AN ICON
      </div>
      <button type="button" className="hud city-home" onClick={() => city?.home()}>
        ⌂ OVERVIEW
      </button>

      <div
        ref={winRef}
        className={`w3 ${mode}`}
        data-app={win?.appId}
        role={win ? 'dialog' : undefined}
        aria-label={win ? windowTitle(win) : undefined}
        aria-hidden={mode === 'hidden'}
        tabIndex={-1}
      >
        <div className="w3t">
          {win && canGoBack && (
            <button type="button" className="w3x w3back" aria-label="Back" onClick={back}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M14 8H3M7.5 3.5 3 8l4.5 4.5" />
              </svg>
              BACK
            </button>
          )}
          <span>
            {name}.MD{win ? '' : ' · PREVIEW'}
          </span>
          <button type="button" className="w3x" aria-label="Close" onClick={close}>
            ×
          </button>
        </div>
        <div ref={bodyRef} className="w3b">
          {meta && (
            <>
              <div className="k">
                ◢ {meta.place} · {deg(meta.at[0])}N {deg(meta.at[1])}W
              </div>
              <h3>{meta.label}</h3>
              <p className="lead">{meta.desc}</p>
              <div className="cta">CLICK TO OPEN ▸</div>
            </>
          )}
          {App && (
            <div className="more">
              <ErrorBoundary key={windowKey(win!.appId, win!.slug)}>
                <App slug={win?.slug} />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
