---
title: Build for the next model, not this one
section: thoughts
tags: [bitter-lesson, coding-with-ai, tools, model-progress, end-to-end, context-windows, strategy]
sources: [raw/2026-09-03-projects-repo-understanding.md, raw/2026-09-03-projects-agent-harness.md, raw/2026-09-03-projects-junos.md]
related: [projects/repo-understanding-tool.md, projects/agent-harness.md, projects/junos-website.md, thoughts/bottom-up.md]
updated: 2026-09-03
status: draft
note: Extracted by Claude from Jun's project material; no new claims — every sentence traces to something he said.
---

# The tool I stopped building

When ChatGPT first appeared I built a tool to help models understand large codebases: an AST-based pipeline, a hierarchical graph of agents, an interactive diagram you could zoom from the top-level architecture down to a single API call. It beat GitHub Copilot Chat on large Python repos. Then GPT-4 arrived, then GPT-4o, and context windows kept growing, and I saw where I was: hand-crafting rules and heuristics that the next model would make unnecessary by taking the whole repository into context and doing it end to end. The Bitter Lesson, aimed at me personally.

I stopped. Not because the tool didn't work — because it worked on the wrong side of the line.

# The line

Some tools compensate for what the model can't do yet. Some tools give the model what it can never get on its own. The first kind has a shelf life measured in model releases. The second kind gets more valuable as models improve, because a stronger model uses a good tool better.

My repo tool was the first kind. It stood in for a missing context window. The harness I built later is the second kind: it gives the model a body — isolated environments, test scripts, a browser, a GitHub bot — and a verified process. When a better model appears, the harness doesn't become obsolete. It gets faster.

# Self-driving is the same story

A modular self-driving stack hand-codes perception, prediction, planning, and control as separate stages; an end-to-end network learns the whole thing. End-to-end avoids compounding errors between stages and ends up more accurate. Every hand-built stage is a bet that the model can't learn that stage itself. Eventually it can.

# The question to ask before building

Before building a tool around a model's current weakness, ask whether the next model makes the tool unnecessary. If yes, don't build it — or build the thing that would still matter afterward. Even when I thought a general model might never manage repository understanding, the better bet looked like training a small specialized model rather than engineering a pipeline: spend compute on learning the representation instead of spending my time designing it.

The corollary is that as tools get better, the differentiator moves up. When I built my site as a desktop OS in the browser, the technical part was easy; what made a difference was the design. As tools improve, creativity and taste become the bottleneck, and the people with more of them capture the value. That has been true at every tool transition in history, and it's true now.
