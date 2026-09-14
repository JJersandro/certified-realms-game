# Flame Game — Master Game Specification

## 0. Purpose

This document defines the intended game, not merely the current prototype and not merely its HUD.

The current screenshots represent the **whole current game experience**. They are therefore a starting-state prototype, not a finished HUD concept. Claude Code must evaluate and improve the complete game experience: gameplay, interaction, progression, world, systems, feedback, audiovisual behavior, UX, humor, challenge, extensibility, and presentation.

This document expands the stable roadmap without replacing it. The roadmap controls sequencing. This document defines what the destination should feel and function like.

---

# 1. North-star vision

Build **Flame Game** into an unusually distinctive, fun, funny, dynamic, innovative, expandable game that is immediately approachable but capable of extreme depth.

The desired range is:

- understandable within seconds;
- enjoyable for a very short session;
- capable of sustaining longer sessions;
- capable of becoming difficult and sophisticated without becoming inaccessible;
- replayable without requiring manipulative retention mechanics;
- systemic enough to generate surprising player stories;
- extensible enough to grow into a large game without repeatedly rebuilding its foundation;
- polished enough, eventually, to approach AAA-quality craft in responsiveness, audiovisual feedback, systems design, UX, writing, stability, and presentation.

AAA is a quality target, not a requirement to begin with AAA production scope. The first versions should remain small, but the architecture must leave room for substantial expansion.

---

# 2. Core identity

The player does not primarily control a humanoid hero with a fire skin.

**The Flame is the protagonist.**

The Flame should feel like a living, responsive game entity rather than a decorative cursor or projectile.

The fundamental interaction vocabulary is:

> **move · touch · burn · grow**

These are not marketing words only. They should become the primitive verbs from which larger mechanics emerge.

### MOVE
Movement can influence momentum, heat, risk, discovery, environmental interaction, and future capabilities.

### TOUCH
Touch should be the simplest form of curiosity and interaction. Different entities should react differently.

### BURN
Burning is a systemic interaction, not merely an attack animation. Materials, creatures, structures, weather, and environments can react differently to heat and fire.

### GROW
Growth should mean new capability, changed behavior, discovery, and evolution—not only larger numbers.

---

# 3. The central player fantasy

The player should repeatedly experience:

> **I wonder what happens if I do this.**

The strongest loop is therefore not grind → reward → repeat.

It is:

**discover → experiment → interact → consequence → learn → grow → evolve → wonder → discover again**

Curiosity is gameplay.

Experimentation should usually be rewarded, or at minimum produce an interesting consequence.

---

# 4. The game must be easy and extreme simultaneously

The game should support different depths of engagement without splitting into unrelated products.

### Immediate layer
A new player can understand:

- there is a Flame;
- I can move it;
- I can touch things;
- things react;
- the Flame can grow.

### Intermediate layer
The player discovers:

- skills;
- traits;
- environments;
- enemies;
- resources;
- combinations;
- progression paths;
- world consequences.

### Advanced layer
Experienced players can master:

- system interactions;
- build/evolution combinations;
- environmental manipulation;
- difficult encounters;
- hidden mechanics;
- advanced movement/control;
- challenge modes;
- optimization and mastery.

### Extreme layer
Optional extreme play can include:

- severe environmental danger;
- complex encounters;
- resource scarcity;
- high enemy intelligence;
- permadeath or near-permadeath modes where appropriate;
- difficult trials;
- chained consequences;
- mastery-level challenges.

Difficulty should be scalable by design, not by simply inflating enemy health.

---

# 5. Compelling without exploitative addiction

The target is **compulsion through curiosity and mastery**, not psychological manipulation.

Do not design around:

- energy timers;
- artificial waiting periods;
- manipulative notifications;
- fear-of-missing-out retention systems;
- loot-box dependence;
- fake scarcity;
- punishment for not returning;
- intentionally frustrating friction designed to drive monetization.

The player should think:

> "I want to play because I want to see what happens."

not:

> "I have to play or I will lose something."

Short sessions and long sessions must both be valid.

---

# 6. The Flame must communicate state without relying on text

