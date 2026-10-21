'use client'

import { useEffect, useRef, useState } from 'react'
import { articlesByKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'

/** Board-only presentation: not article metadata, so it lives here. area = the brain region a channel lights. */
type Channel = { slug: string; area: 'OL' | 'CB' | 'CX' | 'MB' | 'VNC' }

const WORK: Channel[] = [
  { slug: 'stage-1-current-work', area: 'VNC' },
  { slug: 'learning-mechanisms', area: 'MB' },
  { slug: 'snn-overview', area: 'CB' },
  { slug: 'how-im-building-it', area: 'CB' },
]
const THEORY: Channel[] = [
  { slug: 'why-biology', area: 'OL' },
  { slug: 'structure-over-weights', area: 'CX' },
]
const ALL = [...WORK, ...THEORY]

/** Stage milestones, from stage-1-current-work + snn-overview. */
const MS: [string, 'done' | 'now' | ''][][] = [
  [
    ['Connectome → LIF network (Brian2 + GeNN)', 'done'],
    ['Plugged into NeuroMechFly body', 'done'],
    ['Detect the sensorimotor loop', 'now'],
    ['Motion in one leg', 'now'],
    ['Accurate models for the other five legs', ''],
    ['VNC rhythm → walking', ''],
    ['Learn a custom task', ''],
  ],
  [
    ['Injury & new environments', ''],
    ['Wheels instead of legs', ''],
    ['Fly brain drives a physical robot', ''],
  ],
  [
    ['Overgrow neurons', ''],
    ['Prune to the body', ''],
  ],
]

/** Short version of kb/refined/research/INDEX.md's "ideas underneath". */
const IDEAS: string[] = [
  'Learn the principles, not the mechanism — we don’t build airplanes that flap.',
  'Indirect observation: build a model of how the thing works, then design the cheap experiment.',
  'The hierarchy of sciences bottoms out in math, so the brain is a math problem.',
  'Structure over weights — a fly brain moves a body with nothing trained.',
  'Backprop is a biological myth; local rules and growing networks are the alternative.',
]

// ---------- 3D connectome (male CNS v1.0, CC-BY) ----------
// mcns-somata.bin: N×3 int16 xyz | N uint8 group | N uint8 colour
// mcns-fibers.bin: M×6 int16 segment endpoints | M uint8 group | M uint8 colour
// group: 0 optic · 1 central · 2 VNC · 3 brain↔body · colour: hash of cell type (FlyWire-style)
const PAL = [
  '25 225 255',
  '236 72 200',
  '150 110 255',
  '60 140 255',
  '240 220 70',
  '255 140 50',
  '60 220 120',
  '255 80 90',
]
const AREA_GROUP = { OL: 0, CB: 1, CX: 1, MB: 1, VNC: 2 }

type Specimen = {
  n: number
  P: Int16Array
  B: Uint32Array[] // somata indices bucketed by group*8+colour
  X: Float32Array // projected x, y, depth per soma
  m: number
  FP: Int16Array
  R: [number, number, number, number][] // fiber runs [from, to, group, colour]
  FX: Float32Array // projected segment endpoints
}

function decode(sb: ArrayBuffer, fb: ArrayBuffer): Specimen {
  const n = sb.byteLength / 8
  const m = fb.byteLength / 14
  const sg = new Uint8Array(sb, n * 6, n)
  const sc = new Uint8Array(sb, n * 7, n)
  // bucket indices by group*8+colour once, so each frame is 32 batched paths
  const B: number[][] = Array.from({ length: 32 }, () => [])
  sg.forEach((g, i) => B[g * 8 + sc[i]].push(i))
  // segments are stored neuron by neuron: split into runs, shuffle so no colour always paints last
  const fg = new Uint8Array(fb, m * 12, m)
  const fc = new Uint8Array(fb, m * 13, m)
  const R: Specimen['R'] = []
  for (let i = 0, a = 0; i <= m; i++) {
    if (i === m || (i && (fg[i] !== fg[a] || fc[i] !== fc[a]))) {
      R.push([a, i, fg[a], fc[a]])
      a = i
    }
  }
  for (let i = R.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[R[i], R[j]] = [R[j], R[i]]
  }
  return {
    n,
    P: new Int16Array(sb, 0, n * 3),
    B: B.map((x) => Uint32Array.from(x)),
    X: new Float32Array(n * 3),
    m,
    FP: new Int16Array(fb, 0, m * 6),
    R,
    FX: new Float32Array(m * 4),
  }
}

let specimen: Promise<Specimen | null> | null = null
/** Fetched once per page; a failure just leaves the viewfinder empty. */
const loadSpecimen = () =>
  (specimen ??= Promise.all(
    ['/media/mcns-somata.bin', '/media/mcns-fibers.bin'].map((u) =>
      fetch(u).then((r) => {
        if (!r.ok) throw new Error(u)
        return r.arrayBuffer()
      }),
    ),
  )
    .then(([sb, fb]) => decode(sb, fb))
    .catch(() => null))

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Fit the backing store to the CSS box (2x), returning false while the canvas has no size. */
function fit(cv: HTMLCanvasElement) {
  const w = cv.clientWidth * 2
  const h = cv.clientHeight * 2
  if (!w) return false
  if (cv.width !== w || cv.height !== h) {
    cv.width = w
    cv.height = h
  }
  return true
}

function Milestones({ stage }: { stage: number }) {
  return (
    <ul className="res-ms">
      {MS[stage].map(([t, s]) => (
        <li key={t} className={s ? `res-${s}` : undefined}>
          {t}
        </li>
      ))}
    </ul>
  )
}

/**
 * "Stage strip": the three-stage plan as three recording columns over a rotating male-CNS
 * specimen. Hovering or focusing a channel lights its brain region. Canvases (specimen, live
 * raster, flat lines) share one rAF loop that pauses when hidden or scrolled out of view, and
 * under prefers-reduced-motion renders only on demand (drag, hover, resize).
 */
export function ResearchWindow() {
  const { openApp } = useWindows()
  const articles = new Map(articlesByKind('research').map((a) => [a.slug, a]))
  const [hot, setHot] = useState<number | null>(null)
  const [npts, setNpts] = useState('—')
  const root = useRef<HTMLDivElement>(null)
  const hotRef = useRef(-1)
  const kick = useRef<() => void>(() => {})
  const open = (slug: string) => openApp('article', { slug })

  const light = (i: number | null) => {
    setHot(i)
    hotRef.current = i ?? -1
    kick.current()
  }

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cloud = el.querySelector<HTMLCanvasElement>('[data-cloud]')!
    const raster = el.querySelector<HTMLCanvasElement>('[data-raster]')!
    const flats = [...el.querySelectorAll<HTMLCanvasElement>('[data-flat]')]
    const rotEl = el.querySelector('[data-rot]')!

    let seed = 11
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

    // ----- live raster: 64 units, each tied to a channel; spikes drift left as age grows
    const pop = Array.from({ length: 64 }, (_, i) => ({
      rate: 1 + rnd() * 9,
      group: i % ALL.length,
      ages: [] as number[],
    }))
    let auto = 0
    let autoT = 0
    const step = (dt: number) => {
      autoT += dt
      if (autoT > 4000) {
        autoT = 0
        auto = (auto + 1) % WORK.length
      }
      const sel = hotRef.current < 0 ? auto : hotRef.current
      for (const p of pop) {
        const boost = p.group === sel ? (hotRef.current >= 0 ? 6 : 2.2) : 1
        if (rnd() < (p.rate * boost * dt) / 1000) p.ages.push(0)
        p.ages = p.ages.map((a) => a + dt).filter((a) => a < 12000)
      }
    }
    for (let i = 0; i < 400; i++) step(16) // pre-roll so a static frame is not empty
    const drawRaster = () => {
      if (!fit(raster)) return
      const g = raster.getContext('2d')!
      const { width: W, height: H } = raster
      const sel = hotRef.current < 0 ? auto : hotRef.current
      g.clearRect(0, 0, W, H)
      pop.forEach((p, i) => {
        g.fillStyle = p.group === sel ? 'rgb(255 178 63)' : 'rgb(25 225 255 / .6)'
        const y = 26 + i * ((H - 32) / 64)
        for (const a of p.ages) g.fillRect(W - 0.16 * a, y, 3, 2.2)
      })
    }

    // ----- "no signal" lines for the queued stages
    const drawFlat = (cv: HTMLCanvasElement, now: number) => {
      if (!fit(cv)) return
      const g = cv.getContext('2d')!
      const { width: W, height: H } = cv
      g.clearRect(0, 0, W, H)
      g.strokeStyle = 'rgb(25 225 255 / .08)'
      g.lineWidth = 1
      for (let x = 0; x < W; x += 24) {
        g.beginPath()
        g.moveTo(x, 0)
        g.lineTo(x, H)
        g.stroke()
      }
      g.strokeStyle = 'rgb(138 160 170 / .45)'
      g.setLineDash([6, 6])
      g.beginPath()
      g.moveTo(0, H * 0.62)
      g.lineTo(W, H * 0.62)
      g.stroke()
      g.setLineDash([])
      g.fillStyle = 'rgb(25 225 255 / .35)'
      g.fillRect((now / 18) % W, 0, 2, H) // slow scanning cursor: armed, waiting
    }

    // ----- specimen: roll around the long brain→VNC axis (fixed 114° start, seen from above),
    // yaw auto-spin around screen-vertical (near side moves left-to-right), mild perspective
    let rot = (114 * Math.PI) / 180
    let yaw = (20 * Math.PI) / 180
    const spin = 0.00018
    let drag: [number, number] | null = null
    let S: Specimen | null = null
    const drawCloud = () => {
      if (!S || !fit(cloud)) return
      const g = cloud.getContext('2d')!
      const { width: W, height: H } = cloud
      const sc = Math.min(W / 3.6, H / 1.85) // margin so the optic lobes clear the frame at any roll
      const [cx, cy] = [W / 2, H / 2]
      const [ca, sa, cy2, sy2] = [Math.cos(rot), Math.sin(rot), Math.cos(yaw), Math.sin(yaw)]
      const proj = (x: number, y: number, z: number, out: Float32Array, o: number) => {
        x /= 32767
        y /= 32767
        z /= 32767
        const sy = y * ca - x * sa
        const dp = y * sa + x * ca
        const sx = z * cy2 + dp * sy2
        const d = -z * sy2 + dp * cy2
        const f = 4 / (4 + d)
        out[o] = cx + sx * sc * f
        out[o + 1] = cy + sy * sc * f
        return d
      }
      for (let i = 0; i < S.n; i++) {
        S.X[i * 3 + 2] = proj(S.P[i * 3], S.P[i * 3 + 1], S.P[i * 3 + 2], S.X, i * 3)
      }
      for (let i = 0; i < S.m; i++) {
        const p = S.FP
        proj(p[i * 6], p[i * 6 + 1], p[i * 6 + 2], S.FX, i * 4)
        proj(p[i * 6 + 3], p[i * 6 + 4], p[i * 6 + 5], S.FX, i * 4 + 2)
      }
      g.clearRect(0, 0, W, H)
      const hg = hotRef.current < 0 ? -1 : AREA_GROUP[ALL[hotRef.current].area]
      const lit = (k: number) => (hg < 0 ? 1 : k === hg ? 1.4 : 0.15)
      // fibers first (thin, faint, so overlapping types mix instead of the last colour winning), then the soma rind on top
      g.lineWidth = 1.1
      for (const [a, e, k, c] of S.R) {
        g.strokeStyle = `rgb(${PAL[c]} / ${Math.min(1, (k === 3 ? 0.75 : 0.6) * lit(k))})`
        g.beginPath()
        for (let j = a; j < e; j++) {
          const o = j * 4
          g.moveTo(S.FX[o], S.FX[o + 1])
          g.lineTo(S.FX[o + 2], S.FX[o + 3])
        }
        g.stroke()
      }
      for (let b = 0; b < 32; b++) {
        const k = b >> 3
        const si = S.B[b]
        if (!si.length) continue
        g.fillStyle = `rgb(${PAL[b & 7]} / ${Math.min(1, (k === 0 ? 0.12 : 0.2) * lit(k))})`
        for (let j = 0; j < si.length; j++) {
          const o = si[j] * 3
          const r = S.X[o + 2] < 0 ? 1.8 : 1.2
          g.fillRect(S.X[o], S.X[o + 1], r, r)
        }
      }
      rotEl.textContent = String(Math.floor((((-yaw * 180) / Math.PI) % 360) + 360) % 360).padStart(
        3,
        '0',
      )
    }

    // ----- one loop for all canvases: only while the document and a canvas are visible
    const visible = new Set<HTMLCanvasElement>()
    let raf = 0
    let last = 0
    const frame = (now: number) => {
      raf = 0
      if (document.hidden) return
      const dt = reduced ? 0 : Math.min(50, now - last)
      last = now
      if (drag === null) yaw -= spin * dt
      step(dt)
      if (visible.has(raster)) drawRaster()
      for (const cv of flats) if (visible.has(cv)) drawFlat(cv, reduced ? 0 : now)
      if (visible.has(cloud)) drawCloud()
      if (!reduced && visible.size) raf = requestAnimationFrame(frame)
    }
    const run = () => {
      if (raf || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    kick.current = run

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target as HTMLCanvasElement)
        else visible.delete(e.target as HTMLCanvasElement)
      }
      run()
    })
    const ro = new ResizeObserver(run)
    for (const cv of [cloud, raster, ...flats]) {
      io.observe(cv)
      ro.observe(cv)
    }
    document.addEventListener('visibilitychange', run)

    // near surface follows the pointer: drag right turns left-to-right, drag down rolls toward you
    const down = (e: PointerEvent) => {
      drag = [e.clientX, e.clientY]
      cloud.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      yaw -= (e.clientX - drag[0]) * 0.01
      rot += (e.clientY - drag[1]) * 0.01
      drag = [e.clientX, e.clientY]
      run()
    }
    const up = () => (drag = null)
    cloud.addEventListener('pointerdown', down)
    cloud.addEventListener('pointermove', move)
    cloud.addEventListener('pointerup', up)
    cloud.addEventListener('pointercancel', up)

    let alive = true
    void loadSpecimen().then((s) => {
      if (!alive || !s) return
      S = s
      setNpts(`${s.n.toLocaleString()} · FIBERS ${s.m.toLocaleString()}`)
      run()
    })

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', run)
      cloud.removeEventListener('pointerdown', down)
      cloud.removeEventListener('pointermove', move)
      cloud.removeEventListener('pointerup', up)
      cloud.removeEventListener('pointercancel', up)
      kick.current = () => {}
    }
  }, [])

  const channel = (c: Channel) => {
    const a = articles.get(c.slug)
    if (!a) return null
    const i = ALL.indexOf(c)
    return (
      <button
        key={c.slug}
        type="button"
        className={hot === i ? 'res-ch res-hot' : 'res-ch'}
        onMouseEnter={() => light(i)}
        onMouseLeave={() => light(null)}
        onFocus={() => light(i)}
        onBlur={() => light(null)}
        onClick={() => open(c.slug)}
      >
        <span className="res-n">
          CH {pad2(i + 1)}
          <br />
          {c.area}
        </span>
        <span>
          <span className="res-t">{a.title}</span>
          <span className="res-d">{a.summary}</span>
        </span>
      </button>
    )
  }
  const pub = articles.get('publications')

  return (
    <div className="res" ref={root}>
      <div className="res-k">◢ 05 / RESEARCH · POST-TRANSFORMER MODELS</div>
      <h1 className="res-name">Research</h1>
      <p className="res-sub">
        Transformers are too big and too hungry to live inside a robot, and they can&apos;t absorb
        experience into themselves. Biological brains do both. A free-time, small-GPU project in
        three stages: an uploaded fruit-fly connectome, a digital body, and learning.
      </p>
      <div className="res-spec">
        <span>
          CONNECTOME <b>MALE-CNS v0.9</b>
        </span>
        <span>
          SIM <b>BRIAN2 + GeNN</b>
        </span>
        <span>
          BODY <b>NEUROMECHFLY · MUJOCO</b>
        </span>
        <span>
          LEARNING <b>3-FACTOR STDP</b>
        </span>
        <button type="button" className="res-link" onClick={() => open('snn-overview')}>
          FULL PLAN ▸
        </button>
      </div>

      <div className="res-vf">
        <canvas data-cloud aria-hidden="true" />
        <i className="res-br res-tl" />
        <i className="res-br res-tr" />
        <i className="res-br res-bl" />
        <i className="res-br res-brr" />
        <div className="res-scan" />
        <span className="res-cap">◢ SPECIMEN · D. MELANOGASTER · MALE CNS · SOMATA {npts}</span>
        <span className="res-cap res-r">
          <span className="res-rec">●</span> ROT <b data-rot>000</b>° · DRAG TO ORBIT
        </span>
        <span className="res-cap res-legend">
          COLOUR = CELL TYPE · HOVER A CHANNEL TO LIGHT ITS REGION
        </span>
        <span className="res-cap res-credit">
          DATA · MALE CNS v1.0 · FLYEM / HHMI JANELIA · CAMBRIDGE · MRC LMB · GOOGLE · CC-BY 4.0
        </span>
      </div>

      <div className="res-k res-sec res-first">
        ◢ THE PLAN · 3 STAGES <span className="res-tag">· 1 RECORDING</span>
      </div>
      <div className="res-strip">
        <div className="res-col">
          <div className="res-hd">
            <div>
              <div className="res-big">01</div>
              <div className="res-stt">Development</div>
            </div>
            <span className="res-chip res-live">● LIVE · 2026</span>
          </div>
          <div className="res-mini">
            <canvas data-raster aria-hidden="true" />
            <span className="res-cap">
              <span className="res-rec">●</span> REC · POPULATION
            </span>
          </div>
          <Milestones stage={0} />
        </div>
        <div className="res-col res-off">
          <div className="res-hd">
            <div>
              <div className="res-big res-dim">02</div>
              <div className="res-stt">Morphology</div>
            </div>
            <span className="res-chip res-q">QUEUED</span>
          </div>
          <div className="res-mini">
            <canvas data-flat aria-hidden="true" />
            <span className="res-cap res-dim">NO SIGNAL</span>
          </div>
          <div className="res-std">
            Change the body — injury, environment, wheels for legs — keep every neuron, see if the
            same learning adapts.
          </div>
          <Milestones stage={1} />
        </div>
        <div className="res-col res-off">
          <div className="res-hd">
            <div>
              <div className="res-big res-dim">03</div>
              <div className="res-stt">Guided evolution</div>
            </div>
            <span className="res-chip res-q">QUEUED</span>
          </div>
          <div className="res-mini">
            <canvas data-flat aria-hidden="true" />
            <span className="res-cap res-dim">NO SIGNAL</span>
          </div>
          <div className="res-std">
            Change body and brain together: overgrow neurons, then prune to the body — the way
            newborns do.
          </div>
          <Milestones stage={2} />
        </div>
      </div>

      <div className="res-k res-sec">◢ STAGE 1 · CHANNELS</div>
      <div className="res-chans">{WORK.map(channel)}</div>

      <div className="res-k res-sec">◢ THE THINKING BEHIND IT</div>
      <div className="res-chans res-quiet">{THEORY.map(channel)}</div>

      <div className="res-k res-sec">◢ THE IDEAS UNDERNEATH</div>
      <ul className="res-ideas">
        {IDEAS.map((idea) => (
          <li key={idea}>{idea}</li>
        ))}
      </ul>

      {pub && (
        <>
          <div className="res-k res-sec">◢ TRACK RECORD</div>
          <div className="res-rows">
            <button type="button" className="res-row" onClick={() => open(pub.slug)}>
              <span className="res-n">P01</span>
              <span className="res-t">{pub.title}</span>
              <span className="res-d">{pub.summary}</span>
              <span className="res-go">OPEN ▸</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
