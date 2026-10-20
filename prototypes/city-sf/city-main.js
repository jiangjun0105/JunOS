// Wiring: renderer + camera, load terrain and OSM, add each layer, the app window, and the frame loop.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { HOME, COLOR, MOTION } from './city-config.js';
import { loadTerrain, buildGround, waveTime } from './city-terrain.js';
import { buildBridges } from './city-bridges.js';
import { loadOSM, buildCity } from './city-osm.js';
import { createIcons } from './city-icons.js';
import { createFlights, orbitOf, EASE } from './city-camera.js';

const $ = id => document.getElementById(id);
const DEG = Math.PI / 180;
let W = innerWidth, H = innerHeight;

// --- renderer, camera, controls, post ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W, H);
$('c3').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLOR.bg);
scene.fog = new THREE.FogExp2(COLOR.bg, 0.000045);

// #cam=x,y,z,tx,ty,tz opens a fixed view (no auto-rotate), handy for screenshots and sharing
const cam = location.hash.match(/cam=([-\d.,]+)/)?.[1].split(',').map(Number);
const view = cam ? { pos: cam.slice(0, 3), tgt: cam.slice(3) } : HOME;
const camera = new THREE.PerspectiveCamera(42, W / H, 5, 90000);
camera.position.set(...view.pos);
const controls = new OrbitControls(camera, renderer.domElement);
Object.assign(controls, { enableDamping: true, autoRotate: !cam, autoRotateSpeed: .12, maxPolarAngle: 1.4, minDistance: 250, maxDistance: 30000 });
controls.target.set(...view.tgt);
const flights = createFlights(camera, controls);
flights.resize(W, H);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), .55, .35, .22));
composer.addPass(new OutputPass());

// --- app window: hidden → peek (hover: a small card in the top-right corner) → open (click: grows from that corner over most of the screen) ---
const win = $('win3');
const PEEK = { w: 320, h: 168 }, OPEN = { left: .36, top: 56, m: 20 };
let icons = null, mode = 'hidden', peekTimer = 0, back = null;

const rect = r => Object.assign(win.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
const peekRect = () => ({ x: W - PEEK.w - OPEN.m, y: OPEN.top, w: PEEK.w, h: PEEK.h });     // shares the open window's top-right corner
const openRect = () => {
  const x = Math.round(W * OPEN.left);
  return { x, y: OPEN.top, w: W - x - OPEN.m, h: H - OPEN.top - OPEN.m };
};
const openShift = () => (W - openRect().x) / 2;                     // centres the landmark in the strip left of the open window
const deg = v => Math.abs(v).toFixed(4) + '°';

// Same markup in both states, kept on open so the CSS transition grows it in place: .cta shows in peek, .more fades in once open.
function fill(app, full) {
  $('w3title').textContent = `${app.id.toUpperCase()}.MD${full ? '' : ' · PREVIEW'}`;
  if (win.dataset.app === app.id) return;
  win.dataset.app = app.id;
  const [la, lo] = app.at;
  const more = app.body || `<p class="ph">The ${app.label} window renders here.</p>`;
  $('w3body').innerHTML = `<div class="k">◢ ${app.place} · ${deg(la)}N ${deg(lo)}W</div>`
    + `<h3>${app.label}</h3><p class="lead">${app.desc}</p><div class="cta">CLICK TO OPEN ▸</div>`
    + `<div class="more">${more}</div>`;
}

// jump to the peek rect with no transition (the reflow commits it), so the next change animates from there
function snapToPeek() {
  win.style.transition = 'none';
  rect(peekRect());
  void win.offsetWidth;
  win.style.transition = '';
}

function peek(app) {
  clearTimeout(peekTimer);
  if (mode === 'open') return;
  if (!app) {
    peekTimer = setTimeout(() => { win.className = 'w3'; mode = 'hidden'; }, 150);
    return;
  }
  if (mode === 'hidden') snapToPeek();
  fill(app, false);
  win.className = 'w3 peek';
  mode = 'peek';
}

function openApp(app, at) {
  clearTimeout(peekTimer);
  if (mode === 'open') return;
  fill(app, true);                                                  // before the snap: its reflow gives new content the peek styles to grow from
  if (mode === 'hidden') snapToPeek();
  rect(openRect());
  win.className = 'w3 open';
  mode = 'open';
  icons.focus(app);
  controls.autoRotate = false;
  back = flights.orbit();
  // The open icon is pinned over its landmark on screen (city-icons.js), so its leader stays vertical through both legs.
  flights.fly(
    { name: 'swing', target: at.clone(), pitch: MOTION.view.pitch * DEG, dist: camera.position.distanceTo(at), shift: openShift(), ms: MOTION.swing.ms, ease: EASE.out },
    { name: 'dolly', dist: MOTION.view.dist, ms: MOTION.dolly.ms },
  );
}

function closeApp() {
  if (mode !== 'open') return;
  win.className = 'w3';
  mode = 'hidden';
  icons.focus(null);
  controls.autoRotate = true;
  flights.fly({ name: 'back', ...back, shift: 0, ms: MOTION.back.ms });
}

$('w3x').onclick = closeApp;
addEventListener('keydown', e => { if (e.key === 'Escape') closeApp(); });
$('home').onclick = () => {
  closeApp();
  flights.fly({ name: 'home', ...orbitOf(new THREE.Vector3(...HOME.pos), new THREE.Vector3(...HOME.tgt)), shift: 0, ms: MOTION.back.ms });
};
addEventListener('resize', () => {
  W = innerWidth;
  H = innerHeight;
  renderer.setSize(W, H);
  composer.setSize(W, H);
  flights.resize(W, H);
  if (mode === 'open') { rect(openRect()); flights.setShift(openShift()); }
});

// --- load + build. Each source fails soft: no terrain → flat city, no OSM → terrain only ---
let city = null;
Promise.all([loadTerrain(), loadOSM().catch(() => null)]).then(([terrain, osm]) => {
  scene.add(buildGround(terrain, osm ? osm.coast : []), buildBridges(terrain.y));
  if (osm) {
    city = buildCity(osm, terrain.y);
    scene.add(city.group);
  }
  icons = createIcons(scene, $('lay'), $('leads'), terrain.y, { open: openApp, hover: peek });
  $('st').textContent = osm ? `REAL DATA · ELEVATION ${terrain.city ? '✓' : '✗'} · ${city.stats}` : 'OSM UNAVAILABLE · TERRAIN ONLY';
});

// #trace exposes internals for trace.mjs
if (location.hash.includes('trace')) window.city = { camera, controls, flights, MOTION, get icons() { return icons; }, get mode() { return mode; } };

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  flights.update();
  waveTime.value = t;
  city?.update();
  controls.update();
  composer.render();
  icons?.update(t, camera, { x0: 0, x1: mode === 'open' ? openRect().x : W, W, H });
});