The current Flame is visually small and simple. Preserve that simplicity as a foundation, but evolve it dramatically over time.

Progression should change more than color:

- luminosity;
- pulse;
- motion;
- scale;
- density;
- particle behavior;
- trail behavior;
- sound;
- environmental influence;
- responsiveness;
- complexity;
- apparent energy;
- interaction range.

A player should eventually be able to look at a Flame without reading the HUD and infer something about its state and power.

Power does **not** always mean bigger.

A powerful Flame may become smaller but denser, faster, quieter, brighter, stranger, or more controlled.

---

# 7. Evolution and color language

Do not implement progression as a simple `tier -> color` palette swap.

Warm fire should remain semantically recognizable.

A possible visual philosophy is:

- early states: ember/red/orange;
- middle states: brighter orange/yellow/white;
- advanced states: increasingly luminous and physically unusual;
- extreme states: a hot white core with controlled cool-spectrum energy at the edge may communicate that the Flame has exceeded ordinary fire.

Cyan/blue must not accidentally make the Flame read as ice, water, or generic technology.

The final tier should feel like an evolution of fire into something extraordinary, not like a different elemental type.

Exact tier names and progression remain subject to canonical game-data decisions. Do not invent final canon where the source material does not establish it.

---

# 8. The world is part of the game

The black space in the prototype should not be treated as empty space that must immediately be filled.

It can represent **the unknown**.

The Flame reveals the world.

The world reacts to the Flame.

The player should gradually discover that meaningful systems and places exist beyond what is initially visible.

Avoid filling every area with decorative content merely because there is available screen space.

Use negative space deliberately.

However, the final game should not remain a static black screen with a small object. The environment must progressively become richer through interaction, discovery, events, particles, lighting, entities, realm transitions, and systemic reactions.

---

# 9. Environmental interaction

Fire should behave like a force within a system.

Potential interactions include:

- wood burns;
- oil spreads fire;
- smoke affects visibility;
- glass melts or changes;
- metal heats;
- ice reacts;
- water suppresses or transforms fire;
- wind changes flame behavior;
- plants respond;
- creatures flee, attack, investigate, or exploit fire;
- structures can be altered;
- hidden objects can be revealed through heat;
- unusual materials can produce unexpected effects.

These are examples of system direction, not automatic canon. Implement only what fits the actual game design and data.

The goal is **emergence**: multiple simple rules combining into surprising outcomes.

---

# 10. The world should remember

Player actions should eventually have persistent or semi-persistent consequences where appropriate.

A location should not always feel like an untouched resettable room.

Possible consequences:

- burned areas;
- ash;
- regrowth;
- displaced creatures;
- opened or destroyed paths;
- altered resources;
- changed NPC reactions;
- new discoveries;
- environmental scars;
- new opportunities created by destruction.

The exact persistence model must be deterministic and saveable.

---

# 11. Emergent humor

The game should be funny without becoming a comedy game all the time.

Humor should often emerge from systems rather than only from scripted jokes.

Examples of the desired flavor:

- absurd creatures;
- unexpected physics;
- ridiculous consequences;
- a clever interaction producing an unintended result;
- serious systems occasionally behaving in amusing ways;
- deadpan system feedback;
- discoveries that are funny because the player caused them.

Do not fill every screen with jokes.

The tone should be capable of moving between:

**funny → curious → beautiful → tense → dangerous → absurd → emotional**

without losing identity.

---

# 12. Failure should produce information or entertainment

Failure should not always be:

> YOU DIED → RETRY

A failed experiment can reveal a mechanic.

A bad choice can create a different path.

A catastrophic action can produce an entertaining world state.

The player should often think:

> "Well... that went badly. What happens now?"

rather than immediately feeling that their time was wasted.

---

# 13. Discovery as a mechanic

Not everything should be presented as a menu instruction.

Players should be able to discover:

- interactions;
- combinations;
- hidden areas;
- creatures;
- environmental behavior;
- evolution paths;
- secrets;
- alternate solutions;
- rare events;
- unexpected system interactions.

Discovery should sometimes be recorded as part of the player's history.

---

# 14. Progression architecture

Progression should have multiple layers rather than a single XP number.

