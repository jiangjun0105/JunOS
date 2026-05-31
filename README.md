# JunOS 🌸

A tiny, anime-style **desktop OS in the browser** — pages and apps open as
draggable, resizable windows on a soft pastel sky. Built with **Next.js (App
Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

This is a learning scaffold: small enough to read in one sitting, structured so
you can grow it into a real personal site.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Click the **About me** icon to open a window. Drag it by the title bar, resize
it from the bottom-right handle, and close it with the ✕ button.

## How it works (the 60-second tour)

The desktop is **one array of window objects** in React state. "Navigating" or
clicking an icon just adds/focuses an entry in that array.

| Piece | File | Job |
|------|------|-----|
| Window manager | `src/os/WindowManager.tsx` | Holds `windows[]`; open/close/focus/move/resize. Focus = highest `zIndex` (derived). |
| Persistent shell | `src/os/OSRoot.tsx` | Lives in the layout; renders the window layer above the page. |
| Window frame | `src/os/Window.tsx` | One draggable/resizable window (Framer Motion). |
| Desktop | `src/os/Desktop.tsx` | Wallpaper + launcher icons. |
| App registry | `src/os/apps.tsx` | Maps an app id → `{ title, icon, size, Component }`. |
| Articles | `src/content/articles/` | MDX articles + a typed metadata index; shown by the **Article** reader, listed in **Research** + **Files**. |
| Layout / page | `src/app/layout.tsx`, `src/app/page.tsx` | Mount the provider + shell; the home route is the desktop. |

## Changing the look

Everything visual is token-driven:

- **Palette / shape / shadows / sky** → `src/styles/theme.css` (edit these values to reskin the whole app).
- **Window & icon "skin" structure** → the `@layer components` block in `src/app/globals.css`.
- **Fonts** → `src/app/layout.tsx`.

Because colors are CSS variables, you can add a whole alternate theme by copying
the `:root` block in `theme.css` under e.g. `[data-theme='night'] { … }` and
toggling that attribute on `<html>`.

## Adding a new app/window

1. Create a component in `src/components/windows/`.
2. Add an entry to `apps` in `src/os/apps.tsx` (icon, default size, component).

That's it — the desktop icon and the open/focus logic come for free.

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
   <Video  src="/media/my-slug/clip.mp4" caption="short, self-hosted" />
   <Embed  src="https://youtu.be/aqz-KE-bpKQ" title="long-form, streamed" />
   ```

2. Add its metadata + a loader to `src/content/articles/index.ts` (slug, title,
   date, summary, tags, `kind: 'research' | 'personal'`).
3. Put images / short clips under `public/media/my-slug/`.

**Media, by type:** text + images live in the repo; short clips go under
`public/media/…` via `<Video>`; long-form video is **embedded** from YouTube/Vimeo
via `<Embed>` (nothing to host). See `public/media/README.md`. How the plain
Markdown elements (`#`, lists, quotes, code) are skinned lives in
`src/mdx-components.tsx`.

## URLs & deep-linking

Every window is shareable. The focused (top-most) window is mirrored into the
address bar, and pasting that link back re-opens it:

| Window | URL |
|--------|-----|
| About / Projects / Research / Files | `/about`, `/projects`, `/research`, `/files` |
| An article | `/article/<slug>` |

- The path ⟷ window mapping is `src/os/url.ts`.
- The two-way sync (focused window ⟷ URL) lives in `src/os/WindowUrlSync.tsx`.
- `src/app/[[...segments]]/page.tsx` is an optional catch-all so any path renders
  the desktop (windows live in the layout, so they persist across navigation).

URL updates use the History API, so they're cosmetic — they never reload the page
or reset your open windows, and add no Back/Forward entries. Natural extensions:
`pushState` so Back/Forward step through windows, or encoding *all* open windows
for full-session links.

## Ideas for next steps

- Draggable desktop icons (reuse the Framer drag pattern from `Window.tsx`).
- Minimize / maximize / snap-to-side.
- A taskbar showing open windows.
- Persist open windows (and their positions) to `localStorage` or the URL.
