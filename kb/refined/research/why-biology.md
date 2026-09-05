---
title: Why I look to biology — indirect observation, the hierarchy of sciences, and what the brain actually looks like
section: research
tags: [snn, epistemology, indirect-observation, hypothesis-first, hierarchy-of-sciences, brain-structure, small-world-networks, local-connectivity, agi, tell-tale-brain, einstein]
sources: [raw/2026-09-03-books-and-research-epistemology.md, raw/2026-09-03-research-snn.md]
related: [books/the-tell-tale-brain.md, books/einstein-biography.md, thoughts/learning-by-asking.md]
updated: 2026-09-04
status: draft
---

# Indirect observation

Physicists have almost never been able to look directly at the things they discovered — atoms, molecules, the curvature of spacetime. Either the instruments didn't exist yet or the phenomenon is inherently unobservable. So they designed experiments that reveal it indirectly, or deduced its existence by reasoning.

What struck me in The Tell-Tale Brain is that a neuroscientist chose to work the same way. V.S. Ramachandran, who directs the Center for Brain and Cognition at UC San Diego, has every imaging machine available, yet he studies the brain with cheap, ingenious experiments — most famously, in the late 1990s, treating phantom-limb pain with a mirror box: a mirror placed so the patient sees the reflection of the intact hand where the missing one would be, and the brain, shown a hand it can move, releases a clenched phantom it could not. His experiments feel like the classic physics experiments for things you cannot see: the motion of electrons, the wave-particle nature of light.

Einstein's biography gives the philosophical half of this. Ernst Mach shaped the young Einstein and then, dogmatic in his positivism, couldn't accept relativity; Einstein's reply was, roughly, "does the moon exist only when you look at it?" The early positivist position was that what cannot be observed does not exist. The mature version is that what cannot be observed directly or indirectly does not exist. That word, indirectly, is the whole difference, and it is what inspired me.

Mainstream biology leans heavily on direct observation. The Tell-Tale Brain shows that low-cost, highly creative indirect methods can reveal mechanism. I think the same approach is how we will come to understand AI systems: not by reading every weight, but by forming a hypothesis and designing the experiment that would expose it.

# Hypothesis first, then the experiment — and how I read papers now

It starts with a hypothesis. You build a mental model of how the system works; from that model you deduce how it would behave under specific conditions if the model were right; then you design a small, targeted experiment to check. Elegant experiments are the method, but the real key is whether there is a model of "how this thing works" in your head — and building that model is an act of imagination and creativity, not rule-based deduction. That is not how the brain works. Einstein and every great scientist followed this pattern.

This changed how I read AI papers. I used to fixate on the rigid, direct logic. Now I first ask whether the result matches my intuition. If it does, I go through the authors' argument and learn the logic. If it doesn't, I hunt for the hole in their reasoning. Intuition first, logic second: it lets me judge quickly whether something is plausible, and it keeps sharpening the intuition itself, which is where research ideas come from. When intuition says "this is how it works," the next thought is "then wouldn't doing it this way work better?" — and that becomes an experiment.

# The hierarchy of sciences, and why the brain is a math problem

After enough history of AI, lectures, and experiments, the layering of the sciences looks clear to me. Zoom into ecology and you get biology; zoom into biology and you get chemistry — organic compounds, tissue, cells; zoom into chemistry and you get physics — molecules and atoms; zoom into physics and you get mathematics — field equations that explain the phenomena.

Follow that accepted hierarchy down and everything, including intelligent life, bottoms out in mathematical structure. Nature has run random trials for billions of years and kept what survived; whatever survived is, in effect, a mathematical optimum. If we learn the mathematics, we can reproduce it. We understood the physics of bird flight, wrote it down, and built airplanes. Likewise, if we work out the mathematics inside the brain, we can rebuild intelligence in a different form with the same underlying math.

So the target is the equations in the brain, not its anatomy.

# What the brain actually looks like — and how different our networks are

From the neuroscience courses and books I've gone through, the brain is structurally unlike the networks we build today:

- Physical form. Unfolded, the cortex is a large thin sheet with many layers, each with its own structure and way of working. It is folded up, its 3D position affects function, and it contains maps of the body's parts.
- Local connectivity. Most connections are local, not the global, all-to-all connectivity that dominates our architectures.
- Signaling. Neurons do not pass floating-point numbers or currents of varying size; they fire or they don't. The best model we have for that is the spiking neural network, not the mainstream artificial neural network.
- Small-world topology. The wiring is a local small-world network — a pattern that appears everywhere in nature, from human social networks to animal networks.

That form is nature's final optimum. We don't need to copy the physiology — no feathers, no flapping wings — but we do need to look through the physiology to the mathematics behind it.

Our networks mostly don't use any of this. We know biological networks are built this way and we know the benefits; we haven't adopted the architecture because nobody yet knows how to fit the pieces together.

# Where my intuition lands

When all of this fuses in my head, my intuition says this path is the right direction toward human-level AI. We may eventually build intelligence that surpasses the brain, but we haven't reached human-level yet, and that makes this direction worth exploring. It is the foundation under the three-stage fly-brain plan in [snn-overview.md](snn-overview.md).

