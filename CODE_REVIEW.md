# JunOS — Code Review Backlog

Source: multi-agent code-quality review (architecture, reusability, styling, React/a11y, Next.js perf), 2026-06-01.
This file is the actionable backlog. Each item is scoped so it can be handed to a sub-agent independently.

**Severity:** 🔴 high · 🟡 medium · 🟢 low · 💭 nit
**Status:** ☐ todo · ◐ in progress · ☑ done

---

## ✅ Already done
- **PERF-1 — Oversized images.** `jun_photo.png` (4.2 MB, 2048px) → `jun_photo.webp` (42 KB, 512px); `family.png` (838 KB) → `family.webp` (86 KB). Refs updated in `SupportWindow.tsx:14`, `Desktop.tsx:102`; old PNGs deleted. ~5 MB removed.

---

## A. Accessibility & resilience

> Mostly concentrated in `Window.tsx` — treat A1–A7 as **one work package** to avoid edit collisions.

### ☑ ACC-1 — No error boundary 🔴 — DONE
*Added `src/components/ErrorBoundary.tsx` (client class component) wrapping the window body in `Window.tsx`; resets per `win.id`.*
- **Where:** `src/os/Window.tsx:189` (renders `<Body params={win.params} />`), `src/os/OSRoot.tsx`.
- **Problem:** Window bodies are arbitrary components and articles are lazy MDX. If any MDX throws on render, or a chunk 404s after a deploy, the error propagates through `AnimatePresence` and blanks the **entire desktop**.
- **Fix:** Add a small class-based `ErrorBoundary` (or `react-error-boundary`) and wrap the body render so a crash shows an in-window "This app couldn't load" fallback. Optionally add `src/app/error.tsx` as a backstop.
- **Done when:** Forcing a throw inside one window's body leaves the rest of the desktop + menu bar fully usable.

### ☐ ACC-2 — Windows are keyboard-inoperable 🔴
- **Where:** `src/os/Window.tsx:108` (`tabIndex={-1}` — the only tabIndex in the repo), drag at `:137-140` is pointer-only.
- **Problem:** A keyboard user can open a window but cannot move, resize, minimize, maximize it, or even Tab to reach its own titlebar buttons.
- **Fix:** Make the frame `tabIndex={0}`; add `onKeyDown` so arrow keys nudge `position` (e.g. 10px) and Shift+arrows adjust `size`, committing through `updateWindow`. Keep the existing Escape-to-close.
- **Done when:** With no mouse, you can focus a window, move it, resize it, and trigger minimize/maximize/close.

### ☐ ACC-3 — Desktop icons can't be activated by keyboard 🔴
- **Where:** `src/os/DesktopIcon.tsx:80-82` (`onClick` guarded by drag state, no `onKeyDown`).
- **Problem:** Enter/Space don't reliably launch an app from the desktop; keyboard users can only open apps via the menu bar.
- **Fix:** Add `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}`, independent of the drag guard.
- **Done when:** Tabbing to an icon and pressing Enter or Space opens the app.

### ☐ ACC-4 — Focus is never restored on close/minimize 🟡
- **Where:** `src/os/Window.tsx:78-80` (focus on open), close/minimize in `src/os/WindowManager.tsx`.
- **Problem:** Closing/minimizing drops focus to `<body>` instead of the next-highest window or the launcher that opened it. Keyboard/screen-reader users lose their place.
- **Fix:** After close/minimize, move focus to the new top-most window (the manager already derives `focusedId`), e.g. an effect keyed on `focusedId`. Optionally remember the opener element and restore to it.
- **Done when:** Closing a window moves focus to the next window (or desktop), never to nowhere.

### ☐ ACC-5 — `role="dialog"` but unreachable / no modal semantics 🟡
- **Where:** `src/os/Window.tsx:106-108`.
- **Problem:** Screen readers announce a dialog the user can't enter (it's `tabIndex={-1}` and intentionally non-modal).
- **Fix:** Largely resolved by ACC-2 (`tabIndex={0}`); also add explicit `aria-modal={false}`, or switch to a labeled `role="group"`/`region` since windows are non-modal.
- **Done when:** AT can enter and read the window; role/modality are consistent.

