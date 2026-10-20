// Which window each landmark opens, where it stands, and its peek-card copy. Pure data: safe to import on the server.
// ids are the window registry's (src/os/apps.tsx). `lift` = metres above the ground the icon anchors at.
export const APPS = [
  {
    id: 'about',
    label: 'About me',
    place: 'MISSION BAY',
    at: [37.7676, -122.3917],
    desc: 'Robotics → silicon → maps → LLMs → fly brains.',
  },
  {
    id: 'support',
    label: 'Call me',
    place: 'SUTRO TOWER',
    at: [37.7552, -122.4528],
    lift: 300,
    desc: 'Talk to my voice agent. Which is, technically, me.',
  },
  {
    id: 'thoughts',
    label: 'Thoughts',
    place: 'GOLDEN GATE PARK',
    at: [37.7694, -122.4862],
    desc: 'Essays. Reasoned, not felt.',
  },
  {
    id: 'projects',
    label: 'Development',
    place: 'SALESFORCE TOWER',
    at: [37.78975, -122.39675],
    lift: 326,
    desc: 'The agent harness. It plans, executes, verifies.',
  },
  {
    id: 'research',
    label: 'Research',
    place: 'ALCATRAZ ISLAND',
    at: [37.8267, -122.423],
    desc: 'Uploading a fly brain into a digital body.',
  },
  {
    id: 'files',
    label: 'Files',
    place: 'TREASURE ISLAND',
    at: [37.8235, -122.3706],
    desc: 'Everything, as a tree.',
  },
  {
    id: 'books',
    label: 'Books',
    place: 'MAIN LIBRARY',
    at: [37.77905, -122.41575],
    desc: 'Where several of my ideas came from.',
  },
  {
    id: 'email',
    label: 'Email',
    place: 'GOLDEN GATE BRIDGE',
    at: [37.8183, -122.4785],
    desc: 'Response time: immediate.',
  },
]

// The ring around every icon, 46×46; the glyph sits 20px wide in its centre
export const RETICLE =
  '<svg class="fr" viewBox="0 0 46 46"><circle cx="23" cy="23" r="18" stroke-width="1"/><path d="M23 1v6M23 39v6M1 23h6M39 23h6" stroke-width="1.2"/></svg>'

// 24×24 stroke glyphs, keyed by app id
export const GLYPH = {
  about: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-7 8-7s7 2.5 8 7"/>',
  support:
    '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  thoughts: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  projects:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  research:
    '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="9" cy="18" r="2"/><circle cx="19" cy="18" r="1.5"/><path d="M8 6.5l8 1.2M7 8l1.6 8M17 9.5l-6.5 7.3M11 18h6.5"/>',
  files: '<path d="M3 6h7l2 2h9v11H3z"/>',
  books: '<path d="M4 4h6v16H4zM10 4h5v16h-5zM15 5l4-1 2 15-4 1z"/>',
  email: '<rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/>',
}
