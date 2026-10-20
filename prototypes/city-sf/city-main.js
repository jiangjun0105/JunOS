// Wiring: renderer + camera, load terrain and OSM, add each layer, fly-to + app window, and the frame loop.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { HOME, COLOR } from './city-config.js';
import { loadTerrain, buildGround, waveTime } from './city-terrain.js';
import { buildBridges } from './city-bridges.js';
import { loadOSM, buildCity } from './city-osm.js';
import { createIcons } from './city-icons.js';

const $ = id => document.getElementById(id);
let W = innerWidth, H = innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W, H); $('c3').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(COLOR.bg); scene.fog = new THREE.FogExp2(COLOR.bg, 0.000045);
// #cam=x,y,z,tx,ty,tz opens a fixed view (no auto-rotate), handy for screenshots and sharing
const cam = location.hash.match(/cam=([-\d.,]+)/)?.[1].split(',').map(Number), view = cam ? { pos: cam.slice(0, 3), tgt: cam.slice(3) } : HOME;
const camera = new THREE.PerspectiveCamera(42, W / H, 5, 90000); camera.position.set(...view.pos);
const controls = new OrbitControls(camera, renderer.domElement);
Object.assign(controls, { enableDamping: true, autoRotate: !cam, autoRotateSpeed: .12, maxPolarAngle: 1.4, minDistance: 250, maxDistance: 30000 }); controls.target.set(...view.tgt);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera)); composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), .55, .35, .22)); composer.addPass(new OutputPass());
addEventListener('resize', () => { W = innerWidth; H = innerHeight; renderer.setSize(W, H); composer.setSize(W, H); });

// --- camera flights (1.8 s, eased). `shift` slides the projection centre left by that many px, so the
// landmark sits in the middle of the free strip beside an open window instead of behind it ---
let fly = null, shift = 0;
const ease = u => u < .5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
const flyTo = (pos, tgt, s1 = shift) => { fly = { t0: performance.now(), p0: camera.position.clone(), q0: controls.target.clone(), p1: pos, q1: tgt, s0: shift, s1 }; };
const applyShift = () => { camera.aspect = (W + 2 * shift) / H; camera.setViewOffset(W + 2 * shift, H, 2 * shift, 0, W, H); };   // aspect = the full virtual view's

// --- app window: hidden → peek (hover: a small card in the top-right corner) → open (click: grows from that corner over most of the screen) ---
const win = $('win3'), PEEK = { w: 320, h: 168 }, OPEN = { left: .36, top: 56, m: 20 };
let icons = null, mode = 'hidden', peekTimer = 0, back = null;
const rect = r => Object.assign(win.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
const peekRect = () => ({ x: W - PEEK.w - OPEN.m, y: OPEN.top, w: PEEK.w, h: PEEK.h });     // shares the open window's top-right corner
const openRect = () => { const x = Math.round(W * OPEN.left); return { x, y: OPEN.top, w: W - x - OPEN.m, h: H - OPEN.top - OPEN.m }; };
const deg = v => Math.abs(v).toFixed(4) + '°';
function fill(app, full) {
  $('w3title').textContent = `${app.id.toUpperCase()}.MD${full ? '' : ' · PREVIEW'}`;
  const [la, lo] = app.at, kick = `<div class="k">◢ ${app.place} · ${deg(la)}N ${deg(lo)}W</div>`;
  // same markup in both states, kept on open so the transition grows it in place (CSS); .cta shows in peek, .more fades in once open
  if (win.dataset.app === app.id) return; win.dataset.app = app.id;
  $('w3body').innerHTML = kick + `<h3>${app.label}</h3><p class="lead">${app.desc}</p><div class="cta">CLICK TO OPEN ▸</div>`
                        + `<div class="more">${app.body || `<p class="ph">The ${app.label} window renders here.</p>`}</div>`;
}
const snapToPeek = () => { win.style.transition = 'none'; rect(peekRect()); void win.offsetWidth; win.style.transition = ''; };
function peek(app) {
  clearTimeout(peekTimer); if (mode === 'open') return;
  if (!app) { peekTimer = setTimeout(() => { win.className = 'w3'; mode = 'hidden'; }, 150); return; }
  if (mode === 'hidden') snapToPeek();
  fill(app, false); win.className = 'w3 peek'; mode = 'peek';
}
function openApp(app, at) {
  clearTimeout(peekTimer); if (mode === 'open') return;
  fill(app, true); if (mode === 'hidden') snapToPeek();          // fill first: the snap's reflow gives new content its peek styles to grow from
  rect(openRect()); win.className = 'w3 open'; mode = 'open';
  icons.focus(app); controls.autoRotate = false; back = { pos: camera.position.clone(), tgt: controls.target.clone() };
  const dir = camera.position.clone().sub(controls.target).setY(0).normalize(), r = openRect();
  flyTo(at.clone().add(dir.multiplyScalar(1700)).setY(at.y + 1100), at.clone(), (W - r.x) / 2);
}
function closeApp() {
  if (mode !== 'open') return;
  win.className = 'w3'; mode = 'hidden'; icons.focus(null); controls.autoRotate = true;
  flyTo(back.pos, back.tgt, 0);
}
$('w3x').onclick = closeApp;
addEventListener('keydown', e => { if (e.key === 'Escape') closeApp(); });
$('home').onclick = () => { closeApp(); flyTo(new THREE.Vector3(...HOME.pos), new THREE.Vector3(...HOME.tgt), 0); };
addEventListener('resize', () => { if (mode === 'open') { const r = openRect(); rect(r); shift = (W - r.x) / 2; } applyShift(); });

// --- load + build. Each source fails soft: no terrain → flat city, no OSM → terrain only ---
let city = null;
Promise.all([loadTerrain(), loadOSM().catch(() => null)]).then(([terrain, osm]) => {
  scene.add(buildGround(terrain, osm ? osm.coast : []), buildBridges(terrain.y));
  if (osm) { city = buildCity(osm, terrain.y); scene.add(city.group); }
  icons = createIcons(scene, $('lay'), $('leads'), terrain.y, { open: openApp, hover: peek });
  $('st').textContent = osm ? `REAL DATA · ELEVATION ${terrain.city ? '✓' : '✗'} · ${city.stats}` : 'OSM UNAVAILABLE · TERRAIN ONLY';
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  if (fly) { const u = Math.min(1, (performance.now() - fly.t0) / 1800), e = ease(u);
    camera.position.lerpVectors(fly.p0, fly.p1, e); controls.target.lerpVectors(fly.q0, fly.q1, e); shift = fly.s0 + (fly.s1 - fly.s0) * e; applyShift(); if (u >= 1) fly = null; }
  waveTime.value = t; city?.update();
  controls.update(); composer.render();
  icons?.update(t, camera, { x0: 0, x1: mode === 'open' ? openRect().x : W, W, H });
});