### ☐ ACC-6 — Touch-drag of windows likely broken 🟡
- **Where:** titlebar `onPointerDown` → `controls.start(e)` in `src/os/Window.tsx:136-140`; no `touch-action` on `.os-titlebar`/frame (`src/app/globals.css:30-58`). Resize handles correctly use `touch-none`.
- **Problem:** Because drag starts from a child (not the draggable element), Framer doesn't auto-apply `touch-action: none`, so on touchscreens dragging the titlebar also pans the page.
- **Fix:** Add `touchAction: 'none'` to the titlebar (style or a CSS rule), matching `DesktopIcon.tsx:56`.
- **Done when:** Dragging a window's titlebar on a touchscreen moves the window without scrolling the page. *(Verify on a real device/emulator.)*

### ☐ ACC-7 — Resizing a non-focused window doesn't raise it 🟢
- **Where:** `src/os/Window.tsx:203` (handle `stopPropagation`) vs `:125` (frame `onPointerDown` focus).
- **Problem:** Grabbing a resize edge of a partially-occluded window resizes it without bringing it to front.
- **Fix:** Call `focusWindow(win.id)` in the handle's `onPointerDown` (before `stopPropagation`) or in `onDragStart`.
- **Done when:** Resizing any window also focuses/raises it.

### ☐ ACC-8 — Custom scrollbar buttons are focusable but `aria-hidden` 🟢
- **Where:** `src/os/WindowScrollbar.tsx:76`.
- **Problem:** The chrome is `aria-hidden` (fine — native scrolling still works) but the ▲/▼ buttons remain in the tab order, an inconsistency.
- **Fix:** Give the decorative arrow buttons `tabIndex={-1}` to match the `aria-hidden` container.
- **Done when:** Tab order skips the decorative scrollbar buttons.

---

## B. Next.js performance & SEO

### ☑ PERF-2 — Render-blocking Google Fonts `@import` 🟡 — DONE
*Migrated to `next/font/google` (Dosis + Hanken Grotesk), removed the `@import`, theme.css no longer hardcodes the font vars. Note: the old `@import` referenced "Hanken Grotesque", which is not a real Google family — corrected to the real `Hanken_Grotesk`, so body text may render slightly differently (worth a visual check).*
- **Where:** `src/app/globals.css:2`; comment in `src/app/layout.tsx:6`.
- **Problem:** A CSS `@import` of Google Fonts blocks render and adds two third-party origins (DNS+connect) on the critical path; delays FCP/LCP.
- **Fix:** Use `next/font/google` for `Dosis` + `Hanken_Grotesque` in `layout.tsx`, expose them as CSS variables, point the Tailwind `fontFamily` tokens at those variables, and delete the `@import` line. Self-hosts, preloads, zero CLS.
- **Touches:** `layout.tsx`, `globals.css`, `tailwind.config.ts` *(coordinate with THEME-2)*.
- **Done when:** No external font request in the network panel; fonts still render; no layout shift.

### ☐ PERF-3 — No per-page metadata / SEO surface 🟡 *(judgment call: only if discoverability matters)*
- **Where:** single static `metadata` in `src/app/layout.tsx:9-12`; no `generateMetadata`, no `sitemap.ts`/`robots.ts`.
- **Problem:** Every URL serves identical `<head>` ("JunOS") and no article text in initial HTML (MDX is `ssr:false`), so crawlers/social unfurls see nothing for `/article/<slug>`.
- **Fix:** Add `generateMetadata({ params })` in `src/app/[[...segments]]/page.tsx` using `parseWindowPath` + `getArticle(slug)` → `{ title, description: meta.summary, openGraph: {...} }`. Add `src/app/sitemap.ts` and `src/app/robots.ts` enumerating `/` + every article/launcher path. Article metadata already exists as typed objects in `content/articles/index.ts:41`.
- **Touches:** `page.tsx` (+ new `sitemap.ts`, `robots.ts`) *(coordinate with PERF-4 — same file)*.
- **Done when:** `/article/<slug>` returns a slug-specific title/description/OG; sitemap & robots resolve.

### ☐ PERF-4 — Catch-all route is dynamic when it could be static 🟡
- **Where:** `src/app/[[...segments]]/page.tsx` (builds as `ƒ`).
- **Problem:** An optional catch-all with no `generateStaticParams` opts into on-demand rendering, even though the body is a constant `<Desktop />` — higher TTFB for identical HTML.
- **Fix:** Add `generateStaticParams()` returning `/` + `['article', slug]` for each article + each launcher id, so the route prerenders to CDN-served static HTML. Pairs with PERF-3.
- **Done when:** The route builds as `○`/static; deep links prerender.

