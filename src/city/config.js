// Everything you would normally tweak: map extent, islands, camera, motion, colours. Landmarks live in landmarks.js.

export const EX = 1.6;                                              // terrain height exaggeration
export const CITY = [37.700, 37.845, -122.525, -122.300];           // [S, N, W, E] detailed terrain (z12) + OSM extent
export const REGION = [37.33, 38.22, -123.05, -121.80];             // coarse ring (z10): Marin, East Bay hills, Mt Diablo, the Peninsula
// islands get z14 terrain and a fine mesh; build-sf-osm.py keeps every building inside these boxes too
export const ISLANDS = [
  { name: 'ALCATRAZ', box: [37.8240, 37.8295, -122.4265, -122.4195], step: 12 },
  { name: 'TREASURE + YERBA BUENA', box: [37.8050, 37.8330, -122.3800, -122.3580], step: 20 },
];
export const HOME = { pos: [5200, 8200, 12500], tgt: [-1200, 0, -800] };   // overview camera, scene metres
export const OSM_SNAPSHOT = '/city/sf-osm.json';

// Camera motion (see city-camera.js for yaw / pitch / dist). Opening an app = swing, then dolly; heading is kept throughout.
export const MOTION = {
  swing: { ms: 1000 },                // aim at the landmark and tilt to `view.pitch`, staying at the current distance
  dolly: { ms: 1400 },                // then push straight in to `view.dist`
  view: { pitch: 33, dist: 2025 },    // the open app's framing: degrees above the horizon, metres from the landmark
  back: { ms: 1800 },                 // close / Overview: fly back in one eased leg
};

// 3D colours. The DOM accent / cyan come from the CSS variables in src/styles/theme.css.
// The tokens are RGB triples ("255 178 63"); this module is only evaluated in the browser (scene.js is imported on mount).
const css = name => `rgb(${getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).join(',')})`;
export const COLOR = {
  bg: css('--bg'), accent: css('--accent'), cyan: css('--cyan'),
  sea: 0x2f6dff, coast: 0x9ff4ff, building: 0x03141b, goldenGate: 0xff5a1f, bayBridge: 0xdfe9ff,
};
