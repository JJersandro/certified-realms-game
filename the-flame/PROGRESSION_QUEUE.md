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

## Decisions log (answered 2026-09-14, project owner's own words)

1. **Economy needs no new currency.** "No not needed or create a equivalent for this game." --
   no Coins/Souls-equivalent gets built. The Flame's existing energy/XP and skill points already
   cover this domain; Economy is not new work.
2. **Ascension is a separate, full reset, for a separate currency and a separate tree.** "A
   seperate full reset for the unique points. For the unique skills. And not the regular skills
   which you get by farming xp in game." -- Ascension resets the player's *temporary* progress
   (level, energy, flameSize -- back to a fresh spark) and awards a new currency (Ascension
   Points) spent on a new, second "unique skills" tree. The existing skill tree and its points
   (earned via the burn trickle + world-clear bonus, i.e. "farming XP") are **not** touched by
   an Ascension reset -- they persist exactly as they are today. World-clear's own escalation
   loop (`worldStrength`, `ENDGAME`) also stays as-is, untouched and separate from Ascension.
3. **Transcendence: "Mix it up."** Direction given, not a full spec -- Transcendence should
   combine multiple different kinds of rule-changing effects (per the concept's own varied
   examples) rather than committing to one single mechanic. The *exact* set of effects is still
   open; the next architect run touching item 17 should propose a concrete mixed set for the
   owner to pick from, not invent and implement one unilaterally.

## How the 7 domains map onto The Flame

- **Foundation** -- already substantially shipped: the XP/energy curve, 77 levels/7 tiers,
  `SCALE`'s speed/reach capability gates. Items 1-2 just make that framing explicit.
- **Combat -> "Burning style."** Berserker/Hunter/Critical/Executioner/Swarm map onto active/
  aggressive play, tier-specific bonuses, chance-based bonus burns, weakened-fuel bonuses, and
  cascade-scaling rewards -- all real existing levers. See items 6-10.
- **Economy -- resolved, no new work** (decision 1 above).
- **Mastery -> counters on things the player actually does**, not currency totals: burns-per-
  tier, cascades triggered, worlds cleared, risky ignitions survived, distance traveled. See
  items 3, 11-13.
- **Ascension -- resolved** (decision 2 above): a deliberate full reset, a new currency, a new
  second tree, the existing skill tree/points untouched. See items 14-16.
- **Transcendence -- directionally resolved, specifics still open** (decision 3 above). See
  item 17.
- **7-Core -- not queued yet.** Requires every other domain existing first in some real form.

---

## Queue

