// Everything you would normally tweak: map extent, islands, camera, colours, and the desktop apps.

export const EX = 1.6;                                              // terrain height exaggeration
export const CITY = [37.700, 37.845, -122.525, -122.300];           // [S, N, W, E] detailed terrain (z12) + OSM extent
export const REGION = [37.33, 38.22, -123.05, -121.80];             // coarse ring (z10): Marin, East Bay hills, Mt Diablo, the Peninsula
// islands get z14 terrain and a fine mesh; build-sf-osm.py keeps every building inside these boxes too
export const ISLANDS = [
  { name: 'ALCATRAZ', box: [37.8240, 37.8295, -122.4265, -122.4195], step: 12 },
  { name: 'TREASURE + YERBA BUENA', box: [37.8050, 37.8330, -122.3800, -122.3580], step: 20 },
];
export const HOME = { pos: [5200, 8200, 12500], tgt: [-1200, 0, -800] };   // overview camera, scene metres
export const OSM_SNAPSHOT = '/files/sf-osm.json';

// 3D colours. The DOM accent / cyan come from the CSS variables in city-sf.html.
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const COLOR = {
  bg: 0x02060a, accent: css('--accent'), cyan: css('--cyan'),
  sea: 0x2f6dff, coast: 0x9ff4ff, building: 0x03141b, goldenGate: 0xff5a1f, bayBridge: 0xdfe9ff,
};

// Desktop apps. `lift` = metres above the ground the icon anchors at; `body` = window HTML (defaults to label + desc).
export const APPS = [
  { id: 'about', label: 'About me', place: 'ALCATRAZ ISLAND', at: [37.82670, -122.42300], desc: 'Robotics → silicon → maps → LLMs → fly brains.',
    body: `<h3>Building minds, one verified step at a time.</h3><p>I'm an AI engineer at Woven by Toyota, rebuilding the software development lifecycle around agents. I design multi-agent harnesses that plan, implement, review, and test real coding work.</p><p>In my free time I put uploaded biological brains into digital bodies, to learn how real neurons learn.</p>` },
  { id: 'call', label: 'Call me', place: 'SUTRO TOWER', at: [37.75520, -122.45280], lift: 300, desc: 'Talk to my voice agent. Which is, technically, me.' },
  { id: 'thoughts', label: 'Thoughts', place: 'GOLDEN GATE PARK', at: [37.76940, -122.48620], desc: 'Essays. Reasoned, not felt.' },
  { id: 'dev', label: 'Development', place: 'SALESFORCE TOWER', at: [37.78975, -122.39675], lift: 326, desc: 'The agent harness. It plans, executes, verifies.' },
  { id: 'research', label: 'Research', place: 'MISSION BAY', at: [37.76760, -122.39170], desc: 'Uploading a fly brain into a digital body.' },
  { id: 'files', label: 'Files', place: 'TREASURE ISLAND', at: [37.82350, -122.37060], desc: 'Everything, as a tree.' },
  { id: 'books', label: 'Books', place: 'MAIN LIBRARY', at: [37.77905, -122.41575], desc: 'Where several of my ideas came from.' },
  { id: 'mail', label: 'Email', place: 'GOLDEN GATE BRIDGE', at: [37.81830, -122.47850], desc: 'Response time: immediate.' },
];

// 24×24 stroke glyphs, keyed by app id
export const GLYPH = {
  about: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-7 8-7s7 2.5 8 7"/>',
  call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  thoughts: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  dev: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  research: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="9" cy="18" r="2"/><circle cx="19" cy="18" r="1.5"/><path d="M8 6.5l8 1.2M7 8l1.6 8M17 9.5l-6.5 7.3M11 18h6.5"/>',
  files: '<path d="M3 6h7l2 2h9v11H3z"/>',
  books: '<path d="M4 4h6v16H4zM10 4h5v16h-5zM15 5l4-1 2 15-4 1z"/>',
  mail: '<rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/>',
};
