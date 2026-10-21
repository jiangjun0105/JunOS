'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { articlesByKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'

const GITHUB = 'https://github.com/jiangjun0105'
const IDLE_V = '3.30'
const IDLE_NETS = 17

/** Board-only presentation for one part: not article metadata, so it lives here, keyed by slug. */
type Board = {
  ref: string
  label: string
  tags: string
  status: string
  nets: number
  dnp?: boolean
  chip: { x: number; y: number; w: number; h: number }
  /** callout position, in % of the board */
  call: CSSProperties
}

const BOARD: Record<string, Board> = {
  'agent-harness': {
    ref: 'U2',
    label: 'AGENT HARNESS',
    tags: 'AGENTS · SDLC',
    status: 'ACTIVE',
    nets: 8,
    chip: { x: 80, y: 82, w: 220, h: 120 },
    call: { left: '6%', top: '38%' },
  },
  'junos-website': {
    ref: 'U3',
    label: 'JUNOS',
    tags: 'WEB · NEXTJS · DESIGN',
    status: 'LIVE · YOU ARE HERE',
    nets: 8,
    chip: { x: 700, y: 82, w: 220, h: 120 },
    call: { right: '6%', top: '38%' },
  },
  'repo-understanding-tool': {
    ref: 'U4',
    label: 'REPO-UNDERSTAND',
    tags: 'CONTEXT-ENG · BITTER LESSON',
    status: 'DNP · ARCHIVED',
    nets: 4,
    dnp: true,
    chip: { x: 700, y: 420, w: 220, h: 110 },
    call: { right: '4%', top: '30%' },
  },
}

/** The off-board connector: there is no article for it, it links out. */
const J1 = {
  title: 'GitHub',
  tags: 'HEADER · 4-PIN',
  status: 'EXTERNAL ↗',
  nets: 4,
  summary: 'The connector off-board: code for everything above lives here.',
  call: { left: '4%', top: '44%' } as CSSProperties,
}

/** What the callout, probe and BOM row show for one hot ref. */
type Part = {
  ref: string
  title: string
  summary: string
  tags: string
  status: string
  nets: number
  dnp?: boolean
  call: CSSProperties
}

// ---------- board geometry (static, built once) ----------

// One 45° chamfer per trace: vertical-first and horizontal-first routes.
const H = 30
const rV = (sx: number, sy: number, ex: number, ey: number) => {
  const gx = Math.sign(ex - sx)
  const gy = Math.sign(ey - sy)
  return `M${sx} ${sy}V${ey - gy * H}L${sx + gx * H} ${ey}H${ex}`
}
const rH = (sx: number, sy: number, ex: number, ey: number) => {
  const gx = Math.sign(ex - sx)
  const gy = Math.sign(ey - sy)
  return `M${sx} ${sy}H${ex - gx * H}L${ex} ${sy + gy * H}V${ey}`
}

// U1 pins: 8 per side, pitch 13, centred on (500, 320); body 435..565
const P = (i: number) => 500 + i * 13 - 45.5
const Q = (i: number) => 320 + i * 13 - 45.5

const BUSES: { owner: string; d: number; paths: string[]; dnp?: boolean }[] = [
  {
    owner: 'U2',
    d: 0.0,
    paths: [0, 1, 2, 3].map((k) => rV(P(k), 247, 308, [165, 150, 135, 120][k])),
  },
  {
    owner: 'U2',
    d: 0.2,
    paths: [0, 1, 2, 3].map((k) => rH(427, Q(k), [280, 260, 240, 220][k], 210)),
  },
  {
    owner: 'U3',
    d: 0.1,
    paths: [4, 5, 6, 7].map((k) => rV(P(k), 247, 692, [120, 135, 150, 165][k - 4])),
  },
  {
    owner: 'U3',
    d: 0.3,
    paths: [0, 1, 2, 3].map((k) => rH(573, Q(k), [740, 760, 780, 800][k], 210)),
  },
  {
    owner: 'U4',
    d: 0.4,
    paths: [4, 5, 6, 7].map((k) => rH(573, Q(k), [820, 800, 780, 760][k - 4], 412)),
    dnp: true,
  },
  {
    owner: 'J1',
    d: 0.5,
    paths: [4, 5, 6, 7].map((k) => rH(427, Q(k), [110, 136, 162, 188][k - 4], 520)),
  },
  {
    owner: 'PWR',
    d: 0.6,
    paths: [
      rV(P(0), 393, 408, 475),
      rV(P(1), 393, 408, 495),
      `M${P(2)} 393V470`,
      `M${P(5)} 393V470`,
      rV(P(6), 393, 600, 440),
    ],
  },
]