- [ ] **1. Foundation summary HUD line.** Add a small, unobtrusive HUD readout (new line under
      `UIScene`'s existing top-right stage/level block, or folded into it) showing the player's
      current tier name + level, framed as "Foundation" progress rather than just a bare number
      -- the smallest possible first step, pure presentation, no new state or currency.
- [ ] **2. `PROGRESSION_DOMAINS` doc constant.** A single `src/data/progressionDomainsData.ts`
      file naming the 7 domains and one sentence each on what they mean *in this game*
      specifically (not the generic concept language) -- a single source of truth every later
      item and every future agent run references. Data-only, no gameplay behavior change.
- [ ] **3. Mastery counters (tracking only, no rewards yet).** Add a small, plain state object
      (parallel to how `SkillTreeManager` is a narrow, constructor-independent class) tracking:
      burns-per-tier (7 counters), total cascades triggered, total risky ignitions survived,
      total worlds cleared, cumulative world-space distance traveled. No UI, no currency, no
      thresholds yet -- just correct incrementing, verified via unit tests (Vitest, following
      the pattern in `src/systems/__tests__/SkillTreeManager.test.ts`) plus one real playtest
      confirming the counters increment during actual play.
- [ ] **4. Mastery Points + first threshold reward.** Once item 3's counters exist: pick the
      single easiest, most legible counter (likely burns-per-tier) and award a small, flat
      Mastery Point the first time a threshold is crossed (e.g. "50 kindling burns"). One
      counter, one threshold, one reward to start -- not all counters/thresholds at once.
- [ ] **5. "Burning style" is the real name for the Combat domain -- rename before building
      anything.** Update `PROGRESSION_DOMAINS` (item 2) once this is confirmed; purely a naming/
      framing item, should land before items 6-9.
- [ ] **6. Aggressive-play bonus ("Berserker" analog).** A small, capped bonus (to burn speed or
      heat generation, reusing existing `heat`/`GROWTH` levers) that scales with the flame's
      current velocity. OPEN DECISION: which existing stat it modifies, and the magnitude --
      implement the mechanism first with a conservative constant, real balance pass later.
- [ ] **7. Tier-specific bonus choice ("Hunter" analog).** Let the player designate one matter
      tier as a focus (small new state, not a currency) for a bonus (XP yield or contact radius
      against that tier). OPEN DECISION: how the focus is chosen in-game (automatic? a UI
      picker? tied to a Mastery threshold?).
- [ ] **8. Bonus-chance burn ("Critical" analog).** A small, flat chance per ignition for a burn
      to yield a bonus (extra XP, or an instant-finish) -- reuses `ignite()`/`finishBurn()` in
      `MatterRegistry.ts`; needs its own `flame-visual-designer` feedback pass once real.
- [ ] **9. Cascade-scaling reward ("Swarm" analog).** A bonus (XP or Mastery-counter progress)
      scaling with how many fuel instances a single cascade chain ignited, read off
      `tryCascade()`'s existing recursion -- the cleanest one-to-one mapping in this queue.
- [ ] **10. Mobility Mastery.** Distance-traveled counter (item 3) crossing thresholds awards
      Mastery Points, same pattern as item 4 but for the mobility counter.
- [ ] **11. Risk Mastery.** Risky-ignitions-survived / worlds-cleared-without-shrinking-below-a-
      stability-threshold counters reward Mastery Points for engaging with the risk system
      skillfully, not just avoiding it.
- [ ] **12. Mastery-gated specialization nodes.** Once items 4/10/11 produce real Mastery Points
      across at least two counters: add the first Mastery-only nodes (spent from Mastery Points,
      not skill points). OPEN DECISION: a new UI panel or extend the existing skill-tree list,
      and whether these grant flat percentages or something qualitatively different.
- [ ] **13. Ascension: reset + new currency.** Add `ascensionPoints` (new resource) and a
      manual, player-triggered Ascension action (gated behind a minimum level so ascending
      immediately gives nothing) that resets `level`/`energy`/`flameSize` back to their starting
      values and awards Ascension Points based on how far the run got. Explicitly does **not**
      touch `SkillTreeManager`'s `points`/`purchased` -- those persist through the reset, per
      decision 2. OPEN DECISION (small, numeric): the exact points-awarded formula -- implement
      with a conservative constant, real balance pass later, same pattern as item 6.
- [ ] **14. Ascension: the "unique skills" tree.** A second, separate skill panel (distinct UI
      from the existing `SKILL TREE` button/list) spent from `ascensionPoints`, starting with
      exactly one node to prove the mechanism end-to-end (new UI panel, new purchase flow, new
      resource wired through) before adding more. Per the concept's own "not just bigger
      numbers" principle and decision 2's framing ("unique skills," as opposed to the regular
      tree's flat percentage bonuses): this first node should unlock a real new capability or
      qualitatively different effect, not another flat `+X%`. OPEN DECISION: what that first
      unique capability actually is -- propose 2-3 concrete options rather than picking one.
- [ ] **15. Ascension persistence regression test.** A Vitest test (and one real playtest)
      proving an Ascension reset leaves `SkillTreeManager.points`/`purchased` completely
      unchanged while `level`/`energy`/`flameSize` return to their starting values -- this is
      the one thing decision 2 was explicit and firm about, so it gets its own explicit
      verification rather than being assumed correct because item 13 "should" have done it
      right.
- [ ] **16. Ascension HUD.** A visible `ascensionPoints` readout and an explicit "Ascend" action
      in the UI (button + likely a confirmation step, since it's a deliberate reset the player
      should not trigger by accident) -- last of the Ascension items, once 13-15 are real and
      verified.
- [ ] **17. Transcendence: propose a mixed set of rule-changing effects.** Per decision 3
      ("mix it up"): this run's job is to propose 2-4 concrete, varied rule-changing effects
      (not stat boosts) that fit The Flame's actual mechanics -- e.g. something touching
      cascades, something touching world-generation/regeneration, something touching how
      Ascension or Mastery themselves behave -- for the owner to pick from or combine. Do not
      implement any of them in this run; this is a proposal-only item, same discipline as the
      original queue-building run.

## Not yet queued

**7-Core** -- depends on every domain above existing first in some real form. Revisit once
items 1-16 are substantially built and item 17 has picked concrete effects to implement.
