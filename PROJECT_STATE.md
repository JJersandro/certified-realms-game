# Flame Game — Project State

## Current status
**Phase 0 — Foundation lock** is being established.

## Repository baseline
Repository: `JJersandro/certified-realms-game`
Branch for foundation work: `flame-foundation`
Current stack: Next.js application.

## Existing implementation observed
- Client-side game start flow.
- Player name input.
- Question/answer loop.
- Multiple-choice and free-text interaction.
- Score tracking in the client.
- `/api/game` server route.
- Gemini primary provider with Groq fallback.
- Prototype lore and character/combat data embedded in server prompt code.

## Important interpretation
The existing implementation is useful prototype/reference material. It is not yet the final Flame Game architecture.

## Base44
Base44 remains reference material. It is not a dependency and does not block development.

## Certified Realms
Certified Realms source material has been identified as canonical input. Full source assets/data normalization is pending the repository receiving the complete source material.

## Next milestone
Phase 1: reconnaissance and stabilization.

### Immediate next tasks for Claude Code
1. Read `CLAUDE.md`, `ROADMAP.md`, `GOVERNANCE.md`, `ARCHITECTURE.md`, and `CERTIFIED_REALMS.md`.
2. Inspect the complete repository.
3. Run/install the project and establish current build/runtime status.
4. Identify blockers and technical debt.
5. Compare existing behavior against the roadmap.
6. Do not perform a broad rewrite yet.
7. Report findings and propose the smallest implementation sequence that advances Phase 1.