Potential layers:

### Flame Level
Simple overall progression.

### Foundation / Tier
Major evolutionary state.

### Skills
Specific capabilities.

### Traits
Behavioral or persistent characteristics.

### Discoveries
Things the player has learned or uncovered.

### Masteries
Areas in which the player has developed exceptional skill.

### Relationships
Future entities, factions, or characters can remember player behavior.

### World State
The world can reflect meaningful actions.

Not all of these need to be implemented immediately. The architecture should allow them to exist independently.

---

# 15. Skill tree → evolution map

The current seven-row list is acceptable as prototype/debug presentation, but the long-term design should become a visually meaningful progression structure.

Current vocabulary is strong and should be preserved where canon permits:

- Ember Reach
- Kindling Heart
- Ashborn Resilience
- Smoke Veil
- Magma Core
- Cinder Storm
- Phoenix Ember

Skill names should describe a phenomenon, capability, transformation, or state—not merely a numerical modifier.

A skill's internal effects can still be explicit and numerical.

Skills should sometimes introduce **new verbs**, not only stat increases.

Example:

`Smoke Veil`

could eventually alter visibility, enemy tracking, environmental interactions, or movement through smoke—not simply provide `+10% defense`.

The evolution map should eventually answer:

> **What has this Flame become?**

---

# 16. The Flame can develop behavioral identity

The game should be capable of tracking tendencies without requiring the player to select a traditional class at the beginning.

Possible hidden/explicit dimensions:

- force;
- control;
- stability;
- movement;
- curiosity;
- adaptation;
- range;
- environmental interaction.

These are design candidates, not fixed canon.

The principle is important:

> **Two players can begin with the same Flame and gradually create meaningfully different Flames through what they actually do.**

This creates identity through behavior rather than questionnaire selection.

---

# 17. Game modes and play styles

The architecture should eventually support multiple styles without requiring a separate game.

Potential modes:

### Sanctuary
Relaxed experimentation and growth.

### Adventure
Main progression and exploration.

### Trial
Focused skill challenges.

### Cataclysm
Extreme difficulty.

### Sandbox
Open experimentation.

### Certified Realms
Knowledge/data-driven realm gameplay.

### Endless
Procedurally or systemically evolving challenges.

These are future expansion candidates. Do not build all of them now.

---

# 18. Certified Realms

Certified Realms is established source/game data.

It must be brought into the repository as canonical source material when available and normalized into structured data with traceability.

Do not silently invent missing canon.

Certified Realms should be capable of becoming a major realm/system inside Flame Game rather than forcing the entire game to be defined only by it.

The normalized data should remain independent of rendering and AI.

---

# 19. AI role

AI can enrich the world, but AI must not be the authoritative game engine.

Correct direction:

**player → deterministic game systems → validated state → optional AI content/interaction → validated game response**

Incorrect direction:

**player → model decides everything → game state follows model output**

AI may eventually support:

- contextual dialogue;
- narrative generation;
- question generation;
- hints;
- adaptive content;
- lore;
- procedural encounter descriptions;
- character personality;
- contextual reactions.

AI output must be validated before affecting authoritative state.

Provider/model changes must not require rewriting core game logic.

---

# 20. HUD and interface philosophy

The current screenshot is the whole game prototype, so HUD decisions must be evaluated in relation to the complete experience.

The interface should feel like a **quiet instrument panel around a living thing**, not a dashboard displaying a living thing.

### Persistent HUD
Keep only high-value information.

Preferred direction:

`SPARK`
`LV 03`

rather than:

`SPARK`
`LV 3`
`Foundation: SPARK · LV 3`

The `Foundation:` label is redundant in the persistent HUD. Deeper foundation information can be exposed through interaction.

### Empty space
Negative space is intentional and should remain part of the identity.

### Settings
Avoid generic app-store/mobile switch styling. Settings should belong visually to Flame Game while remaining accessible.

### Information hierarchy

Persistent:
- current state/tier;
- level;
- essential immediate state.

Secondary:
- skills;
- progression;
- statistics.

Tertiary:
- technical information;
- settings;
- deep system data.

