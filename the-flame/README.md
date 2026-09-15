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

## Current milestone: Phase 15 — Complete game

All 15 roadmap phases are implemented. A player's session now runs, in order:

- **Title screen** (`TitleScene`): a minimal "THE FLAME" / "tap to begin" card is the first
  thing that boots; `FlameScene`/`UIScene` don't simulate or render a single frame until the
  player taps through.
- **Spark, movement, and touch/burning** (Phases 1–2): pointer-driven steering, contact-based
  ignition of nearby matter.
- **Growth** (Phase 3): consumed energy increases flame size; active burning raises heat and
  glow; movement direction affects stability, and those internal states alter stretch, wobble,
  ribbon motion, core brightness, and ember activity. Burned matter stays destroyed and leaves
  a persistent scorch trace.
- **Matter hierarchy** (Phase 4): a 7-tier/77-level ignition-gate system (`progressionData.ts`,
  `matterData.ts`) determines what the flame can burn at a given level.
- **World** (Phase 5): a 4000x3000 world of regions (`worldData.ts`), much bigger than the
  viewport, with camera-follow (`WorldManager` driving `MatterRegistry`).
- **Scale progression** (Phase 6): the same level/tier system also gates speed and reach
  capabilities (`scaleData.ts`) — one tier system, not two that could drift apart.
- **Evolution** (Phase 7): heat/stability-blended color forms per tier (`evolutionData.ts`),
  built from whichever palette (default or colorblind-safe) is currently active.
- **Meaningful choices** and **risk & balance** (Phases 8–9): forced/risky ignition
  (`choiceData.ts`, `riskData.ts`) and overheat/instability that shrinks the flame and can
  demote its level.
- **Cascading destruction** (Phase 10): nearby idle fuel can catch fire from an adjacent burn.
- **Planetary/world endgame** (Phase 11): fully clearing a world escalates `worldStrength` for
  the next generated world (`endgameData.ts`) and unlocks a 7-node permanent skill tree
  (`skillTreeData.ts`, `SkillTreeManager`) — this loop repeats indefinitely; there is no win
  condition or ending screen, by design.
- **UI/UX refinement** (Phase 12): all HUD chrome lives in a second scene, `UIScene`, running
  in parallel with `FlameScene` and communicating only via `game.events`.
- **Audio** (Phase 13): every sound (ignite ping, ember crackle, level-up chime, world-clear
  fanfare, skill-purchase blip, continuous heat-driven ambient drone) is synthesized at runtime
  via the raw Web Audio API — no loaded/licensed audio files.
- **Polish & optimization** (Phase 14): Phaser postFX (`Glow`/`Bloom`) on the flame body, core,
  and halo; a colorblind-safe alternate palette and a reduced-motion toggle, both under a
  `SETTINGS` HUD button; scorch marks now clear on every world regenerate.
- **Complete game** (Phase 15): the title screen above, plus a final coherence pass across every
  earlier phase. There is deliberately no restart/replay UI — once play starts, the session runs
  continuously exactly as it always has; refreshing the browser tab is how a player starts over.

The game is also installable as a PWA (manifest + service worker, no native app shell).

No respawn or reset loop exists anywhere in the game. Burned matter remains destroyed within a
world, and a full world clear regenerates fresh (tougher) matter rather than resetting anything
about the flame itself.

## Development process

Beyond the roadmap, the game's ongoing quality is driven by a small team of specialized
Claude Code subagents (`.claude/agents/flame-*.md`), each reading from and appending to
`BACKLOG.md` so findings accumulate across runs instead of starting from zero every time.
`VISION.md` is the companion file: it's the project owner's actual stated direction, in their
own words, so a run checks against real intent, not just internal design principles or
whether something is technically broken -- every agent reads it before a real pass.

- **`flame-phase-implementer`** builds out a roadmap phase.
- **`flame-playtest-verifier`** drives the game in a real headless browser after any gameplay
  change, before it's considered done.
- **`flame-mobile-perf-auditor`** checks frame budget, memory growth, and touch input for
  phone viability, periodically and before any phone-facing deployment.
- **`flame-balance-tuner`** measures and tunes the numeric economy -- XP curve, skill tree
  costs, risk thresholds -- against real measured playtime, not guesswork.
- **`flame-visual-designer`** judges and improves whether the game actually looks and feels
  alive, grounded in the visual reference model (`src/data/flameVisualData.ts`) and
  game-feel/"juice" principles, not just whether it renders without errors.

This is process tooling, not a roadmap phase -- it doesn't change the destination in
"Master roadmap" above, it's how the team keeps what's already shipped from quietly rotting.

## Progression expansion (explicitly beyond v1)

`PROGRESSION_CONCEPT.md` is a deeper 7-domain progression/economy system the project owner has
designed as deliberate new scope beyond the roadmap above, not a replacement for it.
**`flame-progression-architect`** implements it strictly one real function at a time from
`PROGRESSION_QUEUE.md` (the concept translated into The Flame's actual mechanics), never in a
batch -- this system is large and foundational enough that every step gets built and verified
in isolation before the next one starts.

## Run locally

```bash
cd the-flame
npm install
npm run dev
```
