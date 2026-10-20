// Sailing lines: ferry routes out of the Ferry Building and the shipping lane under the Golden Gate, dashed on the water,
// with a boat shuttling along each. Waypoints are rough real routes ([lat, lon]), bent around the islands.
import * as THREE from 'three'
import { COLOR } from './config.js'
import { xz, polyline, rnd } from './geo.js'

const FERRY = [37.7955, -122.392]
const ROUTES = [
  {
    name: 'SAUSALITO',
    boats: 2,
    pts: [FERRY, [37.8085, -122.401], [37.818, -122.44], [37.842, -122.463], [37.8565, -122.477]],
  },
  {
    name: 'TIBURON',
    boats: 1,
    pts: [FERRY, [37.812, -122.399], [37.85, -122.41], [37.869, -122.424], [37.8735, -122.4545]],
  },
  { name: 'ALCATRAZ', boats: 1, pts: [FERRY, [37.8075, -122.403], [37.8235, -122.42]] },
  {
    name: 'OAKLAND',
    boats: 2,
    pts: [FERRY, [37.799, -122.378], [37.802, -122.345], [37.797, -122.321], [37.795, -122.295]],
  },
  {
    name: 'SHIPPING',
    boats: 3,
    ship: true,
    pts: [
      [37.79, -122.62],
      [37.809, -122.52],
      [37.8165, -122.479],
      [37.815, -122.445],
      [37.811, -122.405],
      [37.804, -122.38],
      [37.807, -122.342],
      [37.813, -122.325],
    ],
  },
]
const Y = 5 // just above the waves and the coastline
const SPEED = { ferry: 2.4, ship: 1.2 } // metres per frame

// → { group, update() }
export function buildSea() {
  const group = new THREE.Group(),
    boats = []
  for (const r of ROUTES) {
    const pts = r.pts.map((p) => xz(...p)),
      path = polyline(pts)
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts.map(([x, z]) => new THREE.Vector3(x, Y, z))),
      new THREE.LineDashedMaterial({
        color: r.ship ? COLOR.accent : COLOR.coast,
        dashSize: r.ship ? 220 : 140,
        gapSize: r.ship ? 140 : 100,
        transparent: true,
        opacity: r.ship ? 0.8 : 0.9,
      }),
    )
    line.computeLineDistances()
    group.add(line)
    // boats start spread along the route; ferries turn around at the ends, ships go out and come back in on the same lane
    for (let i = 0; i < r.boats; i++)
      boats.push({
        path,
        s: ((i + rnd()) / r.boats) * path.len,
        v: r.ship ? SPEED.ship : SPEED.ferry,
        ship: r.ship,
      })
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(new Float32Array(boats.length * 3), 3),
  )
  g.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(
      boats.flatMap((b) => (b.ship ? [1, 0.7, 0.25] : [0.85, 1, 1])),
      3,
    ),
  )
  const pos = g.attributes.position
  group.add(
    new THREE.Points(
      g,
      new THREE.PointsMaterial({ size: 7, sizeAttenuation: false, vertexColors: true }),
    ),
  )

  function update() {
    boats.forEach((b, i) => {
      b.s += b.v
      if (b.s > b.path.len || b.s < 0) {
        b.v = -b.v
        b.s = Math.min(Math.max(b.s, 0), b.path.len)
      }
      const [x, z] = b.path.at(b.s).p
      pos.setXYZ(i, x, Y + 2, z)
    })
    pos.needsUpdate = true
  }
  update()
  return { group, update }
}
