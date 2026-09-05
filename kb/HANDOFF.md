# Handoff: populate JunOS from the knowledge base

For: Claude Code (or any coding agent) working in `~/Projects/JunOS`.
From: the content-extraction session with Jun, 2026-09-03 → 09-05.
Goal: replace every placeholder in the site with real content from `kb/refined/`, wire the Call Me agent, and leave `kb/` as the single source of truth for future edits.

Read this file, then `kb/INDEX.md`, then the refined files as you need them. Do not read `kb/raw/` for site content — it is Jun's verbatim interview transcript (bilingual, unedited) and exists only as provenance.

---

## 1. What exists

```
kb/
  INDEX.md              one paragraph per file — the map
  README.md             conventions
  HANDOFF.md            this file
  raw/                  verbatim transcripts (provenance only; never publish)
  refined/
    about-me.md         bio + story + life now
    now.md              "What I'm doing now" (Sept 2026)
    projects/           INDEX + agent-harness, junos-website, repo-understanding-tool
    research/           INDEX + snn-overview, why-biology, structure-over-weights,
                        stage-1-current-work, publications
    books/              INDEX + 6 books (the-tell-tale-brain, einstein-biography,
                        guns-germs-and-steel, foundation-galactic-empire,
                        descartes-error, principles)
    thoughts/           INDEX + 10 essays
  agent/
    system-prompt.md    ElevenLabs system prompt (+ setup checklist at bottom)
    persona.md          voice/boundaries reference
    faq.md              20 Q&As in Jun's voice, each citing its source file
  _to_delete/           one stale file; safe to rm
```

Every refined file has YAML frontmatter: `title, section, tags, sources, related, updated, status`. `related:` paths are relative to `refined/`. Section INDEX files (`books/INDEX.md`, `research/INDEX.md`, `thoughts/INDEX.md`, `projects/INDEX.md`) are ready-made index pages with one-paragraph summaries and links.

Status: all files are `draft` — meaning "content approved by Jun, not yet proofread on the live site." Treat them as final copy.

## 2. Hard constraints (do not violate)

1. **Stealth startup.** Jun's startup is referred to only as "a voice-AI startup I co-founded." Never write its name, product, customers, partners, or metrics anywhere in `src/`. `kb/raw/` contains the name; do not copy from raw. Grep `src/` for the name before every commit.
2. **Toyota** content stays exactly at the level of `about-me.md` and `publications.md`. Add nothing.
3. **No invented facts.** If a component needs a value the KB doesn't have (a date, a number, an image caption), leave a clearly marked TODO rather than guessing.
4. **Personal data**: only what's in `about-me.md` (Sunnyvale; two dogs Mochi and Peanuts; walks with family; gym). No addresses, family names, or schedule beyond the routine paragraph.
5. **Attribution in the KB** (`note:` fields saying "Extracted by Claude") is internal; strip it from anything rendered.
6. `refined/thoughts/the-body-is-one-system.md` mentions a childhood car accident in one sentence. Keep it at one sentence; do not expand.
7. **English only.** Jun's decision, 2026-09-05: no Chinese characters anywhere in `src/` or `kb/refined/`. His Chinese name (the DJI patents were filed under it) is referred to in words, not written out; Chinese phrases are romanized and glossed. `kb/raw/` is exempt — it is his verbatim, bilingual transcript and must stay as spoken.

## 3. Site mapping

The site is Next.js App Router + MDX. Content lives in `src/content/`; each collection has an `index.ts` of typed metadata objects with a co-located `load: () => import('./slug.mdx')`. Windows in `src/components/windows/` render them. `src/os/apps.tsx` is the app registry.

### 3.1 Delete all placeholders

