/**
 * The Call Me window's digital twin: Jun's photo as a 3D point-cloud bust standing on a
 * radar projector, plus the per-channel volume bars. Plain canvas 2D, no React, so
 * SupportWindow just feeds it levels each frame.
 *
 * The bust comes from /media/jun-cutout.png (a background-free cutout of the photo):
 * each mask row becomes a rounded cross-section for depth, brightness adds relief, and
 * no rotation; depth reads from shading, a glowing rim and a perspective swell.
 */

export type Phase = 'idle' | 'connecting' | 'speaking' | 'listening'
export type Levels = { ai: number; you: number } // 0..1 each
/** Space-separated RGB triples from theme.css, plus the canvas font family. */
export type Palette = { cyan: string; amber: string; green: string; font: string }
/** A bust point: position (x centred, y 0..1 down, z ≥ 0 towards the viewer), edge distance e, fade f, brightness b. */
type Pt = { x: number; y: number; z: number; e: number; f: number; b: number }
/** Bust points grouped by brightness, so a frame sets one fill colour per group instead of per point. */
export type Twin = Pt[][]
const BUCKETS = 32

const C = (rgb: string, a: number) => `rgb(${rgb} / ${a})`
/** `rgb` moved `k` of the way to white. */
const tint = (rgb: string, k: number) =>
  rgb
    .split(/\s+/)
    .map((c) => Math.round(+c + (255 - +c) * k))
    .join(' ')
const CROP = 0.67 // top 2/3 of the cutout: head + upper chest
const ROWS = 200
const K = 0.22 // floor ellipse squash: how flat the projector looks
const TAU = Math.PI * 2

/** Load the cutout and turn it into the bust (browser only: it reads pixels off a canvas). */
export async function loadTwin(url: string): Promise<Twin> {
  const img = new Image()
  img.src = url
  await img.decode()
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const g = c.getContext('2d')!
  g.drawImage(img, 0, 0)
  const d = g.getImageData(0, 0, c.width, c.height).data
  const n = c.width * c.height
  const v = new Float32Array(n)
  const a = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    v[i] = (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255
    a[i] = d[i * 4 + 3] / 255
  }
  const twin: Twin = Array.from({ length: BUCKETS }, () => [])
  for (const p of bustPoints(enhance(v, a, c.width, c.height), a, c.width, c.height))
    twin[Math.min(BUCKETS - 1, Math.floor(p.b * BUCKETS))].push(p)
  return twin
}

/** The photo is backlit: stretch contrast over the subject only (2nd–98th percentile), then unsharp-mask it. */
function enhance(v: Float32Array, a: Float32Array, w: number, h: number) {
  const on = Array.from(v)
    .filter((_, i) => a[i] > 0.3)
    .sort((p, q) => p - q)
  const lo = on[(on.length * 0.02) | 0] ?? 0
  const hi = on[(on.length * 0.98) | 0] ?? 1
  const s = v.map((x) => Math.min(1, Math.max(0, (x - lo) / (hi - lo || 1))) ** 0.8)
  const R = 3
  const out = new Float32Array(s.length) // v + 1.2·(v − boxblur(v))
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let sum = 0
      let n = 0
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const yy = y + dy
          const xx = x + dx
          if (yy >= 0 && yy < h && xx >= 0 && xx < w) {
            sum += s[yy * w + xx]
            n++
          }
        }
      const i = y * w + x
      out[i] = Math.min(1, Math.max(0, s[i] + 1.2 * (s[i] - sum / n)))
    }
  return out
}

/** Brightness + alpha maps → bust points, shaded like a solid (lit from the front) with a glowing rim. */
export function bustPoints(v: Float32Array, a: Float32Array, w: number, h: number): Pt[] {
  const at = (x: number, y: number) =>
    Math.min(h - 1, Math.max(0, (y * h) | 0)) * w + Math.min(w - 1, Math.max(0, (x * w) | 0))
  const pts: Pt[] = []
  const asp = w / (h * CROP)
  const cols = Math.round(ROWS * asp)
  for (let r = 0; r < ROWS; r++) {
    const y = r / ROWS
    const sy = y * CROP
    let l = -1
    let rr = -1
    for (let c = 0; c < cols; c++)
      if (a[at(c / cols, sy)] > 0.3) {
        if (l < 0) l = c
        rr = c
      }
    if (l < 0) continue
    const mid = (l + rr) / 2 / cols
    const hw = Math.max(0.01, (rr - l + 1) / 2 / cols)
    const fade = y > 0.72 ? 1 - (y - 0.72) / 0.28 : 1 // the chest dissolves into the projector
    for (let c = l; c <= rr; c++) {
      const nx = c / cols
      const i = at(nx, sy)
      if (a[i] < 0.3 || Math.random() > fade) continue
      const u = (nx - mid) / hw
      const d = Math.sqrt(Math.max(0, 1 - u * u)) * hw * asp * 0.85
      const z = d + v[i] * 0.025
      const e = Math.abs(u)
      const face = Math.min(1, Math.max(0.2, 0.5 + z * 2.4))
      const rim = Math.max(0, (e - 0.82) / 0.18) ** 2
      const b = Math.max((0.2 + 0.8 * v[i]) * face, rim * 0.8) * fade
      pts.push({ x: (nx - 0.5) * asp, y, z, e, f: fade, b })
    }
  }
  return pts
}

