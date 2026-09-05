---
title: About me
section: about
tags: [bio, robotics, mechanical-engineering, university-of-tokyo, jsk, dji, image-signal-processing, woven-by-toyota, ai-agents]
sources: [raw/2026-09-03-about-me.md, resume Aug 2026]
updated: 2026-09-03
status: draft
---

# Short version

I'm an AI engineer who rebuilds the software development lifecycle around agents. I've shipped LLM-powered products end to end at Toyota and as CTO of a voice-AI startup, and I design multi-agent harnesses that plan, implement, review, and test real coding work with a human in the loop. In my free time I study spiking neural networks by putting uploaded insect brains into digital bodies. I'm based in Sunnyvale, California, after seven years in Tokyo; I grew up in a small town in North China, and I speak Chinese, Japanese, and English.

# How I got here

## A skateboard in an anime

In high school I was fascinated by the electric skateboard Detective Conan uses to chase criminals. The skateboard wasn't intelligent at all, but it planted the desire to work on intelligent machines, and that grew into robotics — the ultimate intelligent machine.

## Mechanical engineering, then a door into robotics

I chose mechanical engineering. The manufacturing-heavy coursework wasn't what I wanted, but it earned me a one-year exchange at the University of Tokyo, where I joined the JSK Robotics Laboratory and co-authored a paper with a master's student — my first real step into the field. I later completed my M.S. in Precision Engineering at the University of Tokyo.

My research there: robots that navigate with laser rangefinders can't see glass, because glass rarely returns the specular reflection the sensor relies on. I trained a small neural network to detect the narrow reflections glass does produce and adapted the mapping algorithm so glass showed up on the map. It was a good research and publishing experience, but the lasting lesson was that the bottleneck in robotics isn't hardware. It's software and intelligence. Building the machine is the easy part; building the mind is the hard part. That pointed me at AI.

## DJI: learning the physical stack

I joined DJI's image processing group because laser rangefinder data had felt too sparse; I wanted information-dense image sensors while staying in robotics. Designing chip logic is a discipline of ruthless optimization — I wasn't even allowed division in an algorithm because of the hardware cost. I learned the whole physical stack: how photons become digital signals, how a raw Bayer pattern becomes the image on your phone, how image algorithms map to logic gates, how firmware drives the chips, and how FPGAs speed up design verification. I contributed to DJI's first multi-image-stacking HDR feature and filed five patents.

That understanding of the physical foundations of computation still shapes how I think about chip design, compute efficiency, and power-efficient algorithms — including my SNN research.

## Woven by Toyota: from maps to LLMs

After two years I wanted to work closer to high-level intelligence; not everything should be turned into chip logic. I moved to Woven by Toyota (then Woven Planet) in Tokyo, on the computer vision team building automated high-definition maps from fleet data.

Then ChatGPT arrived. I started a side project on understanding large code repositories, and with my former director — who shared the interest in LLMs — built the company's first internal chatbot. That effort led the company to create its Generative AI team, where I architected the agent framework behind Lexus's next-generation in-car assistant. Since 2024 I've been in Sunnyvale on the Arene advanced development team, where I built the AI pipeline that turns researcher prototypes into production vehicle code, cutting the handoff from about three months to about a week.

## A voice startup

In 2025 I co-founded a voice-AI startup as CTO — still in stealth, so no name here. I built its real-time conversational server solo and owned the full stack. The agent harness I use today came out of that work; a single engineer now runs the company's day-to-day development through it, and I'm moving to an advisory role.

## Why Sunnyvale

I had been looking for startup opportunities in Tokyo, and my honest conclusion was that Tokyo is the best city in the world to live in and enjoy life — not the best place to build a startup. So when the chance to relocate to Sunnyvale came, I took it.

# Life now

A day usually looks like this: up around 8 or 9, a quick breakfast, then straight into code. Meals are mostly fast, though sometimes I cook with my family. Somewhere in the day there's an hour walking the dogs. The rest — usually 12 to 14 hours — is at the computer, on my job or my side projects.

I keep the energy for that by going to the gym three times a week. My hobby is walking and playing with the dogs with my family: Mochi, a white one-year-old Maltipoo, and Peanuts, an eight-month-old Cockapoo. And I read a lot; more than once a book has been where an idea for my work came from.

# To verify

- Whether the glass-detection work was during the exchange year or the master's, and its relation to the four IEEE/IFAC papers.
- What I'm optimizing for.
