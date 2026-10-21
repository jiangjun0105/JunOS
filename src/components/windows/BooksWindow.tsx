'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Img } from '@/components/Img'
import { useWindows } from '@/os/WindowManager'
import { books, type Essay } from '@/content/books'
import { getArticle } from '@/content/articles'
import { getThought } from '@/content/thoughts'
import { R, layoutNet, leadPoints, panelTop, type Net } from './engrams'

const NARROW = 640 // below this stage width the network folds into a grid with the readout under it
const pad2 = (n: number) => String(n).padStart(2, '0')
// joined in code: prettier-plugin-tailwindcss trims the spaces out of className template strings
const cls = (...c: (string | false)[]) => c.filter(Boolean).join(' ')
const essayKey = (e: Essay) => `${e.app}:${e.slug}`
const ESSAYS = [...new Map(books.map((b) => [essayKey(b.essay), b.essay])).values()]
const FED = books.map((b) => ESSAYS.findIndex((e) => essayKey(e) === essayKey(b.essay)))
const essayTitle = (e: Essay) =>
  (e.app === 'article' ? getArticle(e.slug) : getThought(e.slug))?.title ?? e.slug
const RATE = books.map((_, i) => 28 + ((i * 17) % 31)) // dry, fixed "spike rates" (Hz)
const SYN_COUNT = layoutNet(1000, 600, FED, ESSAYS.length).syns.length

type Pulse = {
  path: SVGPathElement
  c: SVGCircleElement
  t: number
  rev: boolean
  v: number
  kind: 'be' | 'bb'
  to: number
  from: number
}

/**
 * "Engrams": each book is an input neuron wired into the essays it fed (output neurons), with
 * signal pulses running along the synapses and a live spike raster in the readout dock. Hover,
 * focus or tap a neuron to load Jun's take, typed onto a scanlined screen; tap again (or empty
 * space) to release. Geometry lives in engrams.ts; pulses + raster are drawn imperatively.
 */
