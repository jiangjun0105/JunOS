// Sailing lines: ferry routes out of the Ferry Building and the shipping lane under the Golden Gate, dashed on the water,
// with a boat shuttling along each. Waypoints are rough real routes ([lat, lon]), bent around the islands.
import * as THREE from 'three';
import { COLOR } from './config.js';
import { xz, polyline, rnd } from './geo.js';

const FERRY = [37.7955, -122.3920];
const ROUTES = [
  { name: 'SAUSALITO', boats: 2, pts: [FERRY, [37.8085, -122.4010], [37.8180, -122.4400], [37.8420, -122.4630], [37.8565, -122.4770]] },
  { name: 'TIBURON', boats: 1, pts: [FERRY, [37.8120, -122.3990], [37.8500, -122.4100], [37.8690, -122.4240], [37.8735, -122.4545]] },
  { name: 'ALCATRAZ', boats: 1, pts: [FERRY, [37.8075, -122.4030], [37.8235, -122.4200]] },
  { name: 'OAKLAND', boats: 2, pts: [FERRY, [37.7990, -122.3780], [37.8020, -122.3450], [37.7970, -122.3210], [37.7950, -122.2950]] },
  { name: 'SHIPPING', boats: 3, ship: true, pts: [[37.7900, -122.6200], [37.8090, -122.5200], [37.8165, -122.4790], [37.8150, -122.4450],
    [37.8110, -122.4050], [37.8040, -122.3800], [37.8070, -122.3420], [37.8130, -122.3250]] },
];
const Y = 5;                                    // just above the waves and the coastline
const SPEED = { ferry: 2.4, ship: 1.2 };        // metres per frame

// → { group, update() }
export function buildSea() {
  const group = new THREE.Group(), boats = [];
  for (const r of ROUTES) {
    const pts = r.pts.map(p => xz(...p)), path = polyline(pts);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(([x, z]) => new THREE.Vector3(x, Y, z))),
      new THREE.LineDashedMaterial({ color: r.ship ? COLOR.accent : COLOR.coast, dashSize: r.ship ? 220 : 140, gapSize: r.ship ? 140 : 100, transparent: true, opacity: r.ship ? .8 : .9 }));
    line.computeLineDistances();
    group.add(line);
    // boats start spread along the route; ferries turn around at the ends, ships go out and come back in on the same lane
    for (let i = 0; i < r.boats; i++) boats.push({ path, s: (i + rnd()) / r.boats * path.len, v: r.ship ? SPEED.ship : SPEED.ferry, ship: r.ship });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(boats.length * 3), 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(boats.flatMap(b => b.ship ? [1, .7, .25] : [.85, 1, 1]), 3));
  const pos = g.attributes.position;
  group.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 7, sizeAttenuation: false, vertexColors: true })));

  function update() {
    boats.forEach((b, i) => {
      b.s += b.v;
      if (b.s > b.path.len || b.s < 0) { b.v = -b.v; b.s = Math.min(Math.max(b.s, 0), b.path.len); }
      const [x, z] = b.path.at(b.s).p;
      pos.setXYZ(i, x, Y + 2, z);
    });
    pos.needsUpdate = true;
  }
  update();
  return { group, update };
}
