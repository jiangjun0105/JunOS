---
title: Stage 1 — Getting a digital fly brain to move a digital fly body
section: research
tags: [snn, lif, fruit-fly, connectome, vnc, motor-control, sensorimotor-loop, simulation]
sources: [raw/2026-09-03-research-snn.md]
updated: 2026-09-05
status: draft
---

# Setup

I downloaded a fruit-fly connectome from an open-source project — one of the newer releases that includes every neuron, both the central brain and the ventral nerve cord (VNC). (Almost certainly the BANC — the Brain-and-Nerve-Cord connectome released by FlyWire and Harvard collaborators in November 2025, the first synapse-level map of a fly's entire central nervous system.) I designed a Leaky Integrate-and-Fire (LIF) neuron function and converted the connectome into a runnable spiking neural network.

Then I plugged that network into a digital fly body.

# What happened first

Right after connecting it, the fly could not move efficiently. That is expected. There are several plausible causes: errors in how signals are transmitted, the LIF parameters I chose, and the body model itself. The digital body is not the real biological body, and uploading neuron pathways leaves many places for errors to creep in.

That is fine. A newborn cannot walk either; it learns. Even in the womb, the developing nervous system gets proactive stimulation — the eyes are being exercised before they are ever used.

# The idea I'm chasing: proactive stimulation and the sensorimotor loop

I am particularly interested in this proactive stimulation while the nervous system is still developing. It forms a closed loop:

1. Activity starts in the motor cortex (or, in humans, as far down as the spinal cord).
2. It travels to motor neurons and drives the actuator.
3. The actuator moves, which triggers sensory neurons.
4. Sensory signals travel back to the sensory cortex and into the brain.

Motor and sensory cortex are connected, which closes the loop.

I am looking for this loop inside the fly's nervous system and trying to reproduce it with the digital brain and body. Once it exists, the loop becomes the signal I use to tune the LIF parameters and the detailed neuron-to-motor wiring. If that works, I expect to get controlled movement. The next step after that is to bring in the rhythm center in the VNC and see whether it produces patterned movement — which is the road to a simulated walking fly.

# Where it stands

- Early stage, but with promising results: I can detect the loop and am generating motion in one leg.
- To match real neurons well I had to use a high-accuracy leg model rather than a simplified one; it is much closer to a real fly leg.
- Only one leg is modeled so far — the public simulator data only includes a motor model for the left front leg. The plan is to build multi-joint motor models for the remaining five.
- Once loop detection is reliable, the next experiments are about using the loop to improve leg control — and, if the loop holds under proactive stimulation, checking whether the network's weights change measurably and whether those changes help.

# Working method

The experiments are written, generated, and managed with my own agent harness, which is what makes fast idea validation possible in free time. Compute is small — a single modest GPU.

# To verify

- Confirm the connectome is the BANC (FlyWire, Nov 2025) and note the version.
- Physics/body simulator and the source of the high-accuracy leg model (NeuroMechFly v2 in MuJoCo is the standard choice; confirm).
- Software stack (framework, language, GPU).
- Any numbers worth stating publicly (e.g. neuron count, simulation step, loop-detection criteria).