Everything currently in `src/content/articles/`, `src/content/thoughts/`, and `src/content/notifications/` is scaffold sample content (attention notes, KV cache, forest walks, Little Prince, Acorn Notes, etc.). Delete all of it. Jun confirmed that everything currently in the repo is placeholder and can all be deleted. Exception: `src/content/thoughts/20-watts-vs-megawatts.mdx` is Jun's own draft — replace it with `kb/refined/thoughts/20-watts-vs-megawatts.md` (the polished version), same slug.

### 3.2 About window (`AboutWindow.tsx`)

Replace the placeholder with `refined/about-me.md`. Suggested layout: the "Short version" paragraph as the hero, `ChipRow` with a few identity chips (e.g. `🤖 robotics → AI`, `🪰 fly brain`, `🐶 Mochi & Peanuts`, `🗼 Tokyo → Sunnyvale`), then a "Read the full story" button that opens the article reader with slug `about-me`. Put the full story in `src/content/articles/about-me.mdx` (kind `personal`, section `Life`). Photo: `public/icons/jun_photo.webp` already exists.

### 3.3 Now page

`refined/now.md` → `src/content/articles/what-im-doing-now.mdx` (kind `personal`, section `Now`). Keep the "Last updated" line; Jun refreshes this monthly.

### 3.4 Development window (`ProjectsWindow.tsx`)

Three cards from `refined/projects/INDEX.md`, each opening the article reader:
- `agent-harness` → `refined/projects/agent-harness.md` (tag `🧰 agents`)
- `junos-website` → `refined/projects/junos-website.md` (tag `🪟 web`)
- `repo-understanding-tool` → `refined/projects/repo-understanding-tool.md` (tag `🌳 archived`)
Put the three bodies in `src/content/articles/` with kind `research`, section `Projects` (or add a `projects` kind if cleaner — your call; the File Explorer derives folders from kind+section).

### 3.5 Research window (`ResearchWindow.tsx`)

Sections, in order:
1. **Post-transformer models** — `snn-overview`, `why-biology`, `structure-over-weights`, `stage-1-current-work`
2. **Track record** — `publications`
The window header subtitle can be the framing paragraph from `refined/research/INDEX.md`. The "ideas underneath" list in that INDEX makes a good intro block above the cards if the window has room.

### 3.6 Books window (`BooksWindow.tsx`)

Replace the sample `books` array with the six from `refined/books/INDEX.md`: title, author, the one-paragraph blurb, a tag, and — instead of the placeholder `files` chips — a single "Read more →" chip that opens the linked essay (each blurb ends with an arrow link to its essay). Jun may later add favorite quotes per book; leave the `files` type in place for that.

### 3.7 Thoughts window (`ThoughtsWindow.tsx`)

Ten essays from `refined/thoughts/` → `src/content/thoughts/*.mdx`, metadata from each file's frontmatter plus the one-line summaries in `refined/thoughts/INDEX.md`. Order as in that INDEX (bottom-up first). Dates: use the `updated:` field.

### 3.8 Call Me window (`SupportWindow.tsx`)

Embed the ElevenLabs conversational widget. Configuration lives in `kb/agent/system-prompt.md` (bottom section "ElevenLabs setup"): built-in tools End call + Skip turn (+ Language detection), six Data Collection fields, knowledge-base upload list. The widget's agent ID comes from Jun; leave an env var `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`.

### 3.9 Notifications (`src/content/notifications/`)

Replace the three samples with one: "Site relaunched with real content" dated the deploy date, summary linking to Now. Future entries are Jun's changelog.

### 3.10 Files window

Derived from articles; will be correct once 3.2–3.5 are done. Check that the static "Support" entry label matches the Call Me app title.

### 3.11 MDX conversion rules

- Frontmatter → metadata entry in `index.ts`; body → `.mdx`. Strip `note:`, `sources:`, `related:`, `fact-check:` from anything rendered. Keep `tags`.
- Internal links in the KB are relative markdown links (`../thoughts/x.md`, `snn-overview.md`). Rewrite to site routes (`/thoughts/x`, article slugs) — `WindowUrlSync` already maps `/thoughts/<slug>`; check how article URLs are formed and match.
- ASCII diagrams in `20-watts-vs-megawatts.md` are fenced code blocks; keep them as-is (monospace).
- Headings in the KB start at `#`; the article reader may expect the title from metadata, so demote body headings by one level if the reader renders its own H1.
- No Chinese characters (see constraint 7). Where the Chinese phrase behind "face reality" is quoted, romanize it (*shi shi qiu shi*) and gloss it in English.