export function BooksWindow() {
  const { openApp } = useWindows()
  const stageRef = useRef<HTMLDivElement>(null)
  const takeRef = useRef<HTMLDivElement>(null)
  const pulsesRef = useRef<SVGGElement>(null)
  const rasterRef = useRef<HTMLCanvasElement>(null)
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([])
  const essayRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const [size, setSize] = useState({ W: 0, H: 0 })
  const [hover, setHover] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)
  const [panel, setPanel] = useState<{ ty: number; lead: string } | null>(null)
  const [typed, setTyped] = useState(0)
  const active = hover ?? pinned
  const book = active == null ? null : books[active]

  const narrow = size.W < NARROW
  const net: Net | null = useMemo(
    () => (size.W && !narrow ? layoutNet(size.W, size.H, FED, ESSAYS.length) : null),
    [size, narrow],
  )
  // the animation loop reads these without re-subscribing
  const live = useRef({ active, net, burst: (_i: number) => {} })
  live.current.active = active
  live.current.net = net

  useLayoutEffect(() => {
    const el = stageRef.current!
    const ro = new ResizeObserver(() => setSize({ W: el.clientWidth, H: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // place the readout beside the active neuron and draw its leader line
  useLayoutEffect(() => {
    if (active == null || !net || !takeRef.current) {
      setPanel(null)
      return
    }
    const p = net.books[active]
    const ty = panelTop(p, takeRef.current.offsetHeight, size.H)
    setPanel({ ty, lead: leadPoints(p, size.W, ty) })
  }, [active, net, size])

  // type the take out, three characters a frame; still once done
  useEffect(() => {
    if (!book) return
    const full = book.blurb.length
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(full)
      return
    }
    setTyped(0)
    let n = 0
    let t = window.setTimeout(function tick() {
      n = Math.min(full, n + 3)
      setTyped(n)
      if (n < full) t = window.setTimeout(tick, 16)
    }, 250) // after the panel fades in
    return () => clearTimeout(t)
  }, [book])

  useEffect(() => {
    if (active != null) live.current.burst(active)
  }, [active])

  // pulses along the synapses + the spike raster
  useEffect(() => {
    const L = live.current // the same object every render; only its fields change
    const css = getComputedStyle(document.documentElement)
    const cyan = css.getPropertyValue('--cyan').trim()
    const heading = css.getPropertyValue('--heading').trim()
    const font = css.getPropertyValue('--font-mono').trim() || 'monospace'
    const canvas = rasterRef.current!
    const cx = canvas.getContext('2d')!
    const g = pulsesRef.current!
    const NS = 'http://www.w3.org/2000/svg'
    const SPAN = 4000
    let pulses: Pulse[] = []
    const now0 = performance.now()
    const spikes = books
      .flatMap((_, ch) =>
        Array.from({ length: Math.floor(RATE[ch] / 10) }, () => ({
          ch,
          t: now0 - Math.random() * 3800,
        })),
      )
      .sort((a, b) => a.t - b.t) // backfilled, so the raster never starts empty

    const fire = (el: Element | null | undefined) => {
      if (!el) return
      el.classList.add('fire')
      setTimeout(() => el.classList.remove('fire'), 160)
    }
    const emit = (i: number, amber: boolean) => {
      fire(nodeRefs.current[i])
      spikes.push({ ch: i, t: performance.now() })
      L.net?.syns.forEach((s, k) => {
        const path = pathRefs.current[k]
        if (!path) return
        if (s.from !== i && !(s.kind === 'bb' && s.to === i)) return
        if (s.kind === 'bb' && (Math.random() < 0.5 || (!amber && Math.random() < 0.6))) return
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('r', amber ? '2.6' : '2')
        c.setAttribute('class', amber ? 'eng-pulse a' : 'eng-pulse')
        g.appendChild(c)
        pulses.push({
          path,
          c,
          t: 0,
          rev: s.kind === 'bb' && s.to === i,
          v: amber ? 0.5 : 0.22 + Math.random() * 0.1,
          kind: s.kind,
          from: s.from,
          to: s.to,
        })
      })
    }
    let bursts: number[] = []
    L.burst = (i) => {
      pulses.forEach((p) => p.c.remove())
      pulses = []
      bursts.forEach(clearTimeout)
      bursts = Array.from({ length: 6 }, (_, k) =>
        window.setTimeout(() => L.active === i && emit(i, true), k * 90),
      )
    }

    const draw = (now: number) => {
      const { width: w, height: h } = canvas
      const rh = h / books.length
      cx.clearRect(0, 0, w, h)
      cx.font = `500 18px ${font}`
      cx.textBaseline = 'middle'
      for (let r = 0; r < books.length; r++) {
        cx.fillStyle = `rgb(${cyan} / 0.5)`
        cx.fillText(pad2(r + 1), 8, rh * r + rh / 2)
        cx.fillStyle = `rgb(${cyan} / 0.08)`
        cx.fillRect(48, rh * (r + 1) - 1, w - 48, 1)
      }
      while (spikes.length && now - spikes[0].t > SPAN) spikes.shift()
      cx.fillStyle = `rgb(${heading} / 0.9)`
      for (const s of spikes)
        cx.fillRect(w - ((now - s.t) / SPAN) * (w - 48), rh * s.ch + 8, 2, rh - 16)
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(performance.now()) // one still frame
      L.burst = () => {}
      return
    }
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const a = L.active
      books.forEach((_, i) => {
        const r = a == null ? RATE[i] / 40 : i === a ? 3.2 : 0 // spikes/s; the rest go quiet while one is loaded
        if (Math.random() < r * dt) emit(i, i === a)
      })
      pulses = pulses.filter((p) => {
        const len = p.path.getTotalLength()
        p.t += (dt * p.v * 300) / len
        if (p.t >= 1) {
          p.c.remove()
          fire(p.kind === 'be' ? essayRefs.current[p.to] : nodeRefs.current[p.rev ? p.from : p.to])
          return false
        }
        const pt = p.path.getPointAtLength((p.rev ? 1 - p.t : p.t) * len)
        p.c.setAttribute('cx', String(pt.x))
        p.c.setAttribute('cy', String(pt.y))
        return true
      })
      if (a == null && L.net) draw(now) // hidden while a take is up, and in narrow mode
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      bursts.forEach(clearTimeout)
      pulses.forEach((p) => p.c.remove())
      L.burst = () => {}
    }
  }, [])

  // hover intent, so the pointer can travel to the take's links: leaving a neuron lets go after a
  // beat, and while a take is up another neuron only takes over if the pointer rests on it
  const leaveT = useRef(0)
  const hold = () => clearTimeout(leaveT.current)
  const enter = (i: number, dwell = active != null && active !== i) => {
    hold()
    if (dwell) leaveT.current = window.setTimeout(() => setHover(i), 150)
    else setHover(i)
  }
  const leave = () => {
    hold()
    leaveT.current = window.setTimeout(() => setHover(null), 500)
  }
  useEffect(() => hold, [])

  const toggle = (i: number) => {
    setHover(null) // a tap/focus set hover; clear it so unpinning releases
    setPinned((p) => (p === i ? null : i))
  }
  const release = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('.eng-take, .eng-neuron, .eng-essay')) return
    setPinned(null)
    setHover(null)
  }
  const ek = book ? FED[active!] : -1
  const lit = (s: Net['syns'][number]) =>
    active != null && (s.from === active || (s.kind === 'bb' && s.to === active))
  const mean = Math.round(RATE.reduce((a, b) => a + b) / RATE.length)

  return (
    <div className="eng">
      <div className="eng-sub">
        The books that wired my brain — hover a neuron to load its engram
      </div>

      <div
        ref={stageRef}
        className={cls('eng-stage', narrow && 'eng-narrow', active != null && 'has-on')}
        onClick={release}
      >
        <svg className="eng-svg" aria-hidden="true">
          {net && (
            <>
              <g>
                {net.dends.map((d, k) => (
                  <path key={k} d={d.d} className={cls('eng-dend', d.i === active && 'on')} />
                ))}
              </g>
              <g>
                {net.syns.map((s, k) => (
                  <path
                    key={k}
                    ref={(el) => {
                      pathRefs.current[k] = el
                    }}
                    d={s.d}
                    className={cls('eng-syn', s.kind === 'bb' && 'bb', lit(s) && 'on')}
                  />
                ))}
              </g>
            </>
          )}
          {/* always mounted: the pulse loop holds on to this group */}
          <g ref={pulsesRef} />
          {net && panel && active != null && (
            <g key={active}>
              <polyline points={panel.lead} className="eng-lead" />
              <circle
                cx={net.books[active].x + R + 8}
                cy={net.books[active].y}
                r={2.5}
                className="eng-lead-dot"
              />
            </g>
          )}
        </svg>

        {net && (
          <>
            <div className="eng-cap" style={{ left: net.books[0].x - 60 }}>
              Input · engrams
            </div>
            <div className="eng-cap" style={{ left: 0 }}>
              Output · essays
            </div>
          </>
        )}

        {ESSAYS.map((e, j) => (
          <button
            key={essayKey(e)}
            type="button"
            ref={(el) => {
              essayRefs.current[j] = el
            }}
            className={cls('eng-essay', j === ek && 'on')}
            style={net ? { left: net.essays[j].x, top: net.essays[j].y } : undefined}
            onClick={() => openApp(e.app, { params: { slug: e.slug } })}
          >
            <span className="eng-dot" />
            <span className="eng-elab">
              <span>OUT {pad2(j + 1)}</span>
              {essayTitle(e)}
            </span>
          </button>
        ))}

        {books.map((b, i) => (
          <button
            key={b.title}
            type="button"
            ref={(el) => {
              nodeRefs.current[i] = el
            }}
            className={cls('eng-neuron', i === active && 'on')}
            style={net ? { left: net.books[i].x, top: net.books[i].y } : undefined}
            aria-label={`${b.title} — ${b.author}`}
            aria-pressed={pinned === i}
            onMouseEnter={() => enter(i)}
            onMouseLeave={leave}
            onFocus={() => enter(i, false)}
            onBlur={(e) => {
              if (!(e.relatedTarget as Element | null)?.closest('.eng-take')) setHover(null)
            }}
            onClick={() => toggle(i)}
          >
            <span className="eng-ring">
              <i />
              <Img src={b.cover} alt="" draggable={false} />
            </span>
            <span className="eng-id">N-{pad2(i + 1)}</span>
            <span className="eng-lab">
              <span className="eng-t">{b.title}</span>
              <span className="eng-hz">Spike rate {RATE[i]} Hz</span>
            </span>
          </button>
        ))}

        <div className="eng-dock">
          <div className="eng-idle">
            <div className="eng-hd">◇ Engram readout</div>
            <div className="eng-msg">
              No engram loaded.
              <small>Hover, focus or tap a neuron. Tap again to release.</small>
            </div>
            <div className="eng-hd">Spike raster · ch 01–{pad2(books.length)} · live</div>
            <canvas ref={rasterRef} width={640} height={420} />
            <div className="eng-stats">
              <div>
                Mean rate <b>{mean} Hz</b>
              </div>
              <div>
                Sync index <b>0.12</b>
              </div>
              <div>
                Plasticity <b>STDP</b>
              </div>
              <div>
                Forgetting <b>disabled</b>
              </div>
            </div>
          </div>
          {book && (
            <>
              <div className="eng-take-cap" style={panel ? { top: panel.ty - 15 } : undefined}>
                Engram N-{pad2(active! + 1)} · loaded · 0.4 kB of weights
              </div>
              <div
                key={active}
                ref={takeRef}
                className="eng-take"
                onMouseEnter={hold}
                onMouseLeave={leave}
                onBlur={(e) => {
                  if (!(e.relatedTarget as Element | null)?.closest('.eng-take, .eng-neuron'))
                    setHover(null)
                }}
                style={panel ? { top: panel.ty } : undefined}
              >
                <header>
                  <Img src={book.cover} alt="" draggable={false} />
                  <div>
                    <div className="eng-nm">{book.title}</div>
                    <div className="eng-au">{book.author}</div>
                    <div className="eng-tag">{book.tag}</div>
                  </div>
                </header>
                <div className="eng-lbl">Jun&apos;s take</div>
                <p>
                  <span className="sr-only">{book.blurb}</span>
                  {/* the untyped rest holds its space, so nothing reflows while it types */}
                  <span
                    aria-hidden="true"
                    className={typed < book.blurb.length ? 'typing' : undefined}
                  >
                    {book.blurb.slice(0, typed)}
                  </span>
                  <span aria-hidden="true" className="eng-rest">
                    {book.blurb.slice(typed)}
                  </span>
                </p>
                <footer>
                  <button
                    type="button"
                    onClick={() => openApp(book.essay.app, { params: { slug: book.essay.slug } })}
                  >
                    {essayTitle(book.essay)} ▸
                  </button>
                  <a href={book.link} target="_blank" rel="noopener noreferrer">
                    {book.linkName ?? 'Goodreads'} ↗
                  </a>
                </footer>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="eng-k">
        Connectome · {pad2(books.length)} engrams · {pad2(ESSAYS.length)} outputs ·{' '}
        {pad2(SYN_COUNT)} synapses
      </div>
    </div>
  )
}