/** Size a canvas's backing store to its CSS box × DPR; returns the context and the CSS size. */
function fit(c: HTMLCanvasElement): [CanvasRenderingContext2D, number, number] {
  const r = c.getBoundingClientRect()
  const d = devicePixelRatio || 1
  const w = Math.round(r.width * d)
  const h = Math.round(r.height * d)
  if (c.width !== w || c.height !== h) {
    c.width = w
    c.height = h
  }
  const g = c.getContext('2d')!
  g.setTransform(d, 0, 0, d, 0, 0)
  return [g, r.width, r.height]
}

// ---- the radar projector: rings on a floor ellipse, the back half drawn behind the bust and the front half in front ----
type Ctx = { g: CanvasRenderingContext2D; cx: number; baseY: number; S: number; pal: Palette }
type Half = 'back' | 'front'
const P = (c: Ctx, r: number, a: number): [number, number] => [
  c.cx + Math.cos(a) * r,
  c.baseY + Math.sin(a) * r * K,
]
const inHalf = (a: number, half: Half) => Math.sin(a) >= 0 === (half === 'front')
const depth = (a: number) => 0.35 + (0.65 * (Math.sin(a) + 1)) / 2

function ring(c: Ctx, half: Half, r: number, col: string, al: number, lw = 1) {
  const { g } = c
  g.strokeStyle = C(col, al * (half === 'back' ? 0.5 : 1))
  g.lineWidth = lw
  g.beginPath()
  let on = false
  for (let a = 0; a <= TAU; a += 0.015) {
    if (!inHalf(a, half)) {
      on = false
      continue
    }
    const [x, y] = P(c, r, a)
    if (on) g.lineTo(x, y)
    else g.moveTo(x, y)
    on = true
  }
  g.stroke()
}

function labels(c: Ctx, half: Half, r: number, items: string[], rot: number, col: string) {
  const { g } = c
  g.textAlign = 'center'
  items.forEach((txt, i) => {
    const a = rot + (i / items.length) * TAU
    if (!inHalf(a, half)) return
    const [x, y] = P(c, r, a)
    const d = depth(a)
    g.font = `500 ${(7 + 3 * d).toFixed(1)}px ${c.pal.font}`
    g.fillStyle = C(col, 0.9 * d)
    g.fillText(txt, x, y + 3)
  })
}

const DEG = Array.from({ length: 12 }, (_, i) => String(i * 30).padStart(3, '0'))

function radar(c: Ctx, half: Half, t: number, lv: Levels) {
  const { g, S, cx, baseY, pal } = c
  const r = S * 0.46
  const sw = t * 1.1
  if (half === 'back') {
    // the sweep: ten fading slices trailing the beam
    for (let j = 0; j < 10; j++) {
      const a1 = sw - j * 0.07
      g.fillStyle = C(pal.cyan, 0.16 * (1 - j / 10))
      g.beginPath()
      g.moveTo(cx, baseY)
      for (let a = a1 - 0.07; a <= a1 + 1e-6; a += 0.01) g.lineTo(...P(c, r, a))
      g.fill()
    }
    g.strokeStyle = C(pal.cyan, 0.2)
    g.lineWidth = 1
    g.beginPath()
    g.moveTo(cx - r, baseY)
    g.lineTo(cx + r, baseY)
    g.moveTo(cx, baseY - r * K)
    g.lineTo(cx, baseY + r * K)
    g.stroke()
  }
  // degree scale: ring, 72 ticks (every 6th long), 000–330
  ring(c, half, r, pal.cyan, 0.55, 1.2)
  g.lineWidth = 1
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * TAU
    if (!inHalf(a, half)) continue
    const major = i % 6 === 0
    const [x0, y0] = P(c, r, a)
    const [x1, y1] = P(c, r - (major ? 9.6 : 4), a)
    g.strokeStyle = C(pal.cyan, 0.5 * depth(a) * (major ? 1.6 : 1))
    g.beginPath()
    g.moveTo(x0, y0)
    g.lineTo(x1, y1)
    g.stroke()
  }
  labels(c, half, r + S * 0.06, DEG, 0, pal.cyan)
  // live readouts riding an inner ring, and an amber dot riding the sweep
  ring(c, half, S * 0.3, pal.cyan, 0.3)
  const lat = 180 + Math.round(lv.ai * 60)
  const sync = 97 + Math.round(lv.ai * 2)
  labels(
    c,
    half,
    S * 0.3,
    [`SYNC ${sync}%`, `LAT ${lat}ms`, 'TWIN v1', lv.you > lv.ai ? 'RX ▲' : 'TX ▲'],
    -t * 0.2,
    pal.amber,
  )
  if (inHalf(sw, half)) {
    const [x, y] = P(c, S * 0.3, sw)
    g.fillStyle = C(pal.amber, 0.95)
    g.beginPath()
    g.arc(x, y, 3, 0, TAU)
    g.fill()
  }
  if (half === 'front') {
    // the lens: a small, dim glow (no white-hot core) so the bust stays the brightest thing
    const lr = S * 0.05
    const gr = g.createRadialGradient(cx, baseY, 0, cx, baseY, lr)
    gr.addColorStop(0, C(pal.cyan, 0.55))
    gr.addColorStop(1, C(pal.cyan, 0))
    g.save()
    g.translate(cx, baseY)
    g.scale(1, K)
    g.translate(-cx, -baseY)
    g.fillStyle = gr
    g.beginPath()
    g.arc(cx, baseY, lr, 0, TAU)
    g.fill()
    g.restore()
  }
}

