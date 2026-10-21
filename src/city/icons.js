// Desktop icons: DOM reticles over landmarks, a 3D pulse ring on the ground, and leader lines. Laid out in screen space every frame.
import * as THREE from 'three'
import { COLOR } from './config.js'
import { APPS, GLYPH, RETICLE } from './landmarks.js'
import { xz } from './geo.js'

export const FOCUS_SCALE = 1.9 // the open app's icon grows by this much

// → { pins, focus(app | null), update(t, camera, region) }. on.open(app, groundPoint) on click, on.hover(app | null) on enter / leave
export function createIcons(scene, layer, leads, groundY, on) {
  const pins = APPS.map((app, i) => {
    const [x, z] = xz(...app.at),
      gy = groundY(x, z)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1, 64),
      new THREE.MeshBasicMaterial({
        color: COLOR.accent,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.set(x, gy + 4, z)
    scene.add(ring)

    const el = document.createElement('button')
    el.className = 'ic3'
    el.innerHTML = `<div class="rg">${RETICLE}<svg class="g" viewBox="0 0 24 24">${GLYPH[app.id]}</svg></div><b>${app.label}</b><i>${app.place}</i>`
    layer.appendChild(el)

    const ld = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    ld.classList.add('ld')
    leads.appendChild(ld)

    const pin = {
      app,
      ring,
      el,
      ld,
      phase: i / APPS.length,
      at: new THREE.Vector3(x, gy + (app.lift || 0), z), // where the icon anchors (lifted to the top of towers)
      ground: new THREE.Vector3(x, gy, z),
      w: el.offsetWidth,
      h: el.offsetHeight,
      x: null,
      y: null,
      s: 1, // current screen position (bottom centre) and scale, eased
    }
    el.onclick = () => on.open(app, pin.ground)
    el.onmouseenter = el.onfocus = () => on.hover(app)
    el.onmouseleave = el.onblur = () => on.hover(null)
    return pin
  })

  // focus mode: the open app's icon grows, the others fade out of the way
  let focused = null,
    last = 0
  const focus = (app) => {
    focused = app
    for (const p of pins) {
      const away = !!app && p.app !== app
      p.el.classList.toggle('on', p.app === app)
      p.el.classList.toggle('away', away)
      p.ld.classList.toggle('away', away)
    }
  }

  const update = (t, camera, region) => {
    for (const p of pins) {
      const k = (t * 0.4 + p.phase) % 1
      p.ring.scale.setScalar(60 + k * 600)
      p.ring.material.opacity = (focused && p.app !== focused ? 0.15 : 0.9) * (1 - k)
    }
    const k = 1 - Math.exp(-15 * Math.min(0.1, t - last)) // frame-rate independent easing (≈ .25 per frame at 60 fps)
    last = t
    layout(focused ? pins.filter((p) => p.app === focused) : pins, camera, region, focused, k)
  }

  return { pins, focus, update }
}

// Each icon sits LIFT px above its landmark, clamped inside `region` ({ x0, x1, W, H }: the part of the W × H screen not under the open window).
// Collisions stack upward; if that would leave the top edge, the icon stacks downward from the top instead. Leader lines join icon → landmark.
// The focused icon skips the clamp and the x easing: it stays plumb over its landmark, so its leader is always vertical.
const sv = new THREE.Vector3(),
  LIFT = 36,
  TOPM = 44,
  PAD = 8
const hits = (a, b) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 && a.y - a.h < b.y && b.y - b.h < a.y // boxes: centre x, bottom y, w, h

function layout(pins, camera, { x0, x1, W, H }, focused, k) {
  const vis = [],
    placed = []
  for (const p of pins) {
    sv.copy(p.at).project(camera)
    const on = sv.z < 1 && Math.abs(sv.x) < 1.05 && Math.abs(sv.y) < 1.05
    p.el.style.display = p.ld.style.display = on ? '' : 'none'
    if (!on) {
      p.x = null
      continue
    }
    // icon height comes from the anchor (tower top); x and the leader from the ground point
    p.ay = ((1 - sv.y) / 2) * H
    sv.copy(p.ground).project(camera) // lifted icons still run their leader down to the ring's centre
    p.gx = ((sv.x + 1) / 2) * W
    p.gy = ((1 - sv.y) / 2) * H
    vis.push(p)
  }
  vis.sort((a, b) => b.ay - a.ay) // nearest to the bottom first, so far-away icons are the ones that move

  for (const p of vis) {
    p.s += (((focused ? FOCUS_SCALE : 1) - p.s) * k) / 2
    const w = p.w * p.s,
      h = p.h * p.s
    const bx = {
      x: focused ? p.gx : Math.min(x1 - w / 2 - PAD, Math.max(x0 + w / 2 + PAD, p.gx)),
      y: Math.min(H - PAD, Math.max(TOPM + h, p.ay - LIFT * p.s)),
      w,
      h,
    }
    for (let n = 0, hit; n <= placed.length && (hit = placed.find((q) => hits(q, bx))); n++)
      bx.y = hit.y - hit.h
    if (bx.y - bx.h < TOPM) {
      bx.y = TOPM + bx.h
      for (let n = 0, hit; n <= placed.length && (hit = placed.find((q) => hits(q, bx))); n++)
        bx.y = hit.y + bx.h
    }
    placed.push(bx)

    if (p.x === null) {
      p.x = bx.x
      p.y = bx.y
    } else {
      p.x = focused ? bx.x : p.x + (bx.x - p.x) * k
      p.y += (bx.y - p.y) * k
    }
    p.el.style.transform = `translate(${p.x - p.w / 2}px, ${p.y - p.h}px) scale(${p.s})` // origin: bottom centre (CSS)
    const ey = p.gy < p.y - h / 2 ? p.y - h : p.y // leader leaves the icon's bottom, or its top if the icon ended up below its landmark
    p.ld.setAttribute(
      'd',
      `M${p.x} ${ey}L${p.gx} ${p.gy}M${p.gx - 2.5} ${p.gy}a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0`,
    )
  }
}
