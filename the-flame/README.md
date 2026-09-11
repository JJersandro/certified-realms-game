# The Flame 🔥

A minimalist browser game built around one fantasy: start as a spark, touch matter, burn it, grow, evolve, and eventually consume a world.

## Master roadmap

1. Spark & movement
2. Touch & burning
3. Growth
4. Matter hierarchy
5. World
6. Scale progression
7. Evolution
8. Meaningful choices
9. Risk & balance
10. Cascading destruction
11. Planetary/world endgame
12. UI/UX refinement
13. Audio
14. Polish & optimization
15. Complete game

The roadmap is the boundary for the first complete version. New ideas go to a parking lot rather than silently changing the destination.

## Current milestone: Phase 1 — Spark & Movement

The current prototype implements the first playable loop: mouse-following flame, inertia, touch-based burning, energy-driven growth, minimal HUD, particles, and simple burnable matter.

## Certified Realms visual data

The Flame now uses the **Certified Realms project as its implementation/data home**, while the supplied flame images are treated as visual reference data rather than as a replacement for the game systems.

The references establish a visual direction: layered ribbon-like flame motion, a hot orange/red primary body, cooler violet/cyan/blue wisps, directional flow, transparent layers, dark negative space, and small ember particles. The extracted reference model lives at `src/data/flameVisualData.ts` and currently drives the procedural flame presentation.

This is visual input for the existing roadmap, not a roadmap change. Mechanics remain governed by the locked game constitution.

## Run locally

```bash
cd the-flame
npm install
npm run dev
```