The interface should become sophisticated without becoming crowded.

---

# 21. Interaction-first UX

The player should learn through doing.

Avoid unnecessary control clutter.

The Flame itself should be the primary interaction surface where possible.

Movement, touch, burn, and growth should be discoverable and responsive.

The game should feel good even before it becomes content-rich.

Responsiveness is a quality feature, not polish reserved for the end.

---

# 22. Audiovisual identity

Sound should communicate state.

Potential progression:

- tiny spark: subtle crackle;
- stronger Flame: richer layered texture;
- danger: changes in sound before visual confirmation;
- discovery: distinct sonic identity;
- powerful states: deeper/larger sound field;
- quiet moments: near silence.

Music should eventually adapt to:

- exploration;
- danger;
- discovery;
- major encounters;
- world events;
- recovery.

Visual effects should similarly communicate state rather than exist only for decoration.

---

# 23. Accessibility

Accessibility should be designed into the experience.

Potential requirements:

- color-vision alternatives;
- motion reduction;
- sound alternatives;
- vibration control;
- text scaling;
- contrast options;
- reduced particle mode;
- simplified effects;
- input remapping;
- readable state communication without relying solely on color.

Accessibility should not feel like a lesser version of the game.

---

# 24. Technical architecture principles

The implementation must preserve these boundaries:

### Game state
Authoritative and deterministic.

### Rules
Explicit and testable.

### Data
Separate from rendering and logic.

### Rendering
Presentation of state, not the owner of state.

### AI
Replaceable enrichment/content provider.

### UI
A presentation/interaction layer, not the game engine.

### Persistence
Explicit save/load state with versioning where required.

### Testing
Core rules must be testable without a browser and without an AI provider.

---

# 25. Expandability

The game should be expandable through data and modular systems rather than repeated rewrites.

Future expansion may include:

- additional realms;
- additional Flame states;
- creatures;
- materials;
- environmental systems;
- skills;
- traits;
- quests/missions;
- events;
- bosses;
- procedural content;
- additional modes;
- multiplayer/shared experiences later if justified.

Multiplayer is not an initial requirement and must not distort the first architecture.

---

# 26. What NOT to build

Do not turn Flame Game into:

- a generic RPG;
- a generic idle game;
- a quiz wrapper;
- an AI chatbot with game graphics;
- a menu-heavy mobile game;
- a loot-box treadmill;
- a conventional fire mage game;
- a collection of disconnected mini-games;
- a visually impressive but mechanically shallow prototype;
- a Base44 clone.

Do not add complexity merely because the technology makes it possible.

Every system should earn its place by improving play, discovery, expression, or extensibility.

---

# 27. Prototype → final-game transformation

The current prototype is valuable because it proves the basic visual seed and some gameplay/data concepts.

It should now be treated as:

**evidence + reference + reusable material**

not as:

**the final game's ceiling**

The correct question is not:

> "How do we polish this screenshot?"

The correct question is:

> **"What is the best game that can grow from the ideas already present here while remaining faithful to the project's established direction?"**

---

# 28. Quality bar

Every major feature should eventually be evaluated against five questions:

1. **Is it fun?**
2. **Does it feel distinctly Flame Game?**
3. **Does it create meaningful interaction or discovery?**
4. **Does it remain understandable at the surface while allowing depth underneath?**
5. **Does it strengthen the long-term architecture rather than create future debt?**

If a feature fails several of these, reconsider it.

---

# 29. Development philosophy

Build from the smallest functioning version toward the largest possible expression.

Do not attempt to build the AAA-scale vision immediately.

Instead:

**small system → test → make it feel good → connect systems → test emergence → expand content → polish → scale**

The game should become deeper because its systems connect, not merely because more buttons and content are added.

---

# 30. Final north-star statement

> **Flame Game is a living systemic game centered on a Flame that the player moves, touches, burns with, learns through, and grows. It begins almost impossibly simple and can expand toward an enormous world of discovery, consequence, evolution, humor, challenge, and mastery—without losing the simplicity that made the original Flame compelling.**

The goal is not maximum complexity.

The goal is **maximum possibility from a minimal core**.
