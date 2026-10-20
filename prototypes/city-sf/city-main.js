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
addEventListener('resize', () => { W = innerWidth; H = innerHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); composer.setSize(W, H); });

// --- camera flights (1.8 s, eased) ---
let fly = null;
const ease = u => u < .5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
const flyTo = (pos, tgt) => { fly = { t0: performance.now(), p0: camera.position.clone(), q0: controls.target.clone(), p1: pos, q1: tgt }; };

// --- app window ---
const win = $('win3');
let icons = null;
function openApp(app, at) {
  icons.select(app); controls.autoRotate = false;
  const dir = camera.position.clone().sub(controls.target).setY(0).normalize();
  flyTo(at.clone().add(dir.multiplyScalar(1700)).setY(at.y + 1100), at.clone());
  $('w3title').textContent = `${app.id.toUpperCase()}.MD`;
  $('w3body').innerHTML = `<div class="k">◢ ${app.place} · ${app.label.toUpperCase()}</div>` + (app.body || `<h3>${app.label}</h3><p>${app.desc}</p>`);
  win.classList.remove('open'); void win.offsetWidth; win.classList.add('open');     // restart the open animation
}
function closeApp() { win.classList.remove('open'); icons?.select(null); controls.autoRotate = true; }
$('w3x').onclick = closeApp;
addEventListener('keydown', e => { if (e.key === 'Escape') closeApp(); });
$('home').onclick = () => { closeApp(); flyTo(new THREE.Vector3(...HOME.pos), new THREE.Vector3(...HOME.tgt)); };

// --- load + build. Each source fails soft: no terrain → flat city, no OSM → terrain only ---
let city = null;
Promise.all([loadTerrain(), loadOSM().catch(() => null)]).then(([terrain, osm]) => {
  scene.add(buildGround(terrain, osm ? osm.coast : []), buildBridges(terrain.y));
  if (osm) { city = buildCity(osm, terrain.y); scene.add(city.group); }
  icons = createIcons(scene, $('lay'), $('leads'), terrain.y, openApp);
  $('st').textContent = osm ? `REAL DATA · ELEVATION ${terrain.city ? '✓' : '✗'} · ${city.stats}` : 'OSM UNAVAILABLE · TERRAIN ONLY';
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  if (fly) { const u = Math.min(1, (performance.now() - fly.t0) / 1800), e = ease(u);
    camera.position.lerpVectors(fly.p0, fly.p1, e); controls.target.lerpVectors(fly.q0, fly.q1, e); if (u >= 1) fly = null; }
  waveTime.value = t; city?.update();
  controls.update(); composer.render();
  icons?.update(t, camera, W, H, win.classList.contains('open') ? win.getBoundingClientRect() : null);
});
