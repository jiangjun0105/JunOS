// Camera flights, described the way they look on screen: an orbit around a target point.
//   yaw   = compass heading of the camera around the target (rad)
//   pitch = height angle above the horizon (rad): changing it is the "tilt"
//   dist  = distance to the target (m): changing only this is a straight "dolly" in / out
//   shift = px the projection centre slides left, so the target sits mid-way in the strip beside an open window
// A flight is a queue of legs; each leg eases any of those fields (plus `target`) over `ms`. Missing fields hold their value.
import * as THREE from 'three'

export const EASE = {
  inOut: (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2),
  out: (u) => 1 - (1 - u) ** 3, // starts at full speed: answers a click at once
}

// orbit fields of a camera at `pos` looking at `target`
export function orbitOf(pos, target) {
  const o = pos.clone().sub(target),
    dist = o.length()
  return { target: target.clone(), yaw: Math.atan2(o.x, o.z), pitch: Math.asin(o.y / dist), dist }
}

const lerp = (a, b, e) => a + (b - a) * e
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a)) // → (-π, π], so yaw turns the short way round

// → { fly(...legs), update(), resize(W, H), setShift(px), orbit(), get leg (current leg's name), get busy (a leg running or queued) }
export function createFlights(camera, controls) {
  let legs = [],
    leg = null,
    shift = 0,
    W = 1,
    H = 1

  // the camera renders a (W + 2·shift)-wide virtual view and shows its right-hand W px; aspect must be the virtual view's
  const applyShift = () => {
    camera.aspect = (W + 2 * shift) / H
    camera.setViewOffset(W + 2 * shift, H, 2 * shift, 0, W, H)
  }
  const orbit = () => ({ ...orbitOf(camera.position, controls.target), shift })

  function start(l) {
    const a = orbit()
    const b = {
      target: l.target ?? a.target,
      yaw: a.yaw + wrap((l.yaw ?? a.yaw) - a.yaw),
      pitch: l.pitch ?? a.pitch,
      dist: l.dist ?? a.dist,
      shift: l.shift ?? a.shift,
    }
    leg = { a, b, ms: l.ms, ease: l.ease ?? EASE.inOut, name: l.name, t0: performance.now() }
  }

  function update() {
    if (!leg && legs.length) start(legs.shift())
    if (!leg) return
    const { a, b } = leg
    const u = Math.min(1, (performance.now() - leg.t0) / leg.ms),
      e = leg.ease(u)
    const yaw = lerp(a.yaw, b.yaw, e),
      pitch = lerp(a.pitch, b.pitch, e),
      dist = lerp(a.dist, b.dist, e)
    controls.target.lerpVectors(a.target, b.target, e)
    camera.position
      .set(Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw))
      .multiplyScalar(dist)
      .add(controls.target)
    shift = lerp(a.shift, b.shift, e)
    applyShift()
    if (u >= 1) leg = null
  }

  return {
    fly: (...steps) => {
      legs = steps
      leg = null
    },
    update,
    resize: (w, h) => {
      W = w
      H = h
      applyShift()
    },
    setShift: (px) => {
      shift = px
      applyShift()
    },
    orbit,
    get leg() {
      return leg?.name ?? null
    },
    get busy() {
      return !!leg || legs.length > 0
    },
  }
}