type Pad = { o: string; x: number; y: number; w: number; h: number; d: number; r?: number }
const PADS: Pad[] = []
const STUBS: { d: string; delay: number }[] = []
const VIAS: [number, number][] = []
const pad = (o: string, x: number, y: number, w: number, h: number, d = 0.3) =>
  PADS.push({ o, x: x - w / 2, y: y - h / 2, w, h, d })
const stub = (d: string, delay: number) => STUBS.push({ d, delay })
const via = (x: number, y: number) => VIAS.push([x, y])

// U1 pads and bottom fan-out
for (let i = 0; i < 8; i++) {
  pad('U1', P(i), 250, 5, 10)
  pad('U1', P(i), 390, 5, 10)
  pad('U1', 430, Q(i), 10, 5)
  pad('U1', 570, Q(i), 10, 5)
}
stub(`M${P(3)} 393V425`, 0.7)
via(P(3), 428)
stub(`M${P(4)} 393V440`, 0.7)
via(P(4), 443)

const SIDE = [105, 120, 135, 150, 165, 180]
// U2
SIDE.forEach((y, i) => {
  pad('U2', 75, y, 10, 7)
  pad('U2', 305, y, 10, 7)
  stub(`M70 ${y}H${i % 2 ? 58 : 50}`, 0.8)
  via(i % 2 ? 55 : 47, y)
})
;[120, 140, 160, 180, 220, 240, 260, 280].forEach((x) => pad('U2', x, 207, 7, 10))
;[105, 180].forEach((y) => {
  stub(`M310 ${y}H335`, 0.8)
  via(338, y)
})
;[120, 140, 160, 180].forEach((x, i) => {
  stub(`M${x} 212V${i % 2 ? 240 : 232}`, 0.8)
  via(x, i % 2 ? 243 : 235)
})
// U3
SIDE.forEach((y, i) => {
  pad('U3', 695, y, 10, 7)
  pad('U3', 925, y, 10, 7)
  stub(`M930 ${y}H${i % 2 ? 942 : 950}`, 0.8)
  via(i % 2 ? 945 : 953, y)
})
;[740, 760, 780, 800, 820, 840, 860, 880].forEach((x) => pad('U3', x, 207, 7, 10))
;[105, 180].forEach((y) => {
  stub(`M690 ${y}H665`, 0.8)
  via(662, y)
})
;[820, 840, 860, 880].forEach((x, i) => {
  stub(`M${x} 212V${i % 2 ? 240 : 232}`, 0.8)
  via(x, i % 2 ? 243 : 235)
})
// U4
;[760, 780, 800, 820, 840, 860, 880].forEach((x) => pad('U4', x, 415, 7, 10))
;[740, 760, 780, 800, 820, 840, 860, 880].forEach((x) => pad('U4', x, 535, 7, 10))
;[840, 860, 880].forEach((x, i) => {
  stub(`M${x} 410V${i % 2 ? 392 : 385}`, 0.8)
  via(x, i % 2 ? 389 : 382)
})
;[740, 760, 780, 800, 820, 840, 860, 880].forEach((x, i) => {
  stub(`M${x} 540V${i % 2 ? 560 : 552}`, 0.8)
  via(x, i % 2 ? 563 : 555)
})
// J1 header: square pin 1, round pins 2..4
const J1_X = [110, 136, 162, 188]
J1_X.forEach((x, i) => {
  if (i === 0) pad('J1', x, 520, 16, 16, 0.6)
  else PADS.push({ o: 'J1', x, y: 520, w: 0, h: 0, d: 0.6, r: 8 })
})
// power: U5 LDO, Y1 crystal, passives
pad('PWR', 320, 485, 22, 42, 0.7)
pad('PWR', 404, 475, 10, 7, 0.7)
pad('PWR', 404, 495, 10, 7, 0.7)
pad('PWR', P(2), 478, 14, 18, 0.7)
pad('PWR', P(5), 478, 14, 18, 0.7)
// two-pad passives: [x, y, vertical?]
;(
  [
    [600, 440, 0],
    [645, 470, 0],
    [365, 222, 0],
    [400, 222, 0],
    [615, 238, 0],
    [650, 238, 0],
    [270, 430, 1],
    [270, 470, 1],
    [620, 520, 0],
  ] as const
).forEach(([x, y, v]) => {
  if (v) {
    pad('PWR', x, y - 7, 10, 8, 0.8)
    pad('PWR', x, y + 7, 10, 8, 0.8)
  } else {
    pad('PWR', x, y, 8, 10, 0.8)
    pad('PWR', x + 14, y, 8, 10, 0.8)
  }
})
stub('M614 440H632V470H645', 0.9)
stub('M270 477V500H312', 0.9)

