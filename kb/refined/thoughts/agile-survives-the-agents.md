---
title: Agile survives the agents — why the coding agent still needs a human proxy
section: thoughts
tags: [coding-with-ai, agile, waterfall, requirements, stakeholders, agent-proxy, programmers, safety-critical, iso-26262]
sources: [raw/2026-09-05-harness-day-and-agent-proxy.md]
related: [thoughts/will-ai-replace-programmers.md, projects/agent-harness.md, thoughts/bottom-up.md]
updated: 2026-09-05
status: draft
---

# When the operator job dissolves, is anyone left?

I've argued that "AI coding operator" only stays a distinct job until the tools get easy enough for everyone to use — nobody hires an Excel operator. So take the next step: suppose the tools are that easy and every role can drive them. Is there still a role that stands between the coding agent and the act of creating software?

I think there is, and it isn't the product manager.

# Designing a product and managing requirements are two different jobs

A software system's requirements come from many places. The product manager is one stakeholder among several: security has requirements, operating cost has requirements, compatibility with non-standard hardware has requirements. Someone has to collect all of them, reconcile them, and turn them into engineering requirements — the way automotive and other safety-critical software standards already demand.

That someone is less a programmer than a proxy: the agent's representative to every other human, and every other human's representative to the agent. The agent needs one as long as it isn't fully embedded in human society and can't reach the tacit information that never gets written down. Much of what shapes a system isn't technical at all; it's the residue of business decisions, and no meeting transcript captures it completely.

The day an agent can make decisions like a person, carry responsibility, and bear the consequences of failure is the day it replaces the human programmer for real. But at that point it isn't replacing a job title; it's joining society as a new kind of participant. Until then, the proxy stays.

# Waterfall or Agile, in the age of agents?

The same question from another angle: now that agents can execute, does software development go back to Waterfall — plan everything up front, hand it to the agents, let them decompose and build — or does it stay Agile?

A lot of people assume Waterfall. Plan well, delegate, done. That runs into exactly the problem Waterfall always had: at the start of a project, neither the customer nor the product manager can define the requirements completely. Not because they're bad at it — because many requirements only become clear after the software ships and real users react to it. Forcing Waterfall onto undefined requirements guarantees waste, however fast the execution.

The real difference between Waterfall and Agile was never about how many mistakes get made or how accurate the schedule is. An agent could solve every one of those efficiency problems and still not solve the underlying one: people don't know what software they want until they see some of it.

It's like drawing on a blank sheet. You can't draw the finished outline first. You put down a point, rough in a shape, look at it, and refine. Because requirements are scattered and vague by nature, development has to be Agile: build a small piece, show it to the stakeholders, collect what they say next, and sharpen the outline one iteration at a time. That is how my own harness runs — human review gates at every level exist precisely so the outline can change.

# So: will programmers disappear?

Today's programmer, yes. But the role I've described — the person who facilitates requirement-gathering and translates it for the agent — will exist for as long as the agent needs a proxy into the human world. That is the programmer of the next era.
