# Flame Game — Claude Code Execution Brief

## Read this first

You are the hands-on builder for Flame Game.

This is **not a request to polish a HUD**.

The screenshots currently associated with the project show the **whole current game**. Treat them as the complete current prototype experience and therefore as evidence of the starting point, not as a finished interface whose only problem is styling.

Your task is to help transform the whole game into the much larger experience described in `FLAME_GAME_MASTER_SPEC.md`, while following `ROADMAP.md` for sequencing and `CLAUDE.md` for governance.

Do not replace the established vision because of implementation convenience.

---

# 1. What we are building

Build Flame Game toward a distinctive, fun, funny, dynamic, innovative, expandable game that is:

- immediately understandable;
- satisfying in very short sessions;
- deep enough for long sessions;
- scalable from easy to extreme;
- compelling without exploitative retention mechanics;
- systemic and capable of emergent gameplay;
- expandable through modular systems and data;
- capable of AAA-quality craft over time.

The Flame itself is the protagonist.

The primitive verbs are:

> move · touch · burn · grow

These should become actual gameplay foundations.

---

# 2. Do not mistake the prototype for the product

The current screen is extremely minimal: dark field, small Flame, sparse HUD, simple settings/skill presentation, and tier/level information.

Do **not** conclude that the requested improvement is merely:

- bigger Flame;
- prettier particles;
- nicer buttons;
- cleaner text;
- generic cards;
- generic RPG HUD;
- more background decoration.

The desired improvement is a transformation of the **whole game experience**.

Preserve what is distinctive about the prototype—minimalism, directness, negative space, Flame-centric interaction—but substantially deepen the actual gameplay systems around it.

---

# 3. Core gameplay direction

The intended long-term loop is:

**discover → experiment → interact → consequence → learn → grow → evolve → wonder → discover again**

Curiosity is gameplay.

The player should repeatedly want to test:

> "What happens if I do this?"

Fire should be systemic rather than merely an attack effect.

Potential world interactions include materials, creatures, weather, heat, smoke, water, wind, structures, hidden objects, and unusual entities. Treat these as design directions unless canonical data explicitly establishes them.

---

# 4. Make the Flame itself increasingly alive

Progression should affect:

- movement;
- response;
- pulse;
- luminosity;
- particle behavior;
- sound;
- trail behavior;
- interaction radius;
- environmental influence;
- capabilities;
- apparent density/energy.

Do not use a simple tier-to-color swap as the complete progression system.

A high-level Flame does not have to be physically larger. It can be denser, faster, brighter, stranger, quieter, more controlled, or more influential.

---

# 5. HUD direction

The HUD should be a quiet instrument panel around the Flame, not a dashboard displaying the Flame.

Current redundant information such as:

`SPARK`
`LV 3`
`Foundation: SPARK · LV 3`

should not remain as three persistent lines.

Preferred persistent direction:

`SPARK`
`LV 03`

Deeper Foundation information belongs behind interaction/details.

Do not fill negative space just because it is available.

Do not replace the minimal visual language with generic mobile switches or card-heavy UI.

The interface should become richer without becoming crowded.

---

# 6. Progression and skills

The current skill vocabulary is valuable:

- Ember Reach
- Kindling Heart
- Ashborn Resilience
- Smoke Veil
- Magma Core
- Cinder Storm
- Phoenix Ember

Preserve this naming style where it is compatible with canonical data.

The long-term skill presentation should evolve from a plain list into a meaningful evolution map/skill ecosystem.

Skill effects should sometimes create new gameplay verbs or interactions, not merely percentage bonuses.

Progression should include room for multiple dimensions such as:

- level;
- tier/foundation;
- skills;
- traits;
- discoveries;
- mastery;
- relationships;
- world state.

Do not implement every future system now. Architect for them without premature overbuilding.

---

# 7. Player-created Flame identity

The Flame should be able to develop tendencies from what the player actually does rather than relying entirely on traditional class selection.

Potential dimensions include force, control, stability, movement, curiosity, adaptation, range, and environmental interaction.

These are design candidates, not fixed canon.

The principle is:

> Two players can begin with the same Flame and gradually create different Flames through behavior.

---

# 8. World memory and consequence

Where appropriate, the world should remember meaningful actions.

Examples:

- burned areas;
- ash/regrowth;
- displaced creatures;
- altered paths;
- changed resources;
- NPC reactions;
- discoveries;
- environmental scars;
- opportunities created by destruction.

