# Flame Game — Stable Roadmap

This roadmap is the continuity anchor for the project. Implementation tools may change. The destination and milestone order do not change without an explicit owner decision.

## Phase 0 — Foundation lock
- Establish governance and source-of-truth documents.
- Preserve the existing prototype as reference material.
- Identify the current repository state and technical baseline.
- Record unresolved questions instead of guessing.

## Phase 1 — Reconnaissance and stabilization
- Inspect the current Next.js application and existing gameplay/API code.
- Run the project locally.
- Fix build/runtime blockers without redesigning the game.
- Establish a repeatable smoke-test path.
- Separate prototype behavior from canonical game data where necessary.

## Phase 2 — Canonical game data
- Bring the Certified Realms source material into the repository.
- Normalize realms, characters, enemies, abilities, progression, questions, rewards, and other canon into structured data.
- Keep source/reference material traceable to its normalized representation.
- Never invent missing canon silently.

## Phase 3 — Core game state
Implement a deterministic game-state layer independent of UI and AI providers:
- player identity/profile
- current realm/location
- progression
- health/resources
- combat state
- XP/rewards
- inventory/traits where defined
- encounter state
- save/load state

## Phase 4 — Game rules and combat
- Implement deterministic rules first.
- Implement knowledge/question encounters as game mechanics.
- Ensure scoring/rewards come from explicit rules, not arbitrary model output.
- Make AI an optional content/interaction provider rather than the source of truth for state.

## Phase 5 — World and progression
- Realms and navigation
- encounters
- allies/enemies
- missions
- progression gates
- unlocks
- persistence

## Phase 6 — Presentation and UX
- Establish the Flame Game visual language from the approved design direction.
- Build HUD, menus, combat presentation, realm presentation, feedback, and responsive behavior.
- Visual polish follows working mechanics; it does not replace them.

## Phase 7 — AI integration layer
- Define stable interfaces for narrative generation, question generation, interpretation, and adaptive content.
- Support replaceable providers.
- Keep deterministic game rules outside model prompts.
- Validate model output before it can affect game state.

## Phase 8 — Testing and balance
- Unit-test core rules.
- Test state transitions.
- Test AI failure/fallback paths.
- Run browser smoke tests.
- Balance progression and rewards using explicit data.

## Phase 9 — Release candidate
- Clean configuration and secrets.
- Production build.
- Deployment target selected independently of Base44.
- Final regression pass against this roadmap and Certified Realms canon.

## Non-negotiable sequencing
**Foundation → reconnaissance/stability → canonical data → deterministic state → rules/combat → world/progression → presentation → AI layer → testing/balance → release.**

Do not skip forward because a tool makes a later phase easy. Do not redesign earlier phases merely because a later technology is available.
