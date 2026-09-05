---
title: JunOS — a desktop OS in the browser, as a personal site
section: projects
tags: [junos, personal-website, design, nextjs, typescript, tailwind, framer-motion, posthog]
sources: [raw/2026-09-03-projects-junos.md, JunOS repo README]
updated: 2026-09-03
status: draft
---

# What it is

JunOS is this website: a small desktop OS running in the browser. Pages and apps open as draggable, resizable windows over a soft pastel sky, in a Japanese-cartoon style.

I wanted to try a fun style for a personal site rather than the usual layout. The OS-in-a-webpage idea came from PostHog, the tool we use to monitor user behavior on our product site.

# How it's built

The whole desktop is one array of window objects in React state; "navigating" just adds or focuses an entry in that array. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion. Articles are MDX with a typed metadata index, shown by an Article reader and listed in the Research and Files apps. Everything visual is token-driven, so the site can be reskinned from one theme file.

# What I took from it

It is nothing special technically, but it taught me that design makes a real difference. As tools get better, the people with more creativity are the ones who can optimize and create more value. That is what happened at every previous tool transition in history, and it is exactly what is happening now.

# To verify

- How much of the site agents wrote; whether it went through the harness.
- A concrete example of a design choice that changed the outcome.