const PADSETS = ['U1', 'U2', 'U3', 'U4', 'J1', 'PWR']
const HOLES = [
  [34, 34],
  [966, 34],
  [34, 566],
  [966, 566],
]
const PASSIVE_LABELS: [string, number, number][] = [
  ['R1', 360, 210],
  ['R2', 395, 210],
  ['C1', 610, 226],
  ['C2', 645, 226],
  ['C3', 598, 428],
  ['C4', 643, 458],
  ['R3', 282, 434],
  ['R4', 282, 474],
  ['C5', 618, 508],
]

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties

/** Lock-on brackets around a chip (the About window's detection frame). */
function Brackets({
  x,
  y,
  w,
  h,
  m = 12,
  L = 16,
}: {
  x: number
  y: number
  w: number
  h: number
  m?: number
  L?: number
}) {
  const [x0, y0, x1, y1] = [x - m, y - m, x + w + m, y + h + m]
  return (
    <g className="dev-brk">
      <path
        d={`M${x0} ${y0 + L}V${y0}H${x0 + L} M${x1 - L} ${y0}H${x1}V${y0 + L} M${x1} ${y1 - L}V${y1}H${x1 - L} M${x0 + L} ${y1}H${x0}V${y1 - L}`}
      />
    </g>
  )
}

/** Probe readout. Owns the voltage jitter so its 120ms tick re-renders only this row. */
function Probe({ part }: { part?: Part }) {
  const [volt, setVolt] = useState(IDLE_V)
  const ref = part?.ref
  const dnp = part?.dnp
  useEffect(() => {
    if (!ref) return
    const t = setInterval(
      () =>
        setVolt(
          dnp ? (Math.random() * 0.08).toFixed(2) : (3.3 + (Math.random() - 0.5) * 0.04).toFixed(2),
        ),
      120,
    )
    return () => clearInterval(t)
  }, [ref, dnp])
  return (
    <div className="dev-probe">
      <span>
        PROBE <b>{part ? part.ref : '—'}</b>
      </span>
      <span>
        NETS <b>{part ? part.nets : IDLE_NETS}</b>
      </span>
      <span className="dev-live">
        V <b>{part ? volt : IDLE_V}</b>
      </span>
      <span>
        STATUS <b>{part ? part.status : 'IDLE · SAMPLING'}</b>
      </span>
    </div>
  )
}

/**
 * "HUD trace": the projects laid out as one PCB under probe, with a bill of materials
 * below. Hovering or focusing a part (chip or BOM row) lights its nets and shows a callout.
 * The board is aria-hidden and mouse-only; the BOM rows are the keyboard / screen-reader path.
 */
