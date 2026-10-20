// Terrain: AWS Terrarium elevation tiles → one graded wire grid (land + animated sea), fine island meshes, and the coastline.
import * as THREE from 'three';
import { EX, CITY, REGION, ISLANDS, COLOR } from './config.js';
import { xz, ll, inBox, lines } from './geo.js';

// one zoom level over a [S, N, W, E] box → (x, z) => metres (negative = bay floor). Pixels: R*256 + G + B/256 - 32768
async function dem(Z, [s, n, w, e]) {
  const tx = lon => (lon + 180) / 360 * 2 ** Z, ty = lat => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** Z; };
  const x0 = Math.floor(tx(w)), x1 = Math.floor(tx(e)), y0 = Math.floor(ty(n)), y1 = Math.floor(ty(s));
  const cv = document.createElement('canvas'); cv.width = (x1 - x0 + 1) * 256; cv.height = (y1 - y0 + 1) * 256; const g = cv.getContext('2d', { willReadFrequently: true });
  const jobs = []; for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) jobs.push(new Promise((ok, no) => { const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => { g.drawImage(im, (x - x0) * 256, (y - y0) * 256); ok(); }; im.onerror = no; im.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`; }));
  await Promise.all(jobs);
  const d = g.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height;
  const at = (px, py) => { px = Math.max(0, Math.min(W - 1, px)); py = Math.max(0, Math.min(H - 1, py)); const i = (py * W + px) * 4; return d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768; };
  return (x, z) => { const [lat, lon] = ll(x, z), px = (tx(lon) - x0) * 256 - .5, py = (ty(lat) - y0) * 256 - .5, fx = Math.floor(px), fy = Math.floor(py), u = px - fx, v = py - fy;
    return (at(fx, fy) * (1 - u) + at(fx + 1, fy) * u) * (1 - v) + (at(fx, fy + 1) * (1 - u) + at(fx + 1, fy + 1) * u) * v; };
}

// → { city: island-sharpened z12 sampler or null, region: z10 sampler or null, y: ground height in scene units }
export async function loadTerrain() {
  const none = () => null, [base, region, isl] = await Promise.all([dem(12, CITY).catch(none), dem(10, REGION).catch(none), Promise.all(ISLANDS.map(i => dem(14, i.box).catch(none)))]);
  const city = base && ((x, z) => { for (let i = 0; i < ISLANDS.length; i++) if (isl[i] && inBox(ISLANDS[i].box, x, z)) return isl[i](x, z); return base(x, z); });
  return { city, region, y: (x, z) => city ? Math.max(0, city(x, z)) * EX : 0 };
}

// sea lines share one material; waves run in its vertex shader, driven by waveTime.value
export const waveTime = { value: 0 };
const waveMat = new THREE.LineBasicMaterial({ color: COLOR.sea, transparent: true, opacity: .5 });
waveMat.onBeforeCompile = sh => { sh.uniforms.t = waveTime; sh.vertexShader = 'uniform float t;\n' + sh.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\n  transformed.y += 6. * sin(position.x * .004 + t * 1.1) + 4. * sin(position.z * .006 - t * .8);'); };

// wire grid on axes xs × zs; edges with both ends at sea level become sea, land edges brighten with height
function grid(xs, zs, elev, opacity, withSea = true) {
  const nx = xs.length, Hh = [], wet = [];
  for (const z of zs) for (const x of xs) { const h = elev(x, z); wet.push(h <= .3); Hh.push(Math.max(0, h) * EX); }
  const land = [], lcol = [], sea = [];
  const add = (a, b) => { if (wet[a] !== wet[b]) return;
    for (const k of [a, b]) { const p = [xs[k % nx], Hh[k], zs[Math.floor(k / nx)]];
      if (wet[a]) sea.push(...p); else { land.push(...p); const c = Math.min(1, Hh[k] / 380); lcol.push(.03 + .3 * c, .22 + .4 * c, .28 + .4 * c); } } };
  for (let i = 0; i < zs.length; i++) for (let j = 0; j < nx; j++) { const k = i * nx + j; if (j < nx - 1) add(k, k + 1); if (i < zs.length - 1) add(k, k + nx); }
  const g = new THREE.Group(); g.add(lines(land, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity }), lcol));
  if (withSea) g.add(lines(sea, waveMat));
  return g;
}

export function buildGround({ city, region }, coast) {
  const g = new THREE.Group();
  // one grid whose spacing grows smoothly from 110 m at the centre to 700 m at the rim, ~48 km out
  const N = 157, S0 = 110, C = (700 - S0) / 3 / N ** 2, ax = []; for (let u = -N; u <= N; u++) ax.push(S0 * u + C * u ** 3);
  g.add(grid(ax, ax, (x, z) => city && (inBox(CITY, x, z) || !region) ? city(x, z) : region ? region(x, z) : 5, .45));
  // islands: a fine land-only mesh over the z14 samples
  if (city) for (const { box: [s, n, w, e], step } of ISLANDS) { const [x0, z0] = xz(n, w), [x1, z1] = xz(s, e), xs = [], zs = [];
    for (let x = x0; x <= x1; x += step) xs.push(x); for (let z = z0; z <= z1; z += step) zs.push(z); g.add(grid(xs, zs, city, .6, false)); }
  const cp = []; for (const c of coast) for (let i = 1; i < c.length; i++) cp.push(c[i - 1][0], 3, c[i - 1][1], c[i][0], 3, c[i][1]);
  g.add(lines(cp, new THREE.LineBasicMaterial({ color: COLOR.coast })));
  return g;
}
