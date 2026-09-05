---
title: Structure over weights — what a simulated fly brain says about how brains should be trained
section: research
tags: [snn, connectome, robustness, architecture-search, embodiment, eon-systems, flywire, mujoco, neuromechfly, neurogenesis, pruning, training-paradigm]
sources: [raw/2026-09-03-research-structure-over-weights.md]
related: [research/snn-overview.md, thoughts/bottom-up.md]
updated: 2026-09-04
status: draft
fact-check: 2026-09-04 — Eon Systems posts (Mar 2026) and Shiu et al., Nature 2024. See notes at bottom.
---

# The observation I can't shake

More and more biological-brain work points the same way. In 2024 Philip Shiu and colleagues built a leaky integrate-and-fire model of the entire fruit-fly brain — more than 125,000 neurons, 50 million synapses — from the FlyWire connectome. In March 2026 Eon Systems put that kind of model into a physically simulated body (NeuroMechFly in MuJoCo) and the fly moved.

What strikes me is how little was needed. The model has no trained parameters. It uses four things: the graph of who connects to whom, a weight for each connection equal to the number of synapses, a map of which neurons are excitatory and which inhibitory, and a leaky integrate-and-fire neuron. Nobody fit the weights to behavior; they were read straight off the anatomy. And the network is redundant: in Shiu's model, silencing individual neurons had the greatest effect only when the sensory drive was weak — as stimulation increased, single neurons stopped mattering, because the circuit has more than one path to the same output.

Weights, in other words, are not where the intelligence lives. Structure is. The weights are just a consequence of it.

# What that means for training

Mainstream deep learning does it backwards: hand-design a fixed architecture, then spend all the effort training the parameters inside it. The fly says the architecture is the part that carries the function and the parameters fall out of it.

If we ever want to train a real brain — an SNN or whatever comes after — I think two things have to be true:

1. The brain is tightly coupled to its body. The body it has to control determines the structure the brain evolves into.
2. Training explores structure. The training process should search over the network's architecture, not cling to a frozen architecture and push on weights.

Structure is what makes the difference. This is the reasoning behind Stage 3 of my plan — grow more neurons than needed, then prune to the body — in [snn-overview.md](snn-overview.md).

# Fact-check notes

- I originally remembered the fly brain as tolerating scrambled weights. That is not what the paper shows: when Shiu et al. shuffled connection weights at random while keeping the graph, the sugar-to-feeding circuit fired in only 1 of 100 runs versus 100 of 100 with the real weights. So the precise weights do matter — but they are not learned, they are synapse counts, i.e. structure measured a second way. The claim that survives, and which I now think is stronger, is that nothing was trained.
- Neuron-silencing robustness is supported: Shiu et al. report that single-neuron silencing has its largest effect at low stimulation frequency, implying redundancy as stimulation increases.
- Eon Systems' embodied fly (March 2026): FlyWire central-brain connectome (~140k neurons, ~50M synapses), LIF neurons, NeuroMechFly v2 body (87 joints, from micro-CT of real flies) in MuJoCo, descending neurons mapped by hand to low-dimensional motor commands. They report "91% behavior accuracy" and state limits: no plasticity, no long-term memory, hand-chosen brain-body mappings.
