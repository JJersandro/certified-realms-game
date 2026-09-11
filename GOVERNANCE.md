# Flame Game — Governance

## Source-of-truth hierarchy
1. Owner decisions
2. ROADMAP.md
3. DECISIONS.md
4. Certified Realms canonical data/specification
5. ARCHITECTURE.md and DESIGN.md
6. PROJECT_STATE.md / IMPLEMENTATION_PLAN.md
7. Existing prototype/reference implementation
8. Tool/framework defaults and AI suggestions

Lower layers cannot silently override higher layers.

## Roles
- **Owner:** final authority and product direction.
- **ChatGPT/ChatGem:** continuity, architecture, planning, interpretation, review, and milestone direction.
- **Claude Code:** implementation, repository work, testing, debugging, and technical execution.
- **Other AI/tools:** specialized contributors only; they do not become project authority.

## Change rule
A change that affects a locked decision, roadmap milestone, game canon, or architecture boundary must be recorded in DECISIONS.md before it becomes the new project truth.

## Prototype rule
The Base44 prototype is historical/reference material. It can inform implementation, but it cannot redefine the project.

## Data rule
Canonical game data must be explicit, versionable, testable, and separable from generated text.

## AI rule
AI may generate content and interpret player intent where explicitly permitted. AI must not silently mutate authoritative game state or invent canon.

## Working loop
1. Read the roadmap and current state.
2. Inspect the repository.
3. Implement the next milestone only.
4. Test it.
5. Record state/decisions.
6. Review against the roadmap.
7. Continue.