## 4. ElevenLabs bundle (separate from the site)

Upload as knowledge-base documents: every file under `kb/refined/` (INDEX files included) plus `kb/agent/persona.md` and `kb/agent/faq.md`. Do not upload `kb/raw/`, `kb/HANDOFF.md`, or `kb/README.md`. System prompt = `kb/agent/system-prompt.md` minus the "ElevenLabs setup" section at the bottom. If a single-file bundle is easier, concatenate the same set with a `# <path>` header before each file; strip YAML frontmatter first.

## 5. Open questions (do not block on these; leave TODOs)

- Connectome used in Stage 1 is "almost certainly the BANC" — Jun to confirm. Simulator: NeuroMechFly v2 in MuJoCo, to confirm.
- `publications.md`: venue/year for the "Glass and non-glass objects classification" paper.
- Harness name and open-source status (currently just "the harness").
- Which Einstein biography (Isaacson assumed).
- Dog-walk photo gallery: Jun wanted one (replaces the forest-walks placeholder) but hasn't supplied photos. Leave a `Gallery` with a TODO or omit.
- ~~Whether to show Jun's Chinese name on the publications page.~~ Resolved 2026-09-05: no.

## 6. Definition of done

- No placeholder text or sample content remains in `src/content/` or the window components.
- Grepping `src/` for the startup's name returns nothing. (The name itself is deliberately
  not written here: this file is in a public repo. It is in `kb/raw/`, which is not.)
- Every refined file is rendered somewhere, or listed here as intentionally omitted.
- All internal links resolve (run the site, click every card).
- `kb/` untouched except this file, which you may append a "Done" section to.

## 7. How future content updates work

Jun dumps new material → it goes into `kb/raw/` verbatim → a refined file is written/updated → then the corresponding `.mdx` is regenerated. Never edit `.mdx` as the source of truth; edit `kb/refined/` and regenerate. `kb/README.md` has the conventions.

---

# Done — 2026-09-05

Executed by Claude Code in `~/Projects/JunOS`. `kb/` is unchanged except this section and the
removal of `kb/_to_delete/` (and a stray `.DS_Store`).

## What was built

**Content layer.** All 30 refined files are now rendered. Ten articles in
`src/content/articles/` (about-me, what-im-doing-now, agent-harness, junos-website,
repo-understanding-tool, snn-overview, why-biology, structure-over-weights,
stage-1-current-work, publications) and ten essays in `src/content/thoughts/`, in the order of
`thoughts/INDEX.md`. Section INDEX files became window copy rather than pages of their own:
`research/INDEX.md` is the Research window's subtitle plus its "ideas underneath" block,
`projects/INDEX.md` is the Development cards, `books/INDEX.md` is the Books cards,
`thoughts/INDEX.md` is the Thoughts subtitle. `about-me.md` is split between the About window
(short version + chips) and the full article. Nothing is unrendered.

**Placeholders.** Every sample article, thought and notification is deleted.
`20-watts-vs-megawatts.mdx` was replaced in place with the polished version, same slug. One
notification remains: "Site relaunched with real content", 2026-09-05.

**Article kinds.** `ArticleKind` gained `project`, so the Development window, the Files tree and
the sitemap all derive from one entry per project. The Research window now shows the `research`
kind only (sections: Post-transformer models, Track record); personal writing is reached from
About and Files. Files' "Support" entry is now "Call Me", and the JunOS folder also lists
Thoughts and Books.

