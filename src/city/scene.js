// The 3D desktop: renderer + camera, terrain and OSM, landmark icons, camera flights, the frame loop. No React, no window UI:
// the shell (src/os/CityDesktop.tsx) tells it which app is open and how far the open window pushes the view left.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { HOME, COLOR, MOTION } from './config.js';
import { loadTerrain, buildGround, waveTime } from './terrain.js';
import { buildBridges } from './bridges.js';
import { loadOSM, buildCity } from './osm.js';
import { createIcons } from './icons.js';
import { createFlights, orbitOf, EASE } from './camera.js';

const DEG = Math.PI / 180;

// → { focus(appId, shift), release(), home(), setShift(px), dispose() }
//   on.open(appId) when an icon is clicked, on.hover(appId | null), on.status(text) once the data has loaded
export function createCity(root, on) {
  let W = root.clientWidth, H = root.clientHeight;

  // --- renderer, camera, controls, post ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H);
  root.appendChild(renderer.domElement);
  const leads = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  leads.classList.add('city-leads');
  const layer = document.createElement('div');
  layer.className = 'city-icons';
  root.append(leads, layer);

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

  // --- open / close. `shift` = px the open window pushes the view's centre left; icons stay clear of the window's strip ---
  let icons = null, focused = null, pending = null, shift = 0, back = null, city = null, disposed = false;

  function focus(appId, px) {
    if (!icons) { pending = [appId, px]; return; }
    if (focused === appId) return;
    if (!back) back = flights.orbit();
    focused = appId;
    shift = px;
    controls.autoRotate = false;
    const pin = icons.pins.find(p => p.app.id === appId);
    icons.focus(pin?.app ?? null);
    if (!pin) { flights.fly({ name: 'shift', shift, ms: MOTION.swing.ms }); return; }      // a window with no landmark (an article): just make room
    const at = pin.ground;
    // The open icon is pinned over its landmark on screen (icons.js), so its leader stays vertical through both legs.
    flights.fly(
      { name: 'swing', target: at.clone(), pitch: MOTION.view.pitch * DEG, dist: camera.position.distanceTo(at), shift, ms: MOTION.swing.ms, ease: EASE.out },
      { name: 'dolly', dist: MOTION.view.dist, ms: MOTION.dolly.ms },
    );
  }

  function release() {
    pending = null;
    if (!focused) return;
    focused = null;
    shift = 0;
    icons.focus(null);
    controls.autoRotate = true;
    flights.fly({ name: 'back', ...back, shift: 0, ms: MOTION.back.ms });
    back = null;
  }

  const home = () => flights.fly({ name: 'home', ...orbitOf(new THREE.Vector3(...HOME.pos), new THREE.Vector3(...HOME.tgt)), shift, ms: MOTION.back.ms });

  function setShift(px) {
    shift = px;
    flights.setShift(px);
  }

  function resize() {
    W = root.clientWidth;
    H = root.clientHeight;
    renderer.setSize(W, H);
    composer.setSize(W, H);
    flights.resize(W, H);
  }
  addEventListener('resize', resize);

  // --- load + build. Each source fails soft: no terrain → flat city, no OSM → terrain only ---
  Promise.all([loadTerrain(), loadOSM().catch(() => null)]).then(([terrain, osm]) => {
    if (disposed) return;
    scene.add(buildGround(terrain, osm ? osm.coast : []), buildBridges(terrain.y));
    if (osm) {
      city = buildCity(osm, terrain.y);
      scene.add(city.group);
    }
    icons = createIcons(scene, layer, leads, terrain.y, { open: app => on.open(app.id), hover: app => on.hover(app?.id ?? null) });
    on.status(osm ? `REAL DATA · ELEVATION ${terrain.city ? '✓' : '✗'} · ${city.stats}` : 'OSM UNAVAILABLE · TERRAIN ONLY');
    if (pending) focus(...pending);
  });

  // #trace exposes internals for scripts/city/trace.mjs
  if (location.hash.includes('trace')) window.city = { camera, controls, flights, MOTION, get icons() { return icons; } };

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    flights.update();
    waveTime.value = t;
    city?.update();
    controls.update();
    composer.render();
    icons?.update(t, camera, { x0: 0, x1: W - 2 * shift, W, H });
  });

  function dispose() {
    disposed = true;
    renderer.setAnimationLoop(null);
    removeEventListener('resize', resize);
    controls.dispose();
    scene.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); });
    composer.dispose();
    renderer.dispose();
    root.replaceChildren();
  }

  return { focus, release, home, setShift, dispose };
}
