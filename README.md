# cozy-os 🌸

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

## Ideas for next steps

- Draggable desktop icons (reuse the Framer drag pattern from `Window.tsx`).
- Minimize / maximize / snap-to-side.
- A taskbar showing open windows.
- Make each window map to a real route (so windows are deep-linkable + shareable).
- Persist open windows to `localStorage` or the URL.
