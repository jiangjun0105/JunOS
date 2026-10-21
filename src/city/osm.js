// OpenStreetMap layer: buildings, roads and the traffic running on them. Data = the static snapshot.
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { COLOR } from './config.js'
import { rnd, polyline, lines, segs, movers } from './geo.js'

// → { blds: [{ h, pts }], roads: [{ deck, pts }], coast: [pts] }, pts in scene [x, z]
// sf-osm.json = { b: [[h, x, z, x, z, ...]], r: [[deck, x, z, ...]], c: [[x, z, ...]] }; built by build-sf-osm.py
export async function loadOSM() {
  const d = await (await fetch('/city/sf-osm.json')).json(),
    pairs = (a) => {
      const o = []
      for (let i = 0; i < a.length; i += 2) o.push([a[i], a[i + 1]])
      return o
    }
  return {
    blds: d.b.map(([h, ...a]) => ({ h, pts: pairs(a) })),
    roads: d.r.map(([deck, ...a]) => ({ deck: !!deck, pts: pairs(a) })),
    coast: d.c.map(pairs),
  }
}
// extruded footprints seated on the terrain at their centroid; dark fill + edges that brighten with height
function buildings(blds, groundY) {
  const geos = []
  for (const { pts, h } of blds) {
    if (pts.length < 4) continue
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length,
      cz = pts.reduce((s, p) => s + p[1], 0) / pts.length
    const g = new THREE.ExtrudeGeometry(
      new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))),
      { depth: h, bevelEnabled: false },
    )
    g.deleteAttribute('uv')
    g.deleteAttribute('normal')
    g.translate(0, 0, groundY(cx, cz))
    geos.push(g)
  }
  const m = mergeGeometries(geos)
  m.rotateX(-Math.PI / 2)
  const e = new THREE.EdgesGeometry(m, 30),
    p = e.attributes.position,
    c = []
  for (let i = 0; i < p.count; i++) {
    const k = Math.min(1, p.getY(i) / 240)
    c.push(0.05 + 0.55 * k, 0.45 + 0.5 * k, 0.55 + 0.45 * k)
  }
  e.setAttribute('color', new THREE.Float32BufferAttribute(c, 3))
  const g = new THREE.Group().add(
    new THREE.Mesh(
      m,
      new THREE.MeshBasicMaterial({
        color: COLOR.building,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    ),
    new THREE.LineSegments(e, new THREE.LineBasicMaterial({ vertexColors: true })),
  )
  return { group: g, count: geos.length }
}

// light dots running both ways along random roads (pts = [x, z, y]); update() advances them one frame
function traffic(roads, n = 1500) {
  const cars = [],
    long = roads.filter((r) => r.length > 1)
  for (let i = 0; i < n; i++) {
    const path = polyline(long[Math.floor(rnd() * long.length)])
    if (path.len >= 60)
      cars.push({ path, s: rnd() * path.len, v: (3 + rnd() * 5) * (rnd() < 0.5 ? -1 : 1) })
  }
  const { points, update } = movers(
    cars,
    cars.flatMap((c) => (c.v > 0 ? [1, 0.85, 0.6] : [1, 0.3, 0.25])),
    new THREE.PointsMaterial({ size: 14, vertexColors: true }),
    (c) => {
      c.s = (c.s + c.v + c.path.len) % c.path.len
      const [x, z, y] = c.path.at(c.s).p
      return [x, y + 2, z]
    },
  )
  return { points, count: cars.length, update }
}

// → { group, stats, update }
export function buildCity({ blds, roads }, groundY) {
  const b = buildings(blds, groundY)
  // roads drape over the terrain; bridge decks ride at ≥ 60 m
  const r3 = roads.map((r) =>
    r.pts.map(([x, z]) => [x, z, r.deck ? Math.max(groundY(x, z) + 2, 60) : groundY(x, z) + 2]),
  )
  const rp = r3.flatMap((r) => segs(r))
  const cars = traffic(r3)
  const group = new THREE.Group().add(
    b.group,
    lines(rp, new THREE.LineBasicMaterial({ color: COLOR.cyan, transparent: true, opacity: 0.4 })),
    cars.points,
  )
  return {
    group,
    stats: `${b.count} BUILDINGS · ${roads.length} ROADS · ${cars.count} VEHICLES`,
    update: cars.update,
  }
}
