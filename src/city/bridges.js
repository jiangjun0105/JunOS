// Golden Gate + Bay Bridge as line drawings. groundY(x, z) seats the anchorages on the terrain.
import * as THREE from 'three';
import { COLOR } from './config.js';
import { xz, lerp, polyline, lines } from './geo.js';

const seg = (L, a, b) => L.push(a[0], a[1], a[2], b[0], b[1], b[2]);

// anchor a0 → towers T0, T1 → anchor a1 (anchors are [x, z, y]): cables at ±off, suspenders, deck chords, tower legs + portal struts
function suspension(L, a0, T0, T1, a1, DECK, TOP, off) {
  const dx = T1[0] - T0[0], dz = T1[1] - T0[1], n = Math.hypot(dx, dz), px = -dz / n * off, pz = dx / n * off;
  for (const sd of [-1, 1]) {
    const P = (p, y) => [p[0] + sd * px, y, p[1] + sd * pz], pts = [P(a0, a0[2])];
    for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push(P(lerp(T0, T1, u), DECK + 8 + (TOP - DECK - 8) * (2 * u - 1) ** 2)); }
    pts.push(P(a1, a1[2]));
    for (let i = 1; i < pts.length; i++) seg(L, pts[i - 1], pts[i]);
    for (let i = 2; i < 41; i += 2) seg(L, pts[i], [pts[i][0], DECK, pts[i][2]]);
    seg(L, P(a0, DECK), P(a1, DECK));
    for (const T of [T0, T1]) seg(L, P(T, 0), P(T, TOP + 6));
  }
  for (const T of [T0, T1]) for (const y of [DECK - 4, (DECK + TOP) / 2, TOP + 6]) seg(L, [T[0] - px, y, T[1] - pz], [T[0] + px, y, T[1] + pz]);
}

function goldenGate(groundY) {
  const DECK = 67, TOP = 227, S = xz(37.81065, -122.47745), N = xz(37.82540, -122.47930), aS = xz(37.80780, -122.47530), aN = xz(37.82820, -122.48090), L = [];
  suspension(L, [...aS, Math.max(groundY(...aS), DECK)], S, N, [...aN, Math.max(groundY(...aN), DECK)], DECK, TOP, 14);
  return lines(L, new THREE.LineBasicMaterial({ color: COLOR.goldenGate }));
}

// west span: two suspension spans sharing a central anchorage. East span: one-tower self-anchored span, then the skyway to Oakland
const EAST = [[37.81131,-122.36378],[37.81207,-122.36298],[37.81249,-122.3625],[37.81285,-122.36204],[37.81329,-122.36143],[37.81362,-122.36094],[37.81393,-122.36043],[37.81723,-122.35467],[37.81751,-122.35412],[37.81778,-122.35353],[37.81802,-122.35294],[37.81823,-122.35234],[37.81842,-122.35172],[37.81858,-122.35109],[37.8187,-122.35046],[37.82002,-122.3415],[37.82132,-122.33261],[37.82148,-122.33131],[37.82163,-122.33],[37.82175,-122.32869],[37.82183,-122.32771]].map(p => xz(...p));
function bayBridge(groundY) {
  const L = [], DECK = 60, TOP = 160, OFF = 12;
  const A = xz(37.78648, -122.39037), B = xz(37.80806, -122.36726), C = lerp(A, B, .5), CY = DECK + 30;
  suspension(L, [...A, Math.max(groundY(...A), DECK)], lerp(A, C, .25), lerp(A, C, .75), [...C, CY], DECK, TOP, OFF);
  suspension(L, [...C, CY], lerp(C, B, .25), lerp(C, B, .75), [...B, Math.max(groundY(...B), DECK)], DECK, TOP, OFF);
  for (const [i, j] of [[-1, -1], [-1, 1], [1, 1], [1, -1]]) seg(L, [C[0] + 24 * i, 0, C[1] + 24 * j], [C[0] + 24 * i, CY, C[1] + 24 * j]);   // central anchorage block
  const east = polyline(EAST), at = (s, sd, y) => { const { p, d } = east.at(s); return [p[0] - d[1] * OFF * sd, y, p[1] + d[0] * OFF * sd]; };
  const TW = 385, END = 565;                                   // tower 385 m from the island pier; cable anchors back into the deck 180 m east
  const cab = s => DECK + (TOP - 10 - DECK) * (s < TW ? (s / TW) ** 2 : ((END - s) / (END - TW)) ** 2);
  for (const sd of [-1, 1]) {
    for (let s = 0; s < END; s += 15) { seg(L, at(s, sd, cab(s)), at(s + 15, sd, cab(s + 15))); if (s && s % 30 === 0) seg(L, at(s, sd, cab(s)), at(s, sd, DECK)); }
    seg(L, at(TW, sd, 0), at(TW, sd, TOP));
    for (let s = 0; s < east.len; s += 40) seg(L, at(s, sd, DECK), at(s + 40, sd, DECK));
    for (let s = END + 80; s < east.len - 40; s += 160) seg(L, at(s, sd, 0), at(s, sd, DECK));       // skyway piers
  }
  for (const y of [DECK - 4, 110, TOP]) seg(L, at(TW, -1, y), at(TW, 1, y));
  for (let s = END + 80; s < east.len - 40; s += 160) seg(L, at(s, -1, DECK - 4), at(s, 1, DECK - 4));
  return lines(L, new THREE.LineBasicMaterial({ color: COLOR.bayBridge }));
}

export const buildBridges = groundY => new THREE.Group().add(goldenGate(groundY), bayBridge(groundY));
