// OpenStreetMap layer: buildings, roads and the traffic running on them. Data = the snapshot, or a live Overpass query as fallback.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CITY, COLOR, OSM_SNAPSHOT } from './config.js';
import { xz, rnd, polyline, lines } from './geo.js';

// → { blds: [{ h, pts }], roads: [{ deck, pts }], coast: [pts] }, pts in scene [x, z]
export const loadOSM = () => snapshot().catch(overpass);

// sf-osm.json = { b: [[h, x, z, x, z, ...]], r: [[deck, x, z, ...]], c: [[x, z, ...]] }; built by build-sf-osm.py
async function snapshot() {
  const d = await (await fetch(OSM_SNAPSHOT)).json(), pairs = a => { const o = []; for (let i = 0; i < a.length; i += 2) o.push([a[i], a[i + 1]]); return o; };
  return { blds: d.b.map(([h, ...a]) => ({ h, pts: pairs(a) })), roads: d.r.map(([deck, ...a]) => ({ deck: !!deck, pts: pairs(a) })), coast: d.c.map(pairs) };
}
async function overpass() {
  const [S, N, W, E] = CITY, big = `${S},${W},${N},${E}`, dt = '37.7835,-122.4100,37.7990,-122.3880';
  const q = `[out:json][timeout:90];(
    way["building"](${dt});
    way["building"]["height"~"^([2-9][0-9]|[1-9][0-9]{2})"](${big});
    way["building"]["building:levels"~"^([6-9]|[1-9][0-9])$"](${big});
    way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](${big});
    way["highway"~"^(residential|unclassified)$"](${dt});
    way["man_made"="pier"](${big});
    way["natural"="coastline"](${big}););out geom tags;`;
  const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), signal: AbortSignal.timeout(90000) });
  const blds = [], roads = [], coast = [];
  for (const e of (await r.json()).elements) { if (!e.geometry) continue; const pts = e.geometry.map(p => xz(p.lat, p.lon)), t = e.tags;
    if (t.building) blds.push({ pts, h: parseFloat(t.height) || (parseFloat(t['building:levels']) * 3.4) || 9 + rnd() * 8 });
    else if (t.natural) coast.push(pts);
    else if (t.man_made) { const closed = pts.length > 3 && pts[0][0] === pts.at(-1)[0] && pts[0][1] === pts.at(-1)[1]; closed ? blds.push({ pts, h: 4 }) : roads.push({ pts }); }
    else roads.push({ pts, deck: t.bridge && /motorway|trunk/.test(t.highway) }); }
  return { blds, roads, coast };
}

// extruded footprints seated on the terrain at their centroid; dark fill + edges that brighten with height
function buildings(blds, groundY) {
  const geos = [];
  for (const { pts, h } of blds) { if (pts.length < 4) continue;
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))), { depth: h, bevelEnabled: false });
    g.deleteAttribute('uv'); g.deleteAttribute('normal'); g.translate(0, 0, groundY(cx, cz)); geos.push(g); }
  const m = mergeGeometries(geos); m.rotateX(-Math.PI / 2);
  const e = new THREE.EdgesGeometry(m, 30), p = e.attributes.position, c = [];
  for (let i = 0; i < p.count; i++) { const k = Math.min(1, p.getY(i) / 240); c.push(.05 + .55 * k, .45 + .5 * k, .55 + .45 * k); }
  e.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  const g = new THREE.Group().add(new THREE.Mesh(m, new THREE.MeshBasicMaterial({ color: COLOR.building, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })),
    new THREE.LineSegments(e, new THREE.LineBasicMaterial({ vertexColors: true })));
  return { group: g, count: geos.length };
}

// light dots running both ways along random roads (pts = [x, z, y]); update() advances them one frame
function traffic(roads, n = 1500) {
  const cars = [], long = roads.filter(r => r.length > 1);
  for (let i = 0; i < n; i++) { const path = polyline(long[Math.floor(rnd() * long.length)]);
    if (path.len >= 60) cars.push({ path, s: rnd() * path.len, v: (3 + rnd() * 5) * (rnd() < .5 ? -1 : 1) }); }
  const g = new THREE.BufferGeometry(), col = cars.flatMap(c => c.v > 0 ? [1, .85, .6] : [1, .3, .25]);
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(cars.length * 3), 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const points = new THREE.Points(g, new THREE.PointsMaterial({ size: 14, vertexColors: true })), pos = g.attributes.position;
  const update = () => { cars.forEach((c, i) => { c.s = (c.s + c.v + c.path.len) % c.path.len; const [x, z, y] = c.path.at(c.s).p; pos.setXYZ(i, x, y + 2, z); }); pos.needsUpdate = true; };
  return { points, count: cars.length, update };
}

// → { group, stats, update }
export function buildCity({ blds, roads }, groundY) {
  const b = buildings(blds, groundY);
  // roads drape over the terrain; bridge decks ride at ≥ 60 m
  const r3 = roads.map(r => r.pts.map(([x, z]) => [x, z, r.deck ? Math.max(groundY(x, z) + 2, 60) : groundY(x, z) + 2]));
  const rp = []; for (const r of r3) for (let i = 1; i < r.length; i++) { const a = r[i - 1], c = r[i]; rp.push(a[0], a[2], a[1], c[0], c[2], c[1]); }
  const cars = traffic(r3);
  const group = new THREE.Group().add(b.group, lines(rp, new THREE.LineBasicMaterial({ color: COLOR.cyan, transparent: true, opacity: .4 })), cars.points);
  return { group, stats: `${b.count} BUILDINGS · ${roads.length} ROADS · ${cars.count} VEHICLES`, update: cars.update };
}
