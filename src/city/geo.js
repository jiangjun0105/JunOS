// Shared math: the lat/lon ↔ scene projection, polyline walking, a seeded RNG, and a line-geometry helper.
import * as THREE from 'three'

// equirectangular around Civic Center; x = east, z = south, metres
const LAT0 = 37.7725,
  LON0 = -122.4175,
  KX = 111320 * Math.cos((LAT0 * Math.PI) / 180),
  KZ = 110540
export const xz = (lat, lon) => [(lon - LON0) * KX, -(lat - LAT0) * KZ]
export const ll = (x, z) => [LAT0 - z / KZ, LON0 + x / KX]
export const inBox = ([s, n, w, e], x, z) => {
  const [la, lo] = ll(x, z)
  return la > s && la < n && lo > w && lo < e
}
export const lerp = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u)

// deterministic, so the city looks the same on every load
export const rnd = (() => {
  let s = 7
  return () => (s = (s * 16807) % 2147483647) / 2147483647
})()

// arc-length lookup along [x, z, ...] points. at(s) → { p: interpolated point, d: unit [dx, dz] tangent }; extrapolates past the ends
export function polyline(pts) {
  const cum = [0]
  for (let k = 1; k < pts.length; k++)
    cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]))
  const at = (s) => {
    let k = 1
    while (k < pts.length - 1 && cum[k] < s) k++
    const a = pts[k - 1],
      b = pts[k],
      n = cum[k] - cum[k - 1] || 1
    return { p: lerp(a, b, (s - cum[k - 1]) / n), d: [(b[0] - a[0]) / n, (b[1] - a[1]) / n] }
  }
  return { len: cum.at(-1), at }
}

// flat [x, y, z, x, y, z, ...] pairs → LineSegments
export function lines(pts, mat, col) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  if (col) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return new THREE.LineSegments(g, mat)
}