### ☐ PERF-5 — All app components eagerly imported 🟡 *(merge with ARCH-2)*
- **Where:** `src/os/apps.tsx:1-8`.
- **Problem:** Every window's code ships in first-load JS even if never opened. (Also the `os/`→`components/` coupling — see ARCH-2.)
- **Fix:** Make `apps[id].Component` a `dynamic(() => import('...'), { ssr: false })`, mirroring the article-loader pattern.
- **Done when:** Opening "Books" fetches a Books-only chunk; landing desktop ships ~none of the app bodies.

### ☐ PERF-6 — MDX images use raw `<img>` 🟢
- **Where:** `src/mdx-components.tsx:61-64`, `src/components/mdx/Figure.tsx:22`, `src/components/mdx/Gallery.tsx:27`.
- **Problem:** Article imagery skips optimization and sets no dimensions (CLS risk). Low impact today (sample images are tiny) but matters before any photo-heavy post.
- **Fix:** Migrate `Figure`/`Gallery` to `next/image` with explicit `width`/`height` (or `fill` + sized wrapper + `sizes`). *(Overlaps REUSE-7's `<Img>` idea — decide one approach.)*
- **Done when:** Article media serves optimized formats with no layout shift.

---

## C. Reusability & shared primitives

> Heavy file overlap across `components/windows/*` and `globals.css`. Run REUSE-1…8 as **one sequential package** (create primitives, then refactor consumers). Suggest a new `src/components/windows/ui/` folder.

### ☐ REUSE-1 — Duplicated `FileGlyph` SVG 🔴
- **Where:** `src/components/windows/FilesWindow.tsx:127-152` and `src/components/windows/BooksWindow.tsx:107-121`.
- **Problem:** Byte-identical page-outline path + kind-color concept, differing only in the color map; the two maps have already drifted, and the hexes (`#3b72c4`, `#4f8d5b`, `#b3473b`) are repeated literals.
- **Fix:** Extract `ui/FileGlyph.tsx` with props `{ kind?: string; color?: string; size?: number }`; single shared color map (ideally tokens — see THEME-1).
- **Done when:** Both windows render the same component; one color map.

### ☐ REUSE-2 — Accent "tag chips" hand-inlined 8× 🔴
- **Where:** `src/components/windows/AboutWindow.tsx:11-21`, `src/components/windows/AboutJunOSWindow.tsx:24-40`.
- **Problem:** `rounded-[6px] border border-line bg-accent{,-2,-3}/… px-3 py-1 …` repeated with a manual 3-color rotation.
- **Fix:** `ui/ChipRow.tsx` (`items: string[]`, auto-cycles accent/accent-2/accent-3 by index) backed by an `.os-chip` class in `globals.css` (mirror `.article-tag`).
- **Done when:** Both About windows render `<ChipRow items={[...]} />`; chip markup defined once.

### ☐ REUSE-3 — Window heading repeated in 7 files 🟡
- **Where:** `font-body text-[22px] font-bold` in `AboutWindow:5`, `AboutJunOSWindow:9`, `ProjectsWindow:11`, `ResearchWindow:21`, `BooksWindow:67`, `SupportWindow:21`, `ArticleWindow:39` (+ `text-[18px] text-muted` subtitle in 6).
- **Fix:** `ui/WindowHeader.tsx` with `{ title: string; subtitle?: ReactNode }` rendering the `space-y-1` heading/subtitle pair (optionally backed by a `.window-h1` class so the size lives in CSS).
- **Done when:** Windows use `<WindowHeader>`; the `22px`/`18px` magic numbers live in one place.

### ☐ REUSE-4 — Card + pill pattern duplicated (and re-spells existing CSS) 🟡
- **Where:** `src/components/windows/ProjectsWindow.tsx:13-28`, `src/components/windows/BooksWindow.tsx:71-101`; the strings already exist as `.article-card`/`.article-card-kind` (`globals.css:335,341`) which nobody reused.
- **Fix:** Promote those classes to generic `.os-card`/`.os-pill` (or `<Card>`/`<Pill>` components); make Books' `truncate`/`min-w-0`/`flex-none` opt-in props. Reuse in Projects, Books, and the article index.
- **Done when:** One card + one pill definition shared across all three surfaces.

### ☐ REUSE-5 — Tag-chip loop duplicated 🟢
- **Where:** `src/components/windows/ResearchWindow.tsx:44-51`, `src/components/windows/ArticleWindow.tsx:53-60`.
- **Fix:** `ui/TagList.tsx` rendering the guarded `.article-tags` wrapper with the `#`-prefix convention. Pairs with REUSE-2 (a `prefix` prop on one chip primitive).
- **Done when:** Both render `<TagList tags={...} />`.

### ☐ REUSE-6 — Inconsistent `kind` casing 🟢
- **Where:** index uses `.article-card-kind` (`capitalize`, `globals.css:341`); header renders raw lowercase `{meta.kind}` (`ArticleWindow.tsx:51`).
- **Fix:** A single `formatKind(kind)` util (or one `<KindBadge>`) so casing is defined once.
- **Done when:** "Research"/"research" render identically everywhere.

### ☐ REUSE-7 — Raw `<img>` + eslint-disable repeated 8× 💭
- **Where:** `Figure:21`, `Gallery:26`, `mdx-components:62`, `MenuBar:76,142`, `Desktop:101`, `DesktopIcon:85` (and `SupportWindow:12`).
- **Fix:** A tiny `<Img>` wrapper (or adopt `next/image`) to delete the repeated `// eslint-disable-next-line @next/next/no-img-element`. *(Decide vs PERF-6.)*
- **Done when:** One place owns the `<img>` lint exception.

### ☐ REUSE-8 — Article metadata & loaders are two parallel lists 🟢
- **Where:** `src/content/articles/index.ts:41-190`.
- **Problem:** Adding an article means editing the metadata array **and** the `() => import('./slug.mdx')` loader map; they can desync.
- **Fix:** Co-locate the loader on each `ArticleMeta` (`load: () => import('./<slug>.mdx')`); derive `articleLoaders` or drop it.
- **Done when:** Slug, metadata, and loader live in one object per article.

*(Note: don't over-merge the MDX blocks — Video/Embed have genuinely different concerns and should stay separate. Gallery, however, can map its items through `<Figure>` — see REUSE wrap-up.)*

---

## D. Type safety & architecture

> ARCH-1/2/3/5 all touch `apps.tsx` — treat as **one package**.

### ☑ ARCH-1 — `AppId = string` discards registry type-safety 🟡 — DONE
*`AppId = keyof typeof registry` (derived from a `satisfies`-checked literal), re-exported as `apps: Record<AppId, AppDefinition>` so optional fields stay accessible; added an `isAppId` guard for narrowing URL strings cast-free. Removed the `as AppId` cast.*
- **Where:** `src/os/types.ts:3`; forces `as AppId` cast in `src/components/windows/FilesWindow.tsx:27`; unchecked lookup in `src/os/WindowUrlSync.tsx:40`.
- **Fix:** `export type AppId = keyof typeof apps` (or define the id union first and type `apps: Record<AppId, AppDefinition>`). Narrow `parseWindowPath`'s string at the one boundary; remove the cast.
- **Done when:** A typo'd app id is a compile error; no `as AppId` casts remain.

### ☐ ARCH-2 — `os/` → `components/` dependency is inverted 🟡 *(includes PERF-5)*
- **Where:** `src/os/apps.tsx:1-8` (core statically imports every leaf app; apps import back from `@/os`).
- **Fix:** Lazy-load each `Component` via `dynamic()` (also solves PERF-5). Longer-term: register apps *into* the manager (a `registerApps()` call or an `apps` prop) so `os/` depends only on `types.ts`.
- **Done when:** Opening one app doesn't load all of them; `os/` no longer statically imports concrete windows.

### ☐ ARCH-3 — `launcher !== false` predicate duplicated 3× 🟢
- **Where:** `src/os/Desktop.tsx:11`, `src/os/MenuBar.tsx:99`, `src/os/WindowUrlSync.tsx:40`.
- **Fix:** Export `launchableApps` (and an `isLaunchable(appId)` helper) from `apps.tsx:98` and consume everywhere.
- **Done when:** The launcher rule is defined once.

### ☐ ARCH-4 — Window-identity key via `JSON.stringify(params)` 🟢
- **Where:** `src/os/WindowManager.tsx:96,98`.
- **Problem:** Key-order-sensitive; `{a,b}` vs `{b,a}` would be treated as different windows. Safe today (author-controlled params) but implicit.
- **Fix:** Extract a `windowKey(appId, params)` helper (next to `pathForWindow` in `url.ts`); sort keys for robustness.
- **Done when:** One helper defines window identity.

### ☐ ARCH-5 — `id` field redundant with the record key 🟢
- **Where:** `src/os/apps.tsx:21-96` (every entry repeats its key as `id`).
- **Fix:** Drop `id` from the literals and synthesize via `Object.entries`, or keep it with a dev assertion that `key === def.id`.
- **Done when:** App ids can't silently mismatch their key.

### ☐ ARCH-6 — Duplicated `constraintsRef` cast 💭
- **Where:** `src/os/Window.tsx:124` and `src/os/DesktopIcon.tsx:64` (`as unknown as RefObject<Element>`).
- **Fix:** A single typed helper (e.g. `asElementRef()`) or a single documented cast.
- **Done when:** The Framer typing workaround is written/explained once. *(Fits naturally in the A11Y package since both files are touched there.)*

### ☐ ARCH-7 — No tests despite test-friendly design 💭
- **Where:** `placement.ts`, `url.ts` were written to be pure/unit-testable; `package.json` has no test runner.
- **Fix:** Add Vitest; cover `placeWindow`/`fitSize` (overlap/fallback) and `pathForWindow`/`parseWindowPath` (round-trip).
- **Done when:** `pnpm test` runs and these two modules are covered.

---

## E. Theming & config cleanup

> Owns `theme.css`, `tailwind.config.ts`, and color tokens in `globals.css`. Coordinate `globals.css`/`tailwind.config.ts` edits with PERF-2 and the REUSE package.

### ☑ THEME-1 — Hardcoded color literals bypass tokens 🟡 — DONE
*Added ~14 tokens (button states, muted titlebar, file-kind glyphs) to `theme.css`; routed the literals in `globals.css`, `FilesWindow.tsx`, `BooksWindow.tsx` through them. Values preserved exactly (no visual change). Decorative `#000`/shadow inks left for THEME-6.*
- **Where:** `src/app/globals.css:61` (inactive titlebar gradient `#b9a48f/#9c8773/#7e6a57`), `:82,85,94,150` (button hover/active `rgb(241 236 217)`, `rgb(207 200 178)`; close-hover `rgb(228 123 93)`), `:67,89,90` (title text-shadow, close border/text). Plus SVG glyph colors in `FilesWindow.tsx:117,128,133` and `BooksWindow.tsx:108,113,119`.
- **Problem:** These are tints/shades of existing tokens frozen as literals — editing `theme.css` won't update them (the exact failure the token system exists to prevent). `#3b72c4`≈`--accent`, `#4f8d5b`=`--accent-2` exactly, `#fdfaf0`≈`--surface`.
- **Fix:** Add tokens (`--btn-face-hi/-lo`, `--accent-3-hi`, `--title-muted-*`, a `--file-*` set or reuse `--accent*`) and reference them. Unify the two SVG color maps (with REUSE-1).
- **Done when:** Changing `theme.css` updates hover/active/title/glyph colors; no raw hex/rgb in components.

### ☐ THEME-2 — `font-display` vs `font-chrome` alias confusion 🟢
- **Where:** `tailwind.config.ts:37`.
- **Problem:** `font-display` is documented as a back-compat alias but is the name actually used (8×); the "real" `font-chrome` is unused in components.
- **Fix:** Pick one name and drop the other (coordinate with PERF-2, which rewires fonts).
- **Done when:** One font utility name; no misleading alias.

### ☐ THEME-3 — Dead `rounded-window` Tailwind mapping 🟢
- **Where:** `tailwind.config.ts:27`.
- **Problem:** `rounded-window` utility is never used (`.os-window` applies `--radius-window` in CSS directly).
- **Fix:** Remove the mapping, or use `rounded-window` in the class. (`rounded-tile` is used 11× — keep it.)
- **Done when:** No dead config entries.

### ☐ THEME-4 — Three spellings of the same ~6px radius 🟢
- **Where:** `rounded-[6px]` (10×), `rounded-md` (5×), `rounded-[5px]` (1×, mdx `code`).
- **Fix:** Add a `--radius-btn`/`rounded-btn` token (6px) and use it everywhere; fold in the stray `rounded-[5px]`. *(Touches many component files — coordinate with REUSE.)*
- **Done when:** One radius token for the 6px corner.

### ☐ THEME-5 — `className="article"` is inert 💭
- **Where:** `src/components/windows/ArticleWindow.tsx:46` (no `.article` rule exists; only `.article-head/-prose/...`).
- **Fix:** Add a rule or drop the class.
- **Done when:** No dead class names.

### ☐ THEME-6 — Minor token gaps 💭
- **Where:** `--border` duplicates `--ink` (`theme.css:25`); two near-identical shadow inks (`globals.css:210,265,300` vs `theme.css:53-54`); `.media-video { background:#000 }` (`globals.css:360`).
- **Fix:** Document the `--border`/`--ink` coupling (or collapse); unify into one `--shadow-ink`; tokenize the letterbox black.
- **Done when:** No silent duplicate tokens.

### ☐ THEME-7 — No responsive breakpoints (decision, not a bug) 💭
- **Where:** entire codebase (only `@media` is reduced-motion).
- **Note:** Reasonable as "desktop-first, mobile-degraded" for a window manager, but tiny 22×24px window buttons and the 17px chrome scrollbar are cramped on phones, and `w-screen` (`OSRoot.tsx:30`) can overflow vs `100vw`. Decide whether to support mobile; if not, document it.

---

## Suggested work packages (for parallel sub-agents)

Designed so each package **owns** a distinct set of files. **Shared files** (⚠) must be coordinated — either run those packages sequentially or use per-agent git worktrees and merge.

| Package | Issues | Owns | ⚠ Shared |
|---|---|---|---|
| **WP-A11Y** | ACC-1…8, ARCH-6 | `Window.tsx`, `DesktopIcon.tsx`, `WindowScrollbar.tsx`, new `ErrorBoundary`, `OSRoot.tsx`/`app/error.tsx` | `globals.css` (touch-action line) |
| **WP-NEXT** | PERF-2,3,4 | `layout.tsx`, `[[...segments]]/page.tsx`, new `sitemap.ts`/`robots.ts` | `globals.css` (@import), `tailwind.config.ts` (fonts) |
| **WP-REGISTRY** | ARCH-1,2,3,5, PERF-5 | `apps.tsx`, `types.ts` | `FilesWindow.tsx`, `Desktop.tsx`, `MenuBar.tsx`, `WindowUrlSync.tsx` |
| **WP-REUSE** | REUSE-1…8, PERF-6 | `components/windows/*`, new `components/windows/ui/*`, `components/mdx/*` | `globals.css` (component classes), `FilesWindow.tsx` |
| **WP-THEME** | THEME-1…7 | `theme.css`, `tailwind.config.ts`, color tokens in `globals.css` | `globals.css`, component files (THEME-4) |
| **WP-WM** | ARCH-4,7 | `WindowManager.tsx`, `url.ts`, `placement.ts`, test setup, `package.json` | — |

**Conflict hot-spots:** `globals.css` (WP-A11Y, WP-NEXT, WP-REUSE, WP-THEME), `tailwind.config.ts` (WP-NEXT, WP-THEME), `apps.tsx` (WP-REGISTRY), `FilesWindow.tsx` (WP-REGISTRY, WP-REUSE), `Window.tsx` (WP-A11Y).

**Recommended approach:**
1. **Parallel, low-conflict first:** WP-A11Y + WP-WM + WP-NEXT (mostly disjoint; only the `globals.css` @import + touch-action lines overlap — small, easy to merge).
2. **Then** WP-REGISTRY (settles `apps.tsx`/types) → **then** WP-REUSE (refactors windows, incl. `FilesWindow`).
3. **WP-THEME last** so it can absorb `globals.css`/`tailwind.config.ts` after the others have settled (it's the biggest `globals.css` editor).
- Alternatively, give each agent an isolated git worktree and merge — viable since the repo is small.

**Suggested first PR (quick wins, ~½ day):** ACC-1 (error boundary), PERF-2 (next/font), ARCH-1 (`AppId` union), THEME-1 (tokenize literals).
