'use client'

import { useEffect, useRef, useState } from 'react'
import { articlesByKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'

/** VNC long axis is 7.3° off level in the scan (PCA of VNC somata, y-z plane); rotate it flat. */
const PITCH = (7.3 * Math.PI) / 180

/**
 * Board-only presentation: not article metadata, so it lives here. area = the brain region a
 * channel lights; idea = the thesis the article argues, shown as its hook.
 */
type Channel = { slug: string; area: 'OL' | 'CB' | 'CX' | 'MB' | 'VNC'; idea?: string }

const WORK: Channel[] = [
  { slug: 'stage-1-current-work', area: 'VNC' },
  {
    slug: 'how-im-building-it',
    area: 'CB',
    idea: 'Backprop is a biological myth; local rules and growing networks are the alternative.',
  },
  { slug: 'learning-mechanisms', area: 'MB' },
]
const WHY: Channel[] = [
  { slug: 'snn-overview', area: 'CB' },
  {
    slug: 'why-biology',
    area: 'OL',
    idea: 'Learn the principles, not the mechanism — we don’t build airplanes that flap.',
  },
  { slug: 'structure-over-weights', area: 'CX' },
]
const ALL = [...WORK, ...WHY]

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

// ---------- 3D connectome (male CNS v1.0, CC-BY) ----------
// mcns-somata.bin: N×3 int16 xyz | N uint8 group | N uint8 colour
// mcns-fibers.bin: u32 M | u32 K | K×u16 segments per neuron | M×6 int16 segment endpoints
//                  | M uint8 group | M uint8 colour | M uint8 path distance from the soma (6 µm)
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
// spikes, in fiber-distance units (6 µm) per ms: ~0.6 µm/ms is slow-motion for a real axon, but readable
const SPEED = 0.1
const TAIL = 10
const RATE = 0.00002 // per neuron per ms
const MAX_SPIKES = 260

type Specimen = {
  n: number
  P: Int16Array
  B: Uint32Array[] // somata indices bucketed by group*8+colour
  X: Float32Array // projected x, y, depth per soma
  m: number
  FP: Int16Array
  D: Uint8Array // path distance of each segment from its soma, 6 µm units
  R: [number, number, number, number, number][] // one run per neuron [from, to, group, colour, farthest D]
  FX: Float32Array // projected segment endpoints
}

function decode(sb: ArrayBuffer, fb: ArrayBuffer): Specimen {
  const n = sb.byteLength / 8
  const sg = new Uint8Array(sb, n * 6, n)
  const sc = new Uint8Array(sb, n * 7, n)
  // bucket indices by group*8+colour once, so each frame is 32 batched paths
  const B: number[][] = Array.from({ length: 32 }, () => [])
  sg.forEach((g, i) => B[g * 8 + sc[i]].push(i))
  // segments are stored neuron by neuron (K run lengths up front); shuffle runs so no colour always paints last
  const [m, k] = new Uint32Array(fb, 0, 2)
  const len = new Uint16Array(fb, 8, k)
  const o = 8 + 2 * k
  const fg = new Uint8Array(fb, o + m * 12, m)
  const fc = new Uint8Array(fb, o + m * 13, m)
  const D = new Uint8Array(fb, o + m * 14, m)
  const R: Specimen['R'] = []
  for (let i = 0, a = 0; i < k; a += len[i++]) {
    let far = 0
    for (let j = a; j < a + len[i]; j++) far = Math.max(far, D[j])
    R.push([a, a + len[i], fg[a], fc[a], far])
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
    FP: new Int16Array(fb, o, m * 6),
    D,
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
 * "Stage strip": a rotating male-CNS specimen over the three-stage plan. Hovering or focusing a
 * channel lights its brain region. The specimen's rAF loop pauses when hidden or scrolled out of
 * view, and under prefers-reduced-motion renders only on demand (drag, hover, resize).
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
    const rotEl = el.querySelector('[data-rot]')!

    // ----- specimen: data axes are x = left↔right, -y = dorsal, z = head→tail. Start as a fly
    // standing side-on, head left: roll 0 keeps the back up, PITCH levels the VNC (it rises 7°
    // toward the tail in the dissected scan). Yaw auto-spins around screen-vertical (near side
    // left-to-right); drag x = yaw, drag y = roll around the long axis. Mild perspective.
    const [cp, sp] = [Math.cos(PITCH), Math.sin(PITCH)]
    let rot = 0
    let yaw = 0
    const spin = 0.00018
    let drag: [number, number] | null = null
    let S: Specimen | null = null
    const spikes: [number, number][] = [] // [run, front distance from the soma]
    const drawCloud = () => {
      if (!S || !fit(cloud)) return
      const g = cloud.getContext('2d')!
      const { width: W, height: H } = cloud
      const sc = Math.min(W / 3.6, H / 1.85) // margin so the optic lobes clear the frame at any roll
      const [cx, cy] = [W / 2, H / 2]
      const [ca, sa, cy2, sy2] = [Math.cos(rot), Math.sin(rot), Math.cos(yaw), Math.sin(yaw)]
      const proj = (px: number, py: number, pz: number, out: Float32Array, o: number) => {
        const x = px / 32767
        const y = (py * cp + pz * sp) / 32767 // pitch: level the VNC
        const z = (pz * cp - py * sp) / 32767
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
      // spikes: a bright front running out from the soma along path distance, fading tail behind it
      g.globalCompositeOperation = 'lighter'
      g.lineCap = 'round'
      for (const [r, front] of spikes) {
        const [a, e, , c] = S.R[r]
        for (let j = a; j < e; j++) {
          const behind = front - S.D[j]
          if (behind < 0 || behind > TAIL) continue
          const o = j * 4
          const al = 1 - behind / TAIL
          g.lineWidth = 2
          g.strokeStyle = `rgb(${PAL[c]} / ${0.35 * al})`
          g.beginPath()
          g.moveTo(S.FX[o], S.FX[o + 1])
          g.lineTo(S.FX[o + 2], S.FX[o + 3])
          g.stroke()
          // bead at the segment middle: coloured halo, white core
          const [mx, my] = [(S.FX[o] + S.FX[o + 2]) / 2, (S.FX[o + 1] + S.FX[o + 3]) / 2]
          g.fillStyle = `rgb(${PAL[c]} / ${0.45 * al})`
          g.fillRect(mx - 2.5, my - 2.5, 5, 5)
          g.fillStyle = `rgb(255 255 255 / ${0.9 * al})`
          g.fillRect(mx - 1, my - 1, 2, 2)
        }
      }
      g.globalCompositeOperation = 'source-over'
      rotEl.textContent = String(Math.floor((((-yaw * 180) / Math.PI) % 360) + 360) % 360).padStart(
        3,
        '0',
      )
    }

    // ----- render loop: only while the document and the specimen are visible
    let onScreen = false
    let raf = 0
    let last = 0
    const frame = (now: number) => {
      raf = 0
      if (document.hidden) return
      const dt = reduced ? 0 : Math.min(50, now - last)
      last = now
      if (drag === null) yaw -= spin * dt
      if (S && dt) {
        // advance, retire past the farthest tip, then fire new ones (hovered region fires harder;
        // Stage 1 is the VNC, so its brain↔body cable fires with it)
        for (const s of spikes) s[1] += SPEED * dt
        for (let i = spikes.length - 1; i >= 0; i--) {
          if (spikes[i][1] - TAIL > S.R[spikes[i][0]][4]) spikes.splice(i, 1)
        }
        const hg = hotRef.current < 0 ? -1 : AREA_GROUP[ALL[hotRef.current].area]
        for (let r = 0; r < S.R.length && spikes.length < MAX_SPIKES; r++) {
          const k = S.R[r][2]
          const boost = k === hg || (hg === 2 && k === 3) ? 10 : hg < 0 ? 1 : 0.3
          if (Math.random() < RATE * boost * dt) spikes.push([r, 0])
        }
      }
      if (onScreen) drawCloud()
      if (!reduced && onScreen) raf = requestAnimationFrame(frame)
    }
    const run = () => {
      if (raf || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    kick.current = run

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
      run()
    })
    const ro = new ResizeObserver(run)
    io.observe(cloud)
    ro.observe(cloud)
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
          {c.idea && <span className="res-idea">{c.idea}</span>}
        </span>
      </button>
    )
  }

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

      <div className="res-k res-sec res-first">◢ THE PLAN · 3 STAGES</div>
      <div className="res-strip">
        <div className="res-col">
          <div className="res-hd">
            <div>
              <div className="res-big">01</div>
              <div className="res-stt">Development</div>
            </div>
            <span className="res-chip res-live">● LIVE · 2026</span>
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
          <div className="res-std">
            Change body and brain together: overgrow neurons, then prune to the body — the way
            newborns do.
          </div>
          <Milestones stage={2} />
        </div>
      </div>

      <div className="res-k res-sec">◢ STAGE 1 · THE WORK</div>
      <div className="res-chans">{WORK.map(channel)}</div>

      <div className="res-k res-sec">◢ WHY THIS APPROACH</div>
      <div className="res-chans">{WHY.map(channel)}</div>
    </div>
  )
}
