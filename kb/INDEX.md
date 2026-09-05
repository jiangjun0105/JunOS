---
title: Knowledge base index
updated: 2026-09-05
---

One paragraph per file. This is the map for the site build and for the Call Me agent. `raw/` holds Jun's verbatim words (ground truth); `refined/` holds the organized versions; `agent/` holds what gets uploaded to ElevenLabs.

# About

- **refined/about-me.md** — Short bio plus the story: small town in North China; Detective Conan's skateboard → robotics; mechanical engineering → UTokyo JSK lab (glass detection for laser rangefinders; lesson: the bottleneck is the mind, not the machine); DJI image-signal-processing and chip logic; Woven by Toyota (HD maps → first internal chatbot → GenAI team → Lexus assistant → Arene pipeline in Sunnyvale); co-founder/CTO of a voice-AI startup (stealth — unnamed); why Sunnyvale; daily routine, gym, dogs Mochi and Peanuts.

- **refined/now.md** — "What I'm doing now": this month's harness target (near-zero-intervention SQLite vs. Cursor's project), the fly (one leg + brain loop; other five legs next), next book. Refresh monthly.

# Projects (refined/projects/)

- **INDEX.md** — One paragraph per project.
- **agent-harness.md** — Multi-agent SDLC harness built bottom-up: manual skills verified first, then facilitator/worker/reviewer/tester, then issues, epics, projects; tooling; GitHub bot; 10x+ velocity; what the job became (requirements in, verification out; the morning loop); why not Paperclip-style frameworks; next target Cursor's SQLite benchmark.
- **junos-website.md** — This site: OS-in-browser, cartoon style, PostHog-inspired; Next.js stack; lesson that design and creativity are the differentiator.
- **repo-understanding-tool.md** — AST-shaped hierarchical graph of agents for large-codebase understanding; beat Copilot Chat; UTokyo/PKU collaboration; stopped to avoid the Bitter Lesson; the small-specialized-model alternative.

# Research (refined/research/)

- **INDEX.md** — Framing, three stages, and the nine extractable ideas with links.
- **snn-overview.md** — Motivation (transformers can't live in a robot; brains must be edge, individual, body-coupled), thesis (start from uploaded connectomes), Stage 1/2/3 in depth, working method (free-time, small GPU, harness makes validation ~20x faster).
- **why-biology.md** — Indirect observation (Ramachandran, Mach/Einstein), hypothesis-first science, intuition-first paper reading, hierarchy of sciences bottoming out in math, what the brain actually looks like vs. our networks.
- **structure-over-weights.md** — Shiu et al. 2024 and Eon Systems 2026: a whole-fly-brain LIF model works with no trained parameters; structure matters, weights are read off it; training should search architecture co-evolved with the body. Fact-checked, with notes.
- **publications.md** — Six robotics papers (Scholar-verified), the Toyota gesture-search patent (US 2026/0252570), five DJI image-processing patents (WO/CN numbers); Scholar and Google Patents links.
- **stage-1-current-work.md** — Fly connectome → LIF network → digital body; the sensorimotor loop; one leg moving; next five legs and the VNC rhythm center.

# Books (refined/books/)

- **INDEX.md** — Six one-paragraph recommendations, each linked to the essay it fed: The Tell-Tale Brain, Einstein biography, Guns Germs and Steel, Foundation, Descartes' Error, Principles. Individual files hold the same text with metadata.

# Thoughts (refined/thoughts/)

- **INDEX.md** — Ten essays with one-line summaries.
- **bottom-up.md** — The spine: start from what works, extend one verified step at a time (harness, brain, learning, body).
- **agile-survives-the-agents.md** — The programmer as the agent's proxy to every stakeholder; why AI coding stays Agile, not Waterfall.
- **20-watts-vs-megawatts.md** — Polished from Jun's site draft: backprop is biologically impossible; STDP, structural plasticity, in-situ adaptation, the neuromorphic CUDA moment.
- **will-ai-replace-programmers.md** — Human computers and hand coders vanished; programming transformed; the AI coding operator; why an all-AI company needs a different architecture.
- **build-for-the-next-model.md** — Tools that compensate for a weakness vs. tools that give the model a body; the Bitter Lesson; creativity as the new bottleneck.
- **learning-by-asking.md** — Asking vs. following a course; how to read a paper; no enclaves.
- **chemistry-is-the-optimizer.md** — Reward chemistry rewires brains; emotion is the label; reward functions do the same in robots; alignment can't be rules on top.
- **why-im-optimistic-about-ai.md** — Productivity frees humans for creative work; work may become optional; cross-generational accumulation.
- **face-reality.md** — 实事求是 in three layers; the post-mortem habit.
- **the-body-is-one-system.md** — Functional fitness over bodybuilding; the flat-foot chain; posture as productivity.

# Agent (agent/)

- **persona.md** — How the Call Me agent speaks as Jun: voice, stance, boundaries.
- **faq.md** — Likely visitor questions answered in Jun's words, with source files.

# Open questions across the KB

Collected from the "To verify" blocks: confirm the connectome is the BANC and the body is NeuroMechFly/MuJoCo; which Einstein biography; harness name and open-source status; runtime details of the harness; the early essay on developers and persistent memory (link or merge); a concrete post-mortem example; what Jun is optimizing for.
