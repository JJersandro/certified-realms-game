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

## Certified Realms visual data

The Flame uses the **Certified Realms project as its implementation/data home**, while the supplied flame images are treated as visual reference data rather than as a replacement for the game systems.

The references establish a visual direction: layered ribbon-like flame motion, a hot orange/red primary body, cooler violet/cyan/blue wisps, directional flow, transparent layers, dark negative space, and small ember particles. The extracted reference model lives at `src/data/flameVisualData.ts` and drives the procedural flame presentation.

This is visual input for the existing roadmap, not a roadmap change. Mechanics remain governed by the locked game constitution.

## Current milestone: Phase 3 — Growth

Phases 1–2 established movement and contact-driven burning. Phase 3 now makes growth a visible physical state: consumed energy increases flame size, active burning raises heat and glow, movement direction affects stability, and those internal states alter stretch, wobble, ribbon motion, core brightness, and ember activity.

Burned matter remains destroyed and leaves a persistent scorch trace. No respawn loop has been introduced.

## Run locally

```bash
cd the-flame
npm install
npm run dev
```