**Cross-references.** KB relative links became site routes (`/article/<slug>`, `/thoughts/<slug>`).
A new `src/components/mdx/MdxLink.tsx` intercepts those two shapes and opens the window directly
instead of navigating, so following a link doesn't tear down the desktop; the href stays real for
middle-click and crawlers. All 37 internal links were checked and resolve.

**Call Me.** `SupportWindow` embeds the ElevenLabs `<elevenlabs-convai>` widget, reading
`NEXT_PUBLIC_ELEVENLABS_AGENT_ID`. Without the var the window degrades to the photo + intro and
says the agent isn't configured. See the new `.env.example`. Dashboard setup (built-in tools, the
six data-collection fields, knowledge-base upload) is still Jun's to do, per the setup section
above.

**ElevenLabs bundle (§4).** `scripts/build-agent-bundle.mjs` generates it from `kb/` into
`dist/agent-kb/` (gitignored): `system-prompt.md` with the setup checklist stripped,
`knowledge-base.md` as a single concatenated file with `# <path>` headers and frontmatter
removed, and `files/` with one document per source. 32 sources — all of `kb/refined/` plus
`agent/persona.md` and `agent/faq.md`. `kb/raw/`, `HANDOFF.md` and `README.md` are excluded by
construction.

## Checks

- `npm run build` passes; 29 routes prerendered (home, 8 apps, 10 articles, 10 thoughts).
- `npx tsc --noEmit` and `npm run lint` clean.
- Grepping for the startup's name returns nothing in `src/`, `kb/refined/`, `kb/agent/` or the
  built bundle. Run it with the real name from `kb/raw/` (which is gitignored) before each push.
- No CJK anywhere in `src/`, `kb/refined/`, `kb/agent/`, `scripts/` or the generated bundle.
- MDX `{/* TODO */}` comments are stripped from production bundles — they're notes for whoever
  edits the source, never shown to a visitor.
- `npm test` has one **pre-existing** failure, untouched by this work:
  `src/os/url.test.ts` expects `parseWindowPath('/article')` to be `null`, but `url.ts` returns
  `{ appId: 'article' }`. It fails identically on the commit before these changes.

## Left for Jun

- **English only, everywhere** (Jun's call, 2026-09-05). `publications.mdx` says "filed under my
  Chinese name" rather than printing it, and the DJI patents are now linked one by one by
  publication number — the old aggregate Google Patents link searched by inventor, which meant the
  name URL-encoded in the href. `face-reality.mdx` romanizes the phrase (*shi shi qiu shi*) and
  glosses it. The same edits were made in `kb/refined/` and `kb/agent/` so a regeneration can't
  reintroduce them.
- **`kb/raw/` was deliberately left alone.** It's Jun's verbatim, bilingual interview transcript —
  the ground truth every refined file cites. Translating it would edit his own words and destroy
  the provenance the KB is built on. It never reaches the site or the agent (the bundle builder
  excludes it by construction). Say the word if you want English translations added alongside.
- **The voice agent still answers in the visitor's language** (English, Chinese or Japanese), per
  `kb/agent/system-prompt.md`. That's about how the agent speaks, not about text in the repo, so
  it was left as designed — flag it if it should be English-only too.
- **Open questions are TODOs in the MDX, not guesses.** The BANC connectome and NeuroMechFly v2
  are named only inside a comment in `stage-1-current-work.mdx`; the harness has no public name or
  open-source claim; the "Glass and non-glass objects classification" venue/year is blank; the
  Einstein edition is attributed to Isaacson (as the KB does).
- **Dog-walk gallery** is a TODO comment at the foot of `about-me.mdx`, with the `<Gallery>` call
  written out — drop photos in `/public/media/about-me/` and uncomment.
- **Books' `files` chips** render nothing until Jun adds favourite quotes; the type and glyphs are
  still in place.
- **Nothing is committed.** In particular, decide whether `kb/raw/` — verbatim, unedited
  transcripts — belongs in the repo's history at all before `git add kb/`.
