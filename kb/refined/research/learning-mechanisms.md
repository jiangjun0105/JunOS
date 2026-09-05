---
title: How the digital fly learns — four timescales, nested
section: research
tags: [snn, stdp, homeostasis, sleep, consolidation, epigenetics, structural-plasticity, evolution, learning, timescales]
sources: [reference/fly-project/03-learning-strategies.md, reference/fly-project/08-implementation-phases.md, reference/fly-project/04-learning-normal.md, reference/fly-project/05-learning-memory-consolidation.md, reference/fly-project/06-learning-under-pressure.md, reference/fly-project/07-learning-cross-generational.md]
related: [research/how-im-building-it.md, research/snn-overview.md, thoughts/20-watts-vs-megawatts.md, thoughts/chemistry-is-the-optimizer.md]
updated: 2026-09-05
status: draft
note: Distilled from the working repo's design docs. The full versions, with equations and parameters, are in kb/reference/fly-project/.
---

# One idea: learning is not one mechanism

In deep learning there is a single knob — the weights — and one process that turns it. A brain adapts at many timescales at once, from milliseconds to generations, and each timescale changes different things.

The structure I've settled on is that they **nest**. Each layer takes the slower layer above it as a fixed constraint and optimizes inside it:

- Evolution sets the cell types, the wiring rules, the baseline parameters.
- Epigenetics sets receptor profiles and channel densities within those types.
- Homeostasis sets target firing rates and thresholds.
- Neuromodulation sets the gain, moment to moment.
- STDP adjusts individual connection strengths.
- Short-term facilitation and depression shape transmission spike by spike.

A fly's STDP doesn't redesign its wiring; it tunes weights inside the topology it has. Epigenetics doesn't invent a new cell type; it changes the operating point of an existing one. Only evolution changes the architecture. That is the same [bottom-up](../thoughts/bottom-up.md) shape as everything else I build — and it's why I don't believe one global loss can stand in for all of it.

# The four regimes

**Normal learning — a stable environment.** Reward-modulated STDP does the actual learning: spike timing proposes a weight change, dopamine decides whether it sticks. Around it sit homeostatic threshold adjustment, so neurons drift toward a target firing rate instead of going silent or running away; synaptic decay, so unused connections fade; and short-term dynamics, which turn out to be necessary for the rhythm generators that produce a gait.

**Consolidation — what makes a memory last.** Synaptic scaling normalizes all of a neuron's inputs while preserving the ratios it learned. Metaplasticity changes how plastic each synapse is, which is what stops weights saturating over a long run. Tagging marks a recent, fragile change for later capture. And sleep replays successful patterns while globally downscaling — the fly gets a night.

**Learning under pressure — the environment changes.** Arousal switches the whole network between operating states. Slow epigenetic drift moves baselines, and can even flip a connection's effective sign by switching receptors. Structural plasticity grows and prunes actual connections. These unlock exactly the parameters the earlier phases hold fixed.

**Cross-generational — evolution as the outer loop.** The thing being evolved is not a network but a *genome*: a developmental program, a set of rules for building a brain. The inner loop runs a lifetime of learning; selection acts on behavior. This is where the open problem lives, and it's the same one as [Stage 3](snn-overview.md) — a lifetime's learning can't be written back into the genome, so what has to be encoded is the recipe, not the result.

# What's fixed, and what's learned

Each phase unlocks parameters the one before it held still. Weight magnitude is learned from the start. A connection's sign is fixed early and only becomes driftable later. Topology stays frozen until structural plasticity comes in, and is only evolved in the last phase. That ordering is deliberate: it keeps every experiment interpretable, because only one class of thing is moving at a time.

# The part I find most interesting

Every mechanism here reduces to a handful of mathematical primitives — a scalar gain on a circuit, a threshold shift, exponential decay with activity-dependent renewal, a sliding learning rate. The molecules differ between species: octopamine in a fly where a mammal uses norepinephrine, TRPA1 where we have TRPV1. The equations don't. What differs between a fly and a mammal is the configuration — the connectome, the parameter values, which modulatory pathways exist and what they target — not the math.

That is the whole thesis in miniature. [Learn the principles, not the mechanism.](why-biology.md)

# To verify

- How reward is actually defined for the walking task beyond forward velocity and stability.
- Whether burn-in stays a separate step or is replaced by simulated development.
