---
title: Post-transformer models via biological SNNs — overview
section: research
tags: [snn, spiking-neural-networks, robotics, connectome, fruit-fly, post-transformer, embodied-ai]
sources: [raw/2026-09-03-research-snn.md]
updated: 2026-09-03
status: draft
---

# Why I'm working on this

Transformers have been enormously successful, but they carry drawbacks that matter a lot once you care about robots: they are massive, they burn huge amounts of energy, and they have to live in a data center. A model like that cannot fit inside a robot's body.

I think robots need to be individuals. Real creatures may belong to the same species, yet each one is different because it lives, works, and behaves in a different environment. The best robot for each environment should be distinct, which means the best brain for each robot has to live on the edge, not in the cloud.

Brain and body should also be tightly coupled. In nature, brain structure is built around the body: flies devote large brain regions to vision because they have large eyes; birds have regions dedicated to flight. Without a body, our brains would not be what they are. A robot's brain should be coupled to its physical body and tuned to the environment it operates in.

Transformers fall short here in two more ways. They cannot continuously absorb day-to-day experience into the model itself and rely on external retrieval instead, and their sample efficiency is poor. Biological neural networks, shaped by billions of years of evolution, handle both naturally. So the most promising way to build equally capable and far more efficient models is to learn how nature solved it — and the biological brain is, structurally, a spiking neural network.

That does not mean copying nature literally. We do not build airplanes that flap their wings. We understand the underlying physical and chemical principles, then design systems that follow those principles with the materials we have, for the use cases we care about.

## What biology already tells us

The mechanisms behind biological SNNs are well understood, and each one is an architectural hint:

- Neurons communicate with discrete spikes, not continuous floating-point activations.
- Energy is consumed only when a neuron spikes; a signal does not light up the whole network.
- Leaky dynamics come from ion-density transitions in a fluid environment and cost almost nothing.
- Time is an intrinsic part of how information is processed, not an afterthought.
- The system is robust on a messy biological substrate.

The bottleneck is not understanding; it is that the field has not put enough effort into translating these principles into practical, highly capable artificial networks for complex tasks. That gap is what fascinates me, and I believe it is the right path toward smarter, more efficient neural networks that can power future robotics.

# The thesis in one sentence

Start from biological neural networks that have already been uploaded — C. elegans, the fruit fly — use them to understand how a biological network adapts to its environment, get them to control the original bodies of those animals in simulation, and then teach these digital creatures to learn, adapt to new environments, and complete simple tasks. Given a brain and body designed by nature, figure out how to make it learn and do new things.

# The three stages

## Stage 1 — Individual development and task learning

How does a single entity develop its neural system, adapt, perform its natural functions, and then learn a custom task? A concrete target: a digital fly that can detect dog poop, fly to a specific location, and notify a human.

Status: in progress. See [stage-1-current-work.md](stage-1-current-work.md).

## Stage 2 — Morphological change and adaptation

What happens when the body changes — injury, an environment that makes a body part useless, or deliberate digital modifications? Does the same learning algorithm let the brain adapt to a new body, new control logic, and new environmental feedback? In this stage only the body changes; the brain's neuron count stays fixed.

The end goal of this stage is to move the body out of the digital world: replace a fly's legs with wheels and have the fly brain drive a physical wheeled robot to carry out tasks it learned in simulation.

## Stage 3 — Guided evolution and structural brain change

This stage mimics evolution. In most animals the neuron count is fixed after birth; only synaptic connections change, probably because adding neurons mid-life would destabilize the system. Between generations, small mutations add or remove neurons, and that cumulative process eventually produces new species.

Natural evolution is random; I want to guide it top-down toward directions useful to us. Building on Stage 2, both body and brain change:

1. Modify the body and start with a slightly larger brain.
2. Simulate the biological process in which newborns grow far more neurons than needed and then prune them back.
3. Let this gradual process produce an optimized brain structure and neuron count tailored to the modified body.

The deeper reason for this stage: what separated humans from other animals was not a smarter brain but accumulation across generations — each one standing on the last. If that is the mechanism, then a very simple biological brain that iterates generation over generation could grow into a simplified human-like brain that keeps the ability to evolve and create within its capacity. (See [why I'm optimistic about AI](../thoughts/why-im-optimistic-about-ai.md).)

# How I'm running it

This is a personal, free-time project. It is not for papers and not for my company; it is free exploration, and it is a lot of fun. I hope to finish Stage 1 within 2026.

I think that is realistic for two reasons. First, the work does not need a large GPU cluster — a small GPU is more than enough. Second, most researchers are slowed down by validating ideas: setting up environments, writing programs, running experiments. I use a coding system (my own agent harness) that writes experiments, generates code, and keeps different ideas organized, so I can verify ideas much faster than one engineer working by hand. Compared with my master's days, finding relevant research, learning useful designs, implementing them, and testing them is roughly twenty times more efficient now. With industry experience, a robotics background, and today's AI tools, I think this kind of research is now possible for an individual.

# To verify

- Name of the open-source connectome project used (full fly, brain + VNC).
- Related work to position against (e.g. connectome-to-body efforts, SpikeGPT and other SNN language models, RWKV/Mamba-style architectures, neuromorphic hardware).
