# Reference: Digital Drosophila project docs

A **snapshot**, copied 2026-09-05 from `~/Projects/fly-dog-and-human/docs` — the
working repository for the fly-brain research. These are the design documents Jun
writes for himself; unlike `kb/refined/`, they are not written in his public voice
and are not edited here.

They are here so the Call Me agent can answer a researcher who pushes past the
summary — the mechanisms, the parameters, the connectome numbers. The voice-facing
answers still come from `kb/refined/research/`, which is written to be spoken.

**What was copied** (11 of 39 files in that repo):

- `long-term-plan.md`, `step1-plan.md` — the stack and the phase plan.
- `01`–`09` neuroscience docs — connectome terminology, LIF model design, the four
  learning regimes, implementation phases, connectivity structure.

**What was deliberately left out:** `docs/issues/` and `docs/tasks/` (26 files of
engineering tickets, with status tables that go stale) and `environment-setup.md`.
An agent quoting a ticket's acceptance criteria helps nobody.

**Refreshing:** re-copy the same 11 files and re-run
`scripts/build-agent-bundle.mjs` + `scripts/provision-agent.mjs`. Because this is a
snapshot, check it against the source repo before trusting a detail — the research
repo moves faster than this one.
