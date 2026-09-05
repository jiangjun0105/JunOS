---
title: Agent Harness — multi-agent SDLC automation built bottom-up
section: projects
tags: [agent-harness, multi-agent, sdlc, claude-code, cursor, skills, github-bot, docker-compose, developer-velocity]
sources: [raw/2026-09-03-projects-agent-harness.md, resume Aug 2026]
updated: 2026-09-03
status: draft
---

# What it is

The harness takes a project, collects requirements from human developers, and decomposes the work as a tree: project → epics → issues → workable tasks, which multiple agents then execute. Each task is served by dedicated coder, reviewer, and tester agents, with human-in-the-loop review gates at every level.

It grew out of the voice startup I co-founded, where I was trying to boost my own productivity. Today a single engineer runs that company's day-to-day development through the harness at full product velocity.

# The philosophy: foundation first

Most multi-agent frameworks start from an org chart. You define a Product Manager, a Tech Lead, an Engineer, and hope the agents can reliably get work done that way — but you never actually know how well they perform. I didn't want to burn tokens or trust luck. I wanted a firm, stable foundation.

So the rule became: nothing gets automated until I have run it by hand and seen it work.

# How it started

I was using Cursor and Claude Code on the voice agent project and noticed my workflow was already regular: given a feature, design it, implement it, review it. I also noticed that agents with fresh context windows, each handling one specific part of the process, gave better results and used fewer tokens than one long session.

I turned the workflow into skills, ran them manually, and refined them with repo-specific domain knowledge. Once each skill was verified, I put a facilitator on top:

1. Facilitator — decomposes a feature into workable tasks.
2. Worker — implements the design.
3. Reviewer — reviews the code.
4. Test Auditor and Tester — verify the implementation.

Automation simply triggers a proven skill in a fresh session. That is the whole trick.

# Building bottom-up

- Issue level first. I refined issue creation, triage, and design skills, testing manually until they reliably resolved issues.
- Tooling as the skills demanded it: Docker Compose on isolated ports so concurrent tasks don't collide, scripts for automated end-to-end tests, and an agent browser tool to inspect the frontend.
- Epics next. With the issue level proven and automated, I added epic-level handling so larger chunks run automatically or semi-automatically with a human in the loop.
- GitHub integration. A bot ensures every PR links to an issue and is assigned to a human developer, so velocity can be tracked for humans and bots alike, by resolved issues and tasks.

Because every layer sits on manually tested operations, the system feels solid. I am not inventing a new way to work; I am automating the tedious, repetitive steps of a way that already worked.

# What my job became

With the harness in place, my work reduced to two things: saying what I want, and verifying that what came back is what I actually wanted. Everything in between — design, implementation, review, testing — is the agents' job.

So a day starts like this. First I look at what got done overnight and which of it is flagged for me to check by hand. I verify those: for a bug fix, exercise the original feature and confirm it's gone; for a new feature, use it and ask whether it matches what I had in mind. Then I step back and look at where the whole feature stands. And then I ask myself whether I have new requirements — usually about how some specific piece should actually behave — and write them down for the agents to pick up.

Requirements in, verification out. The implementation loop runs on its own.

# Results

Against vanilla Claude Code and Codex baselines I systematically analyzed agent failure modes to tune prompts, tool-use strategies, and context construction. The outcome is 10x+ single-developer velocity, roughly 70 PRs per repo per developer.

# What's next

Epics are done; the last layer is full projects. The target is a challenge like Cursor's SQLite benchmark — implementing an SQLite database purely from requirements — with great results at much lower cost.

# Why not an existing framework

I looked at popular multi-agent UIs and frameworks, and at Paperclip, before building this. Generic multi-agent frameworks mostly ask you to define agents and skills without a clear tree structure or execution loop. Paperclip works one level up, with concepts like "digital employees." Both are top-down solutions without a proven foundation underneath.

# To verify

- Name of the harness; open-source status.
- Runtime details (Claude Code sessions vs. API, how the task DAG/state is stored, GitHub bot implementation).
- Hardest failure mode fixed and what remains unsolved; where the human sits in a typical day.
- Whether the same harness drives the fly-brain research experiments.
