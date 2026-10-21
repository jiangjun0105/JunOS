# JunOS

Jun Jiang's personal site: a 3D wireframe of **San Francisco** (real AWS terrain + an
OpenStreetMap snapshot) with each app floating as a HUD reticle over a landmark.
Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** and **three.js**.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Hover an icon for a preview, click it to fly there and open its window; Esc or ✕
closes it and flies back. Pushing to `main` deploys to junbot.dev (Vercel).

## How it works

| Piece          | File                       | Job                                                                                                         |
| -------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 3D city        | `src/city/`                | Framework-free three.js engine (see `src/city/README.md`); loaded client-only.                              |
| Landmarks      | `src/city/landmarks.js`    | Which app sits over which place.                                                                            |
| Desktop shell  | `src/os/CityDesktop.tsx`   | Mounts the city, the HUD and the one window (hidden → peek → open).                                         |
| Window manager | `src/os/WindowManager.tsx` | The open window; `openApp(id, { params })` swaps it, `close()` clears it.                                   |
| App registry   | `src/os/apps.tsx`          | Maps an app id → `{ title, Component }`.                                                                    |
| Articles       | `src/content/articles/`    | MDX articles + a typed metadata index; shown by the **Article** reader, listed in **Research** + **Files**. |

## Changing the look

- **Palette / shape / glow** → `src/styles/theme.css` (the 3D scene reads `--bg`, `--accent`, `--cyan` too).
- **City HUD and window** → the plain-CSS city section in `src/app/globals.css`.
- **Camera motion** → `MOTION` in `src/city/config.js`; check it with `node scripts/city/trace.mjs`.
- **Fonts** → `src/app/layout.tsx`.

## Adding a new app

1. Create a component in `src/components/windows/`.
2. Add an entry to `apps` in `src/os/apps.tsx`.
3. Add a landmark for it in `src/city/landmarks.js`.

## Writing articles

Articles are **MDX files** (Markdown + components) in `src/content/articles/` — no
backend, no CMS. They appear automatically in the **Research** window and the
**File Explorer**, and open in a reader window.

To add one:

1. Create `src/content/articles/my-slug.mdx` and write Markdown. Drop in media
   components anywhere — they're globally available, no imports:

   ```mdx
   # My title

   Some prose with **bold** and a [link](https://example.com).

   <Figure src="/media/my-slug/diagram.png" alt="…" caption="…" />
   <Gallery columns={3} items={[{ src: '/media/my-slug/a.jpg', caption: 'A' }]} />
   ```

2. Add its metadata + a loader to `src/content/articles/index.ts` (slug, title,
   date, summary, tags, `kind: 'research' | 'personal'`).
3. Put images / short clips under `public/media/my-slug/`.

**Media:** images live under `public/media/` (reference them as `/media/my-slug/file.png`). How the plain
Markdown elements (`#`, lists, quotes, code) are skinned lives in
`src/mdx-components.tsx`.

## URLs & deep-linking

Every window is shareable. The open window is mirrored into the
address bar, and pasting that link back re-opens it:

| Window                              | URL                                          |
| ----------------------------------- | -------------------------------------------- |
| About / Projects / Research / Files | `/about`, `/projects`, `/research`, `/files` |
| An article                          | `/article/<slug>`                            |

- The path ⟷ window mapping is `src/os/url.ts`.
- The two-way sync (open window ⟷ URL) lives in `src/os/WindowUrlSync.tsx`.
- `src/app/[[...segments]]/page.tsx` is an optional catch-all so any path renders
  the desktop.

URL updates use the History API, so they're cosmetic — they never reload the page
or reset the city, and add no Back/Forward entries.