export function ProjectsWindow() {
  const { openApp } = useWindows()
  const projects = articlesByKind('project')
  const [hot, setHot] = useState<string | null>(null)
  const [shown, setShown] = useState<string | null>(null) // last callout, so it can fade out
  const buses = useRef<(SVGGElement | null)[]>([])

  const parts: Record<string, Part> = { J1: { ref: 'J1', ...J1 } }
  for (const p of projects) {
    const b = BOARD[p.slug]
    if (b) parts[b.ref] = { ...b, title: p.title, summary: p.summary }
  }
  const probe = (ref: string | null) => {
    setHot(ref)
    if (ref && parts[ref]) setShown(ref)
  }
  const open = (slug: string) => openApp('article', { slug })

  // idle: U1 keeps sending a pulse down a random bus
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timeouts = new Set<ReturnType<typeof setTimeout>>()
    const id = setInterval(() => {
      if (document.hidden) return
      const gs = buses.current.filter((g): g is SVGGElement => !!g)
      const g = gs[Math.floor(Math.random() * gs.length)]
      if (!g || g.classList.contains('dev-hot')) return
      g.removeAttribute('data-ping')
      void g.getBBox() // restart the CSS animation
      g.setAttribute('data-ping', '')
      const t = setTimeout(() => {
        g.removeAttribute('data-ping')
        timeouts.delete(t)
      }, 1800)
      timeouts.add(t)
    }, 650)
    return () => {
      clearInterval(id)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  const cls = (base: string, ref: string) => (hot === ref ? `${base} dev-hot` : base)
  const callout = shown ? parts[shown] : undefined
  const chips = projects.flatMap((p) => (BOARD[p.slug] ? [{ slug: p.slug, ...BOARD[p.slug] }] : []))

  return (
    <div className="dev">
      <p className="dev-sub">
        What I&apos;ve been building, laid out as one board. Hover a part to probe it; click to read
        the write-up.
      </p>

      <div className="dev-stack" onMouseLeave={() => probe(null)}>
        <svg className="dev-board" viewBox="0 0 1000 600" aria-hidden="true">
          <defs>
            <pattern id="dev-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.9" fill="rgb(255 255 255 / .12)" />
            </pattern>
          </defs>

          {/* substrate */}
          <rect className="dev-substrate" x="10" y="10" width="980" height="580" rx="18" />
          <rect
            className="dev-grid"
            x="10"
            y="10"
            width="980"
            height="580"
            rx="18"
            fill="url(#dev-dots)"
          />

          {/* copper */}
          {BUSES.map((b, i) => (
            <g
              key={i}
              ref={(el) => {
                buses.current[i] = el
              }}
              className={`dev-bus${b.dnp ? 'dev-dnp' : ''}${hot === b.owner ? 'dev-hot' : ''}`}
            >
              {b.paths.map((d, k) => (
                <g key={k}>
                  <path
                    className="dev-trace"
                    d={d}
                    pathLength={100}
                    style={delay(b.d + k * 0.05)}
                  />
                  <path
                    className="dev-pulse"
                    d={d}
                    pathLength={100}
                    style={{ '--pd': `${k * 0.12}s` } as CSSProperties}
                  />
                </g>
              ))}
            </g>
          ))}
          {STUBS.map((s, i) => (
            <path
              key={i}
              className="dev-trace dev-thin"
              d={s.d}
              pathLength={100}
              style={delay(s.delay)}
            />
          ))}
          {PADSETS.map((o) => (
            <g key={o} className={cls('dev-padset', o)}>
              {PADS.filter((p) => p.o === o).map((p, i) =>
                p.r ? (
                  <circle
                    key={i}
                    className="dev-pad"
                    cx={p.x}
                    cy={p.y}
                    r={p.r}
                    style={delay(p.d)}
                  />
                ) : (
                  <rect
                    key={i}
                    className="dev-pad"
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.h}
                    rx="1"
                    style={delay(p.d)}
                  />
                ),
              )}
            </g>
          ))}
          {VIAS.map(([x, y], i) => (
            <g key={i}>
              <circle className="dev-via" cx={x} cy={y} r="4.6" />
              <circle className="dev-via-hole" cx={x} cy={y} r="1.9" />
            </g>
          ))}
          {J1_X.map((x) => (
            <circle key={x} className="dev-via-hole" cx={x} cy="520" r="3.4" />
          ))}
          {HOLES.map(([x, y]) => (
            <g key={x + '-' + y}>
              <circle className="dev-hole" cx={x} cy={y} r="11" />
              <circle className="dev-hole-in" cx={x} cy={y} r="8.5" />
            </g>
          ))}

          {/* silkscreen + hit areas, on top */}
          <g className="dev-silk">
            {/* U1 core */}
            <rect className="dev-s-line" x="440" y="260" width="120" height="120" />
            <circle cx="452" cy="272" r="3" fill="var(--dev-silk)" />
            <text x="500" y="314" className="dev-s-name" textAnchor="middle">
              JUN·CORE
            </text>
            <text x="500" y="332" className="dev-s-tag" textAnchor="middle">
              MCU · BOTTOM-UP
            </text>
            <text x="418" y="232" className="dev-s-txt">
              U1
            </text>
            <path
              className="dev-s-line"
              d={`M${P(7) - 5} 397L${P(7) + 5} 407M${P(7) + 5} 397L${P(7) - 5} 407`}
            />
            <text x={P(7) + 10} y="420" className="dev-s-dim">
              FEELINGS · NC
            </text>

            {/* project chips */}
            {chips.map(({ slug, ref, label, tags, dnp, chip: c }) => (
              <g
                key={ref}
                className={cls('dev-chip', ref)}
                onMouseEnter={() => probe(ref)}
                onMouseLeave={() => probe(null)}
                onClick={() => open(slug)}
              >
                <rect className="dev-body" x={c.x} y={c.y} width={c.w} height={c.h} />
                <rect
                  className="dev-s-line"
                  x={c.x}
                  y={c.y}
                  width={c.w}
                  height={c.h}
                  strokeDasharray={dnp ? '6 4' : undefined}
                />
                <circle cx={c.x + 12} cy={c.y + 12} r="3" fill="var(--dev-silk)" />
                <text x={c.x - 18} y={c.y - 22} className="dev-s-txt">
                  {ref}
                </text>
                <text
                  x={c.x + c.w / 2}
                  y={c.y + c.h / 2 + 2}
                  className="dev-s-name"
                  textAnchor="middle"
                >
                  {label}
                </text>
                <text
                  x={c.x + c.w / 2}
                  y={c.y + c.h / 2 + 20}
                  className="dev-s-tag"
                  textAnchor="middle"
                >
                  {tags}
                </text>
                {dnp && (
                  <text
                    x={c.x + c.w - 14}
                    y={c.y + c.h - 12}
                    className="dnp-stamp"
                    textAnchor="end"
                    transform={`rotate(-8 ${c.x + c.w} ${c.y + c.h})`}
                  >
                    DNP
                  </text>
                )}
                <Brackets x={c.x} y={c.y} w={c.w} h={c.h} />
                <rect
                  className="dev-hit"
                  x={c.x - 18}
                  y={c.y - 16}
                  width={c.w + 36}
                  height={c.h + 32}
                />
              </g>
            ))}
            {BOARD['repo-understanding-tool'] && (
              <text x="718" y="396" className="dev-s-dim">
                ✂ CUT
              </text>
            )}

            {/* J1: a real link, out of the tab order because the board is aria-hidden */}
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
              <g
                className={cls('dev-chip', 'J1')}
                onMouseEnter={() => probe('J1')}
                onMouseLeave={() => probe(null)}
              >
                <rect className="dev-s-line" x="96" y="506" width="106" height="28" />
                <text x="96" y="554" className="dev-s-txt">
                  J1 · GITHUB ↗
                </text>
                <Brackets x={96} y={506} w={106} h={28} m={8} L={10} />
                <rect className="dev-hit" x="86" y="496" width="126" height="66" />
              </g>
            </a>

            {/* U5, Y1, LEDs, passive labels */}
            <rect className="dev-s-line" x="330" y="462" width="66" height="46" />
            <text x="304" y="528" className="dev-s-dim">
              U5 · LDO · COFFEE→3V3
            </text>
            <rect className="dev-s-line" x="466" y="464" width="68" height="28" rx="14" />
            <text x="470" y="512" className="dev-s-dim">
              Y1 · 1-STEP CLK
            </text>
            {PASSIVE_LABELS.map(([s, x, y]) => (
              <text key={s} x={x} y={y} className="dev-s-dim">
                {s}
              </text>
            ))}
            <circle className="dev-led" cx="232" cy="450" r="5" />
            <text x="222" y="470" className="dev-s-dim">
              PWR
            </text>
            <circle className="dev-led dev-slow" cx="905" cy="62" r="5" />
            <text x="895" y="50" className="dev-s-dim" textAnchor="end">
              D2 · LIVE
            </text>
            {/* board title */}
            <text
              x="500"
              y="50"
              className="dev-s-txt"
              textAnchor="middle"
              style={{ fontSize: 13, letterSpacing: '.3em' }}
            >
              JUN·OS DEV BOARD
            </text>
            <text x="500" y="66" className="dev-s-dim" textAnchor="middle">
              REV 0.3 · 2026-10 · SAN FRANCISCO
            </text>
            <text x="940" y="584" className="dev-s-dim" textAnchor="end">
              BUILT BOTTOM-UP · VERIFIED BY HAND
            </text>
          </g>
        </svg>

        <div
          className={`dev-callout${hot && callout ? 'dev-on' : ''}`}
          style={callout?.call}
          aria-hidden="true"
        >
          <div className="dev-co-ref">
            <span>{callout && `${callout.ref} · ${callout.tags}`}</span>
            <span>{callout?.status}</span>
          </div>
          <h3>{callout?.title}</h3>
          <p>{callout?.summary}</p>
          <div className="dev-co-go">
            {callout?.ref === 'J1' ? 'CLICK TO OPEN ↗' : 'CLICK TO OPEN ▸'}
          </div>
        </div>
      </div>

      <Probe part={hot ? parts[hot] : undefined} />

      <div className="dev-k dev-sec">◢ BILL OF MATERIALS</div>
      <div className="dev-rows">
        {projects.map((p) => {
          const b = BOARD[p.slug]
          const ref = b?.ref ?? p.slug
          return (
            <button
              key={p.slug}
              type="button"
              className={cls('dev-row', ref)}
              onMouseEnter={() => probe(ref)}
              onMouseLeave={() => probe(null)}
              onFocus={() => probe(ref)}
              onBlur={() => probe(null)}
              onClick={() => open(p.slug)}
            >
              <span className="dev-n">{b?.ref ?? '—'}</span>
              <span className="dev-t">{p.title}</span>
              <span className="dev-d">{p.summary}</span>
              <span className={`dev-st${b?.dnp ? 'dev-off' : ''}`}>{b && `● ${b.status}`}</span>
              <span className="dev-go">OPEN ▸</span>
            </button>
          )
        })}
        <a
          className={cls('dev-row', 'J1')}
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => probe('J1')}
          onMouseLeave={() => probe(null)}
          onFocus={() => probe('J1')}
          onBlur={() => probe(null)}
        >
          <span className="dev-n">J1</span>
          <span className="dev-t">{J1.title}</span>
          <span className="dev-d">{J1.summary}</span>
          <span className="dev-st">● {J1.status}</span>
          <span className="dev-go">OPEN ↗</span>
        </a>
      </div>
    </div>
  )
}