This must ultimately be represented in explicit deterministic state, not improvised solely by AI.

---

# 9. Humor

Make the game funny through systemic situations as well as authored writing.

The game should support tonal range:

**funny → curious → beautiful → tense → dangerous → absurd → emotional**

Do not turn every interaction into a joke.

Unexpected consequences, strange entities, physics, deadpan feedback, and surprising discoveries can create memorable humor.

Failure can be entertaining and informative rather than simply punitive.

---

# 10. Difficulty

Difficulty must be scalable without relying only on inflated health/damage values.

Future difficulty axes can include:

- enemy intelligence;
- environmental danger;
- resource pressure;
- puzzle complexity;
- time pressure;
- world volatility;
- optional permadeath/severe modes.

The surface game must remain easy to enter even when deep systems become extreme.

---

# 11. Short and long sessions

The game should support:

- seconds-long interactions;
- five-minute sessions;
- medium sessions;
- extended exploration.

Do not force a specific session length through timers or artificial waiting.

The player plays because the game is interesting, not because the game is threatening to punish absence.

---

# 12. Certified Realms

Treat Certified Realms as established source/game data.

When the source material is available in the repository:

1. preserve the original source/reference;
2. normalize it into structured data;
3. maintain traceability;
4. do not silently invent missing canon;
5. keep canonical data independent of rendering and AI.

Certified Realms can become a major realm/system inside the larger Flame Game rather than being the only definition of the game.

---

# 13. Base44

Base44 is reference material from the beginning.

It is not a dependency.

It is not the architecture authority.

It does not need to be exported in order to continue.

Reuse useful ideas from it when they align with the roadmap and master specification.

Do not rebuild the project around Base44.

---

# 14. AI

AI is an optional, replaceable content/interaction layer.

Preferred architecture:

**player → deterministic game systems → validated state → optional AI content/interaction → validated response**

Do not allow model output to become the authoritative source of:

- XP;
- health;
- progression;
- combat results;
- inventory;
- canonical rules;
- save state.

AI may later support dialogue, narrative, questions, hints, adaptive content, lore, personalities, and contextual responses.

Provider/model changes must not require rewriting core game systems.

---

# 15. Technical quality bar

Keep:

- game state deterministic;
- rules explicit and testable;
- data separate from rendering;
- UI separate from authoritative state;
- AI behind replaceable interfaces;
- persistence explicit;
- secrets out of source control;
- core rules testable without an AI provider.

---

# 16. Development order

Follow the stable roadmap.

Current immediate sequence:

### A. Inspect
Inspect the repository, package configuration, routes, components, game loop, API layer, assets, data, and current runtime behavior.

### B. Establish baseline
Run the current project. Record what works, what fails, what is incomplete, and what is reusable.

### C. Stabilize
Fix blockers without prematurely redesigning unrelated systems.

### D. Canonicalize data
Bring Certified Realms source material into the repository when available and normalize it.

### E. Deterministic state
Establish authoritative state independent of UI and AI.

### F. Rules/combat
Implement explicit mechanics and knowledge/question encounters.

### G. World/progression
Build realms, encounters, progression, consequences, persistence, and unlocks.

### H. Presentation
Then elevate the full game experience: interaction feel, Flame evolution, environment, HUD, menus, audio, feedback, animation, responsive behavior, accessibility.

### I. AI layer
Add replaceable AI capabilities where they add value without taking authority from the game engine.

### J. Test/balance/release
Regression test the entire experience against the roadmap and canonical data.

---

# 17. What your first response to the owner should contain

Before substantial implementation, report:

1. repository/framework baseline;
2. how the current game runs;
3. current game loop;
4. current data model;
5. current API/AI dependencies;
6. current assets;
7. current gameplay systems;
8. current UI/HUD systems;
9. build/runtime problems;
10. what can safely be reused;
11. what conflicts with the master specification;
12. the smallest coherent Phase-1 implementation sequence.

Do not rewrite the whole project before producing this inspection.

---

# 18. Definition of success

Do not report success because the code compiles.

A successful milestone means the feature works in the running game, has been tested, preserves the roadmap, and moves the game toward the master vision.

The eventual quality target is:

> **maximum possibility from a minimal core.**

Build a game that can start as a tiny Flame in darkness and grow into a deep, reactive, funny, beautiful, difficult, peaceful, strange, expandable world without losing the identity of the original Flame.
