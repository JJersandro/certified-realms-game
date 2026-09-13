# The Flame -- progression concept implementation queue

Derived from `PROGRESSION_CONCEPT.md` by translating its generic RPG language (combat, enemies,
bosses) into The Flame's actual mechanics (burning, igniting, cascading, growing, heat/
stability, tiers, world-clears -- there is no combat and no enemies in this game). Implemented
by `flame-progression-architect`, strictly one item at a time, in order. Check an item off
(`- [x]`) when it's built and verified; never implement more than one unchecked item in a
single run.

**Open design decisions are marked `OPEN DECISION` inline.** These are not implemented until
the project owner answers them -- an agent run that reaches one stops and reports it rather than
guessing. Small implementation details (a constant's name, which existing file it lives in) are
not flagged; only choices that change what the system *is* are.

## How the 7 domains map onto The Flame (read this before touching any item below)

- **Foundation** -- already substantially shipped: the XP/energy curve, 77 levels/7 tiers,
  `SCALE`'s speed/reach capability gates. This domain isn't new work so much as a framing --
  items 1-2 below just make that framing explicit and add the one piece that's genuinely
  missing (a Foundation-tier HUD/summary), rather than building a parallel system.
- **Combat -> "Burning style."** The Flame's only "combat" is choosing what and how to burn.
  The concept's archetypes (Berserker/Hunter/Critical/Executioner/Swarm) map onto real existing
  levers: active/aggressive play (velocity, risky forced ignition), tier-specific bonuses
  (matter tiers are the closest thing this game has to "enemy types"), a chance-based bonus
  burn ("critical"), bonuses against already-weakened fuel (mid-burn HP), and cascade-scaling
  rewards (Swarm maps directly onto the existing cascade mechanic). See items 6-10.
- **Economy -- genuinely the least clear mapping, flagged heavily below (item 4).** The Flame
  already has two currencies (energy/XP, skill points). Whether it needs a third
  ("Coins"-equivalent) with no obvious sink yet, or whether "Souls" should just *be* the new
  Mastery/Ascension currency rather than a fourth thing, is an open decision, not assumed.
- **Mastery -> counters on things the player actually does**, not currency totals. This maps
  cleanly and needs no new currency-design risk -- burns-per-tier, cascades triggered, worlds
  cleared, risky ignitions survived are all already-tracked or trivially trackable state. See
  items 3, 11-13. "Mobility Mastery" maps directly onto this game's actual world/travel system.
- **Ascension -- the biggest open decision in this whole queue (item 14).** World-clear already
  exists as a soft escalation (tougher world, `worldStrength` up) but does *not* reset the
  player's level -- it's escalation, not rebirth. Whether "true" Ascension means a deliberate
  full reset back to level 1 in exchange for a new permanent currency/unlocks (as the concept
  describes), layered on top of the existing world-clear loop, or whether world-clear itself
  should become that moment, is not decided here.
- **Transcendence -- deliberately last and least specified (item 15).** "Changes the rules, not
  just the numbers" cannot be responsibly translated without the project owner's input on what
  rule-changes even fit this specific game. Flagged as a placeholder, not attempted.
- **7-Core -- not queued at all yet.** It requires mastery across every other domain existing
  first; revisit once items 1-15 (or whatever they've evolved into) are substantially real.

---

## Queue

- [ ] **1. Foundation summary HUD line.** Add a small, unobtrusive HUD readout (new line under
      `UIScene`'s existing top-right stage/level block, or folded into it) showing the player's
      current tier name + level, framed as "Foundation" progress rather than just a bare number
      -- the smallest possible first step, pure presentation, no new state or currency. Verifies
      the domain-framing idea costs nothing to introduce visually before any real system work
      starts.
- [ ] **2. `PROGRESSION_DOMAINS` doc constant.** A single `src/data/progressionDomainsData.ts`
      file naming the 7 domains and one sentence each on what they mean *in this game*
      specifically (not the generic concept language) -- a single source of truth every later
      item and every future agent run references, so "what does Mastery mean here" isn't
      re-derived from `PROGRESSION_CONCEPT.md` from scratch each time. Data-only, no gameplay
      behavior change.
- [ ] **3. Mastery counters (tracking only, no rewards yet).** Add a small, plain state object
      (parallel to how `SkillTreeManager` is a narrow, constructor-independent class) tracking:
      burns-per-tier (7 counters), total cascades triggered, total risky ignitions survived,
      total worlds cleared, cumulative world-space distance traveled. No UI, no currency, no
      thresholds yet -- just correct incrementing, verified via unit tests (Vitest, following
      the pattern in `src/systems/__tests__/SkillTreeManager.test.ts`) plus one real playtest
      confirming the counters increment during actual play. This is the foundation every later
      Mastery item reads from.
- [ ] **4. OPEN DECISION -- does Economy need a new currency, and if so what does it buy?**
      The concept wants Coins (frequent/basic) and Souls (deeper, from "combat") as distinct
      from Slayer/Ascension Points. The Flame already has energy/XP (frequent, drives
      growth) and skill points (spent on the tree). Before any new currency is built: does a
      third currency add real distinct value here, or would it just be XP/skill-points renamed?
      If yes, what does it actually purchase that nothing else does? Not implemented until
      answered.
- [ ] **5. Mastery Points + first threshold reward.** Once item 3's counters exist and item 4
      is answered (Mastery Points are new currency #3 either way -- the concept is explicit
      that Mastery is its own resource, separate from Economy's currencies): pick the single
      easiest, most legible counter (likely burns-per-tier) and award a small, flat Mastery
      Point the first time a threshold is crossed (e.g. "50 kindling burns"). Deliberately one
      counter, one threshold, one reward to start -- not all counters/thresholds at once.
- [ ] **6. "Burning style" is the real name for the Combat domain -- rename before building
      anything.** Update `PROGRESSION_DOMAINS` (item 2) once this is confirmed; purely a naming/
      framing item, no gameplay change, but should land before items 7-10 so they're not built
      under a name that doesn't fit.
- [ ] **7. Aggressive-play bonus ("Berserker" analog).** A small, capped bonus (to burn speed
      or heat generation, reusing the existing `heat`/`GROWTH` levers rather than inventing a
      new stat) that scales with the flame's current velocity -- rewards active, fast play the
      same way the concept's Berserker rewards active engagement. OPEN DECISION: which existing
      stat it modifies, and the magnitude, need a real balance pass (flame-balance-tuner
      territory once this lands) -- implement the mechanism first with a conservative constant,
      don't hand-tune blind.
- [ ] **8. Tier-specific bonus choice ("Hunter" analog).** Let the player designate one matter
      tier as a focus (a new, small piece of state -- not a currency) for a bonus (XP yield or
      contact radius specifically against that tier). OPEN DECISION: how this focus is chosen
      in-game (automatic based on recent burns? a UI picker? tied to a Mastery threshold from
      item 5?) -- flag rather than assume a UI that hasn't been discussed.
- [ ] **9. Bonus-chance burn ("Critical" analog).** A small, flat chance per ignition for a burn
      to yield a bonus (extra XP, or an instant-finish skipping the normal burn duration) --
      reuses the existing `ignite()`/`finishBurn()` choke points in `MatterRegistry.ts`, and
      should get a `flame-visual-designer` pass for its own distinct feedback (not reusing
      `playBurnCompleteFlourish` unchanged) once the mechanic itself is real.
- [ ] **10. Cascade-scaling reward ("Swarm" analog).** A bonus (XP or Mastery-counter progress)
      that scales with how many fuel instances a single cascade chain ignited, read directly off
      `tryCascade()`'s existing recursion in `MatterRegistry.ts` -- the cleanest, most direct
      one-to-one mapping in this whole queue, since cascades already are this game's "many
      enemies at once" moment.
- [ ] **11. Mobility Mastery.** Distance-traveled counter (item 3) crossing thresholds awards
      Mastery Points, same pattern as item 5 but for the mobility counter specifically -- maps
      directly onto this game's actual world/camera-follow travel, no translation ambiguity.
- [ ] **12. Risk Mastery.** Risky-ignitions-survived and worlds-cleared-without-shrinking-below-
      a-stability-threshold counters (extending item 3) reward Mastery Points for engaging with
      the existing heat/stability risk system skillfully, not just avoiding it.
- [ ] **13. Mastery-gated specialization nodes.** Once items 5/11/12 produce real Mastery Points
      across at least two counters, add the first Mastery-only nodes (spent from Mastery Points,
      not skill points) -- OPEN DECISION: whether these live in a new UI panel or extend the
      existing skill-tree list, and whether they grant the same *kind* of bonus (flat
      percentages) or something qualitatively different, per the concept's own "not just bigger
      numbers" principle.
- [ ] **14. OPEN DECISION -- what Ascension actually is here.** Does it mean a deliberate,
      player-initiated full reset (level back to 1, matter/world state cleared) in exchange for
      a new permanent currency and permanent unlocks, layered on top of the existing world-clear
      escalation loop? Or does an existing world-clear become that moment instead of a separate
      new one? This changes core session shape and must be answered before any Ascension code
      exists -- not attempted in this queue beyond naming it.
- [ ] **15. OPEN DECISION -- Transcendence's actual rule-changes for this specific game.** The
      concept's examples (events chaining, enemies evolving) don't map onto The Flame as
      written. Needs real design input on what "the rules change, not just the numbers" means
      for a burning/growing/cascading game before this is anything more than a name.

## Not yet queued

**7-Core** -- depends on every domain above existing first in some real form. Revisit once
items 1-13 are substantially built and 14/15 have real answers, not before.