/**
 * One frame of the twin. `t` is seconds (hold it still for reduced motion); `still` also
 * turns off the random flicker and glitch.
 */
export function drawTwin(
  canvas: HTMLCanvasElement,
  twin: Twin | null,
  t: number,
  lv: Levels,
  phase: Phase,
  pal: Palette,
  still: boolean,
) {
  const [g, W, H] = fit(canvas)
  g.clearRect(0, 0, W, H)
  const S = Math.min(H * 0.58, W * 0.85) // the bust's height; also sizes the radar, so it fits narrow windows
  const cx = W / 2
  const cy = H * 0.13 + S / 2
  const c: Ctx = { g, cx, baseY: cy + S * 0.6, S, pal }
  const D = 2.6 // perspective: camera distance
  g.globalCompositeOperation = 'lighter'
  radar(c, 'back', t, lv)

  if (twin) {
    const scan = ((t * 0.3) % 1.3) - 0.15 // the amber band flowing down the bust
    const drop = phase === 'connecting' ? 0.45 : still ? 0 : 0.02
    const glitch = !still && lv.ai > 0.6 && Math.random() < 0.3 ? Math.random() : -1 // a band jumps sideways on loud syllables
    const gain = 0.6 + lv.ai * 0.35
    const plot = (p: Pt, solid: boolean) => {
      const sw = 1 + lv.ai * 0.05 * Math.sin(p.y * 22 - t * 14) // the voice swells the body as it climbs
      const f = D / (D - p.z * sw)
      const x = cx + p.x * sw * S * f + (Math.abs(p.y - glitch) < 0.03 ? 14 : 0)
      const y = cy + (p.y - 0.5) * S * f
      const sz = (0.7 + p.b * 1.1) * f
      if (solid) g.fillRect(x, y, sz, sz)
      else g.rect(x, y, sz, sz)
    }
    const band: Pt[] = []
    twin.forEach((group, k) => {
      g.fillStyle = C(pal.cyan, ((k + 0.5) / BUCKETS) * gain)
      g.beginPath()
      for (const p of group) {
        if (drop && Math.random() < drop) continue
        if (Math.abs(p.y - scan) < 1 / 40) band.push(p)
        else plot(p, false)
      }
      g.fill()
    })
    for (const p of band) {
      g.fillStyle = C(pal.amber, (0.35 + (1 - Math.abs(p.y - scan) * 40) * 0.65) * p.f)
      plot(p, true)
    }
  }

  radar(c, 'front', t, lv)
  g.globalCompositeOperation = 'source-over'
  g.fillStyle = C(pal.cyan, 0.8)
  g.font = `500 10px ${pal.font}`
  g.textAlign = 'center'
  g.fillText(
    phase === 'connecting' ? 'MATERIALISING…' : 'AI JUN · DIGITAL TWIN',
    cx,
    c.baseY + S * 0.6 * K + 26,
  )
}

/**
 * A channel's volume history as bars growing up from the baseline: newest on the right,
 * older ones fading as they scroll left, each brightest at its foot.
 */
export function drawBars(canvas: HTMLCanvasElement, hist: number[], col: string) {
  const foot = tint(col, 0.6)
  const [g, w, h] = fit(canvas)
  g.clearRect(0, 0, w, h)
  g.lineWidth = 2
  const step = 4
  const n = Math.floor(w / step)
  for (let i = 0; i < n; i++) {
    const v = hist[hist.length - 1 - i] ?? 0
    const x = w - 1 - i * step
    const bh = Math.max(1, Math.min(1, Math.sqrt(v) * 1.15) * (h - 2)) // sqrt: quiet syllables still read
    const gr = g.createLinearGradient(0, h, 0, h - bh)
    gr.addColorStop(0, C(foot, 1))
    gr.addColorStop(0.35, C(col, 0.85))
    gr.addColorStop(1, C(col, 0.25))
    g.globalAlpha = (0.25 + 0.75 * (1 - i / n)) * (0.45 + 0.55 * Math.min(1, v * 2))
    g.strokeStyle = gr
    g.beginPath()
    g.moveTo(x, h)
    g.lineTo(x, h - bh)
    g.stroke()
  }
  g.globalAlpha = 1
}
