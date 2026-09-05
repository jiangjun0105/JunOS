# Knowledge base

Raw material for every article on the site and for the ElevenLabs "Call Me" agent.

- `raw/` — Jun's own words, verbatim, one file per interview session. Never edited; only an
  "Open items" list is appended at the bottom. This is the ground truth.
  **Not in git** (see `.gitignore`): the transcripts are unedited and name the stealth startup,
  and this repo is public. They live only on Jun's machine, so the `sources:` paths in
  `refined/` point at files a clone won't have — that's expected, and provenance is still
  recorded.
- `refined/` — organized derivatives, one file per topic, each linking back to the raw file(s)
  it came from. Structure and wording are tightened; opinions and claims are never changed.
  Anything that needs checking is listed under "To verify".
- `agent/` — what gets uploaded to ElevenLabs: an index (one paragraph per file), a persona
  file, and a FAQ answered in Jun's words.

File header convention (YAML):

```
title, section (about|projects|research|books|thoughts), tags, sources (raw files), updated, status (raw|draft|final)
```
