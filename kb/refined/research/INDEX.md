---
title: Research
section: research
updated: 2026-09-04
status: draft
---

# Post-transformer models, by way of biology

Transformers are too big and too hungry to live inside a robot, and they can't absorb experience into themselves. Biological brains do both, and a biological brain is structurally a spiking neural network. My research is a free-time, small-GPU project that starts from an uploaded fruit-fly connectome, puts it in a digital body, and tries to make it learn — in three stages. → [Full overview](snn-overview.md)

**How it's actually built.** male-cns v0.9 (166,691 neurons) through neuPrint, Brian2 with GeNN on the GPU, NeuroMechFly in MuJoCo for the body, and learning by three-factor STDP plus structural plasticity and sleep. → [The stack and the phase plan](how-im-building-it.md) · [How the fly learns](learning-mechanisms.md)

**Stage 1 — Individual development and task learning.** Convert the connectome to a LIF network, plug it into a digital fly, and get it to control its own body, then learn a custom task. In progress: I can detect the sensorimotor loop and generate motion in one leg. → [Current work](stage-1-current-work.md)

**Stage 2 — Morphological change.** Change the body (injury, environment, wheels instead of legs), keep the neuron count fixed, and see whether the same learning lets the brain adapt — ending with a fly brain driving a physical robot.

**Stage 3 — Guided evolution.** Change body and brain together; overgrow neurons, then prune to the body, the way newborns do — nature's random evolution, steered.

# Track record

Six peer-reviewed robotics papers (University of Tokyo; glass detection for laser-rangefinder mapping, human-robot interaction, crowd navigation), a Toyota patent on gesture-based in-car search, and five DJI image-processing patents (tone mapping, noise reduction, dead-pixel compensation, image enhancement). → [Publications and patents](publications.md)

# The ideas underneath

Each of these is an argument on its own; the stages are what they add up to.

- **Learn the principles, not the mechanism.** We don't build airplanes that flap. Look through the physiology to the mathematics behind it. → [snn-overview](snn-overview.md)
- **Indirect observation and hypothesis-first science.** Physicists never saw atoms; a neuroscientist cured phantom pain with a mirror. Build a model of how the thing works, then design the cheap experiment. → [why-biology](why-biology.md)
- **The hierarchy of sciences bottoms out in math.** Evolution's survivors are mathematical optima; extract the equations and rebuild. → [why-biology](why-biology.md)
- **What the brain actually looks like.** A thin layered sheet, local connectivity, spiking, small-world topology — none of which our networks use. → [why-biology](why-biology.md)
- **Structure over weights.** A whole-fly-brain model moves a body with no trained parameters at all — just the wiring graph, synapse counts, excitatory/inhibitory signs, and LIF neurons — and tolerates single-neuron loss under strong drive. Training should search structure, co-evolved with the body. → [structure-over-weights](structure-over-weights.md)
- **Cross-generational accumulation is what made us smart** — so a simple brain iterating across generations could get there too. → [Why I'm optimistic about AI](../thoughts/why-im-optimistic-about-ai.md)
- **Chemistry is the optimizer.** Reward chemistry is what rewires a brain — "emotion" is our name for its effect on the body — and a reward function does the same job in a robot. → [Chemistry is the optimizer](../thoughts/chemistry-is-the-optimizer.md)
- **Intuition first, logic second** — how I read papers and pick experiments. → [why-biology](why-biology.md) · [Learning by asking](../thoughts/learning-by-asking.md)
- **Backprop is a biological myth.** Weight transport and a global clock rule it out; local rules, growing networks, and learning-during-inference are the alternative. → [20 Watts vs. Megawatts](../thoughts/20-watts-vs-megawatts.md)
- **Solo research is now ~20x faster** because AI removes the validation bottleneck. → [snn-overview](snn-overview.md)
