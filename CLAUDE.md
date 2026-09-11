# Flame Game — Claude Code Constitution

## Mission
Build **Flame Game** as the actual working game, using the established roadmap as the source of truth.

## Authority
1. The project roadmap and locked decisions outrank implementation convenience.
2. The owner has final authority.
3. Claude Code is the hands-on builder: inspect, implement, test, debug, and report.
4. Do not silently replace an established decision because a framework, library, model, or tool suggests another approach.
5. If an implementation constraint creates a real conflict with the roadmap, stop at the boundary, document the conflict, and surface it.

## Base44
The Base44 app is **reference material from the beginning**. It is not the project authority, not a runtime dependency, and not a required export source. Reuse useful mechanics, structure, wording, visual ideas, and behavior where they align with the roadmap. Do not rebuild the project around Base44.

## Certified Realms
Certified Realms is established game/source data. Treat supplied Certified Realms material as authoritative data once committed to the repository. Do not invent missing canon. Pending source assets are explicitly marked pending.

## First operating rule
**Inspect first. Build second.**
Before changing gameplay architecture, inspect the repository, existing implementation, package configuration, API routes, assets, and current behavior. Compare the findings with ROADMAP.md and PROJECT_STATE.md.

## Change discipline
- Make one coherent milestone at a time.
- Preserve working behavior unless the roadmap requires changing it.
- Prefer small, testable changes.
- Keep game data separate from rendering and game logic.
- Keep AI/model calls behind replaceable interfaces.
- Never put secrets in source control.
- Update PROJECT_STATE.md and DECISIONS.md when meaningful state or decisions change.

## Definition of done
A milestone is not done because code exists. It is done when:
- the intended behavior is implemented;
- the app builds/runs;
- relevant tests or smoke checks pass;
- no roadmap requirement was silently dropped;
- the implementation state is recorded.
