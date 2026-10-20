// Desktop icons: DOM reticles over landmarks, a 3D pulse ring on the ground, and leader lines. Laid out in screen space every frame.
import * as THREE from 'three';
import { APPS, GLYPH, COLOR } from './city-config.js';
import { xz } from './city-geo.js';

const RETICLE = '<svg class="fr" viewBox="0 0 46 46"><circle cx="23" cy="23" r="18" stroke-width="1"/><path d="M23 1v6M23 39v6M1 23h6M39 23h6" stroke-width="1.2"/></svg>';

// → { pins, select(app | null), update(t, camera, W, H, obstacle) }. onOpen(app, groundPoint) fires on click
export function createIcons(scene, layer, leads, groundY, onOpen) {
  const pins = APPS.map((app, i) => {
    const [x, z] = xz(...app.at), gy = groundY(x, z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 64), new THREE.MeshBasicMaterial({ color: COLOR.accent, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, gy + 4, z); scene.add(ring);
    const el = document.createElement('button'); el.className = 'ic3';
    el.innerHTML = `<div class="rg">${RETICLE}<svg class="g" viewBox="0 0 24 24">${GLYPH[app.id]}</svg></div><b>${app.label}</b><i>${app.place}</i>`;
    el.onclick = () => onOpen(app, new THREE.Vector3(x, gy, z));
    layer.appendChild(el);
    const ld = document.createElementNS('http://www.w3.org/2000/svg', 'path'); ld.classList.add('ld'); leads.appendChild(ld);
    return { app, ring, el, ld, phase: i / APPS.length, at: new THREE.Vector3(x, gy + (app.lift || 0), z), w: el.offsetWidth, h: el.offsetHeight, x: null, y: null };
  });
  const select = app => pins.forEach(p => p.el.classList.toggle('on', p.app === app));
  const update = (t, camera, W, H, obstacle) => {
    for (const p of pins) { const k = (t * .4 + p.phase) % 1; p.ring.scale.setScalar(60 + k * 600); p.ring.material.opacity = .9 * (1 - k); }
    layout(pins, camera, W, H, obstacle);
  };
  return { pins, select, update };
}

// Each icon sits LIFT px above its landmark, clamped inside the viewport and clear of `obstacle` (a DOMRect, e.g. the open window).
// Collisions stack upward; if that would leave the top edge, the icon stacks downward from the top instead. Leader lines join icon → landmark.
const sv = new THREE.Vector3(), LIFT = 36, TOPM = 44, PAD = 8;
const hits = (a, b) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 && a.y - a.h < b.y && b.y - b.h < a.y;    // boxes: centre x, bottom y, w, h
function layout(pins, camera, W, H, obstacle) {
  const vis = [], placed = [];
  if (obstacle) placed.push({ x: obstacle.left + obstacle.width / 2, y: obstacle.bottom + PAD, w: obstacle.width + 2 * PAD, h: obstacle.height + 2 * PAD });
  for (const p of pins) { sv.copy(p.at).project(camera);
    const on = sv.z < 1 && Math.abs(sv.x) < 1.05 && Math.abs(sv.y) < 1.05;
    p.el.style.display = p.ld.style.display = on ? '' : 'none'; if (!on) { p.x = null; continue; }
    p.ax = (sv.x + 1) / 2 * W; p.ay = (1 - sv.y) / 2 * H; vis.push(p); }
  vis.sort((a, b) => b.ay - a.ay);                                  // nearest to the bottom first, so far-away icons are the ones that move
  for (const p of vis) {
    const bx = { x: Math.min(W - p.w / 2 - PAD, Math.max(p.w / 2 + PAD, p.ax)), y: Math.min(H - PAD, Math.max(TOPM + p.h, p.ay - LIFT)), w: p.w, h: p.h };
    for (let n = 0, hit; n <= placed.length && (hit = placed.find(q => hits(q, bx))); n++) bx.y = hit.y - hit.h;
    if (bx.y - bx.h < TOPM) { bx.y = TOPM + bx.h; for (let n = 0, hit; n <= placed.length && (hit = placed.find(q => hits(q, bx))); n++) bx.y = hit.y + bx.h; }
    placed.push(bx);
    if (p.x === null) { p.x = bx.x; p.y = bx.y; } else { p.x += (bx.x - p.x) * .25; p.y += (bx.y - p.y) * .25; }
    p.el.style.transform = `translate(${p.x - p.w / 2}px, ${p.y - p.h}px)`;
    const ey = p.ay < p.y - p.h / 2 ? p.y - p.h : p.y;              // leader leaves the icon's bottom, or its top if the icon ended up below its landmark
    p.ld.setAttribute('d', `M${p.x} ${ey}L${p.ax} ${p.ay}M${p.ax - 2.5} ${p.ay}a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0`);
  }
}
