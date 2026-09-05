---
title: How I'm building the digital fly — the stack and the phase plan
section: research
tags: [snn, connectome, male-cns, brian2, genn, mujoco, neuromechfly, lif, stack, phases]
sources: [reference/fly-project/long-term-plan.md, reference/fly-project/step1-plan.md, reference/fly-project/09-connectivity-structure.md]
related: [research/snn-overview.md, research/stage-1-current-work.md, research/structure-over-weights.md]
updated: 2026-09-05
status: draft
note: Distilled from the working repo's design docs. The full versions are in kb/reference/fly-project/.
---

# The objective in one line

Show that a spiking network wired from a real connectome can learn to control a complex body using local, biological learning rules instead of backpropagation.

# The stack

- **Connectome: male-cns v0.9.** The first complete connectome of an entire adult male fruit-fly central nervous system — brain, optic lobes and ventral nerve cord in one specimen, 166,691 neurons. It supersedes the older VNC-only and whole-brain-only datasets, which matters because it means the same source covers both phases of the plan instead of stitching two animals together. I query it through neuPrint.
- **Neural simulator: Brian2, with GeNN for GPU.** Brian2 lets me write the neuron equations directly and give each neuron its own parameters from its cell type, which is the whole point — the biology is in the data, not hard-coded. GeNN compiles it to CUDA so it runs on one GPU.
- **Body: NeuroMechFly, in MuJoCo.** A high-fidelity anatomical model of the fly, so the brain is controlling something with real joints and real contact physics.
- **Learning: three-factor STDP, structural plasticity, and sleep.** Dopamine-gated Hebbian learning for the weights, pruning and growth for the wiring, and replay cycles for consolidation.

Nothing about the equations is fly-specific. Everything species-specific lives in the connectome and the parameter file, so the same model should in principle run a bee brain or a cortical column.

# Why the wiring is the interesting part

The connectome gives exact, synapse-resolution connectivity: which neuron connects to which, and how many synapses form each connection. What comes out of it doesn't look like the matrices we train:

- It is sparse — only about 13% of possible neuron pairs connect at all. Most information flow is indirect, through chains.
- It is many-to-many at two levels. A typical neuron sends to roughly 14 partners and receives from about 11, and each of those connections is a bundle of synapses, averaging around 23, ranging from 1 to a couple of hundred.
- A single presynaptic release site is polyadic — it broadcasts to about seven partners at once. Biology doesn't do point-to-point.

Initial weights are read off that structure: the synapse count is the weight, and the sign comes from the neuron's neurotransmitter — acetylcholine excitatory, GABA and glutamate inhibitory in the fly. Nothing is fit to behavior. That is the same point as [structure over weights](structure-over-weights.md), coming from the other direction.

# The phase plan

**Phase 1 — the synthetic spinal cord.** Get a stable, learned walking gait out of the ventral nerve cord alone: 25,635 neurons, of which 702 are motor neurons, across 4,206 cell types. Build the connectome-to-Brian2 pipeline, wire the motor neurons to the body's joints and the body's proprioceptive sensors back into the network, then let reward-modulated STDP tune it with forward velocity and stability as the reward.

**Phase 2 — the whole brain.** If the VNC learns to coordinate six legs, scale to the full 166,691 neurons, connect the central brain to the VNC through the descending neurons, and train the brain to issue high-level commands the VNC has to turn into movement.

# The hypotheses I'm actually testing

1. **Form follows function.** A network with biological topology learns motor control faster and more efficiently than a generic fully-connected one.
2. **Stability through consolidation.** Sleep-inspired replay lets the fly keep a walking skill while learning a new one.
3. **Local beats global.** Local learning rules can replace backpropagation for real multi-jointed control.

If the first one is wrong, the connectome is just an expensive initialization. That is the result I most want to know either way.

# To verify

- Whether Phase 1 is scoped to the whole VNC or a leg subset first.
- Whether the burn-in period is settled — bootstrapping an imported connectome that never actually developed.
