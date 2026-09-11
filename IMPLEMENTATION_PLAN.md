# Flame Game — Implementation Handoff

## Mission
Continue Flame Game from the existing work. Do not restart the concept. Do not treat the Base44 prototype as the project itself.

## Stage A — Inspect
- Read all project governance files.
- Inspect repository structure and dependencies.
- Inspect existing UI, API, assets, configuration, and scripts.
- Run the project.
- Record what works and what does not.

## Stage B — Stabilize
- Fix only blockers required to make the current baseline reliably run.
- Add minimal smoke-test coverage.
- Avoid broad architecture changes during stabilization.

## Stage C — Extract foundations
- Introduce explicit game state.
- Introduce deterministic game rules.
- Introduce structured game data.
- Keep the current UI functional while these boundaries are extracted.

## Stage D — Integrate Certified Realms
- Add complete source assets.
- Normalize canon.
- Replace hard-coded prompt lore with structured data where applicable.
- Validate data references.

## Stage E — Build the actual game loop
- Realm → encounter → decision/question → rule evaluation → consequence → reward/progression → next state.
- State transitions must be deterministic and testable.

## Stage F — Add AI intelligently
- AI generates/adapts content through defined interfaces.
- AI output is schema-validated.
- AI failure cannot corrupt the game state.
- Providers remain replaceable.

## Stage G — Presentation
- Build the approved Flame Game visual/interaction language around the functioning game loop.

## Stage H — Test and release
- Unit tests.
- Integration tests.
- Browser smoke tests.
- Failure-path tests.
- Production build.
- Final roadmap audit.

## First Claude Code instruction
> Inspect first. Do not rewrite. Read the project constitution and roadmap, inspect the repository and run the current application. Report the actual baseline, blockers, reusable systems, and the smallest safe Phase-1 implementation sequence. Do not change the roadmap or locked decisions.
