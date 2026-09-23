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

- [x] **1. Foundation summary HUD line.** Done 2026-09-14. Added `UIScene.foundationLine`, a
      third line under the existing top-right stage/level block (`src/scenes/UIScene.ts`),
      reading `Foundation: <TIER NAME> · LV <n>` (e.g. "Foundation: SPARK · LV 1") -- reframes
      the two values already shown above it (stageLabel/levelLabel) as "Foundation" domain
      progress. Pure presentation: no new state, currency, or event -- it's driven by the same
      existing `ui:levelChanged` payload (`level`, `stageName`) the two lines above it already
      consume, updated in the same `onLevelChanged` handler. Deliberately reused every existing
      HUD convention rather than introducing anything new, per VISION.md's open
      positioning/color question: same font (Inter, 11px), same color (`#ffb347`, matching
      stageLabel/levelLabel), same right-aligned x, and the same 21px line pitch already used
      twice in this HUD (title->subtitle, stage->level) -- so the new line sits at y=64,
      one more step of that existing pitch, at a slightly dimmer alpha (.4, continuing the .65/
      .5 fade of the two lines above it) than either. No new colors or positioning scheme
      introduced. Verified: `npx tsc --noEmit`, `npx vite build`, `npm test` (24 tests, 3 files,
      all pass, unchanged) all clean; plus a real headless run (Playwright/Chromium against a
      `vite preview` build, phone viewport 390x844) confirming the line actually renders with
      the right text/font/color/position and updates live when `ui:levelChanged` fires with a
      new level/stage (screenshot-checked, no console errors) -- verified via a temporary
      `window.__game` debug hook in `main.ts`, reverted immediately after (see git diff: only
      `UIScene.ts` is changed).
- [x] **2. `PROGRESSION_DOMAINS` doc constant.** Done 2026-09-14. Added
      `src/data/progressionDomainsData.ts` -- a `ProgressionDomain` type (`name`,
      `description`) and a 7-entry `PROGRESSION_DOMAINS` array (Foundation, Burning Style,
      Economy, Mastery, Ascension, Transcendence, 7-Core), each with one sentence of what it
      means in this game specifically, no generic combat/enemy/boss language. Follows
      `skillTreeData.ts`'s flat `{name, description}`-array shape (closest existing
      precedent), not `scaleData.ts`'s nested-object shape, since this is itself the whole
      export rather than a property of a larger config. No `id` field -- nothing references
      entries individually yet, so array order alone carries the concept doc's own ordering.
      Named "Burning Style" (not "Combat") from the start: item 2's own "not the generic
      concept language" instruction directly rules out writing "Combat," and this file's own
      "How the 7 domains map onto The Flame" section already treats Combat -> Burning Style as
      settled framing (never marked `OPEN DECISION`), not something item 5 was meant to newly
      decide -- item 5 below is corrected accordingly rather than left to go stale, per this
      file's own "fix a later item's plan when an earlier implementation surfaces it no longer
      makes sense" convention. Pure data, no imports elsewhere yet, no gameplay behavior
      change. Verified: `npx tsc --noEmit`, `npx vite build`, `npm test` (24 tests, 3 files,
      unchanged) all clean. No new test file: unlike `matterData.test.ts`/
      `progressionData.test.ts`, there's no cross-row numeric/ordering invariant here to check
      -- 7 independent name/sentence pairs. Manually confirmed via
      `grep -inE "combat|enemy|enemies|boss|damage|loot"` that none of those terms appear in
      the new file.
- [x] **3. Mastery counters (tracking only, no rewards yet).** Done 2026-09-14. Added
      `src/systems/MasteryTracker.ts` -- a narrow, constructor-independent class (same shape as
      `SkillTreeManager`) tracking `burnsPerTier` (one slot per `MATTER` tier, length derived
      from `MATTER.length` rather than hardcoded), `cascadesTriggered`, `riskyIgnitionsSurvived`,
      `worldsCleared`, and `distanceTraveled` (cumulative scalar path length, not displacement).
      Wired via `MatterRegistry`'s existing `MatterHost` notify-callback pattern: three new
      callbacks (`onMasteryBurn`, `onCascadeTriggered`, `onRiskyIgnitionSurvived`) added to
      `MatterHost` and called from `finishBurn()`/`updateFuel()` at the exact points those things
      become true; `tryCascade()` now returns whether its own call caught at least one further
      fuel (counted once per chain-initiating ignition, not once per fuel caught or per
      recursive continuation) so `updateFuel()`'s two call sites can report it correctly.
      `worldsCleared` (a new, separate Mastery-domain counter from `FlameScene.worldsCleared`,
      which drives `ENDGAME`'s own unrelated escalation formula) increments in
      `checkWorldConsumed()`. `distanceTraveled` accumulates from the flame's own real per-frame
      movement delta in `update()`, post-position-clamp. No UI, no currency, no thresholds yet
      (items 4/10/11). Note: this item's implementation was interrupted mid-run by a session
      rate-limit (not a logic error -- resumed cleanly, no code needed redoing) and finished in
      a follow-up pass.
      Verified: `tsc --noEmit`, `vite build`, `npm test` (37 tests, 4 files -- 13 new in
      `MasteryTracker.test.ts`, covering initial-zero state, independent per-tier accumulation,
      out-of-range tier-id no-op safety, and cross-counter independence) all clean. Plus a real
      headless Playwright playtest (`vite preview` + a temporary `window.__game` debug hook,
      fully reverted after -- confirmed via `grep` finding zero remaining references) driving
      every counter through its actual production code path rather than calling `record*()`
      directly: a real contact-ignite-finishBurn cycle incremented the correct `burnsPerTier`
      slot; a real `tryCascade()` call (with `Math.random` temporarily forced to guarantee the
      probabilistic roll succeeds, the same technique `flame-mobile-perf-auditor` used
      previously for this exact function per `BACKLOG.md`) incremented `cascadesTriggered`; 120
      real `updateAll()` frame-ticks holding contact with an under-leveled fuel crossed
      `CHOICES.riskyIgnition.holdMs` and incremented `riskyIgnitionsSurvived` via the real forced-
      ignition path; real pointer-driven movement across several frames incremented
      `distanceTraveled`; and a real `checkWorldConsumed()` call (after killing all fuel)
      incremented `worldsCleared`. Zero console/page errors throughout.
- [x] **4. Mastery Points + first threshold reward.** Done 2026-09-15. Added
      `src/data/masteryData.ts` (`MASTERY.kindlingBurnThreshold = 50`,
      `MASTERY.kindlingBurnReward = 1`) and `MasteryTracker.masteryPoints`
      (plain count, not a currency object -- spending it is items 10/11/12's
      own later work). `recordBurn()` checks `burnsPerTier[0] ===
      kindlingBurnThreshold` (kindling: lowest `minLevelToIgnite` of any
      tier, so it's the most legible early milestone) right after
      incrementing -- equality, not `>=`, so it fires exactly once the
      instant the threshold is crossed ("the first time," not "every N"),
      with no separate already-awarded flag needed. One counter, one
      threshold, one reward, per this item's own scope -- items 10/11/12
      untouched. No UI: matches item 3's own "no UI yet" precedent, and
      keeps clear of the HUD positioning/color work VISION.md says is still
      waiting on the project owner's screenshot feedback.
      Verified: `tsc --noEmit`, `vite build`, `npm run lint`, and the Vitest
      suite (40 tests, 4 files -- 3 new, covering exactly-once-at-threshold,
      no double-award past it, and no cross-tier false-positive) all clean.
      Plus a real headless Playwright pass driving the actual production
      path (`MatterRegistry.finishBurn()` -> `MatterHost.onMasteryBurn` ->
      `recordBurn()`, not `recordBurn()` called directly): 0 points at 49
      burns, exactly 1 at the 50th, still 1 at the 51st. Zero console
      errors.
- [x] **5. Confirm "Burning Style" as the Combat domain's final name.** Done 2026-09-21.
      Verified both halves of this checkpoint directly rather than assuming them: (1)
      `src/data/progressionDomainsData.ts`'s `PROGRESSION_DOMAINS` entry uses `name: 'Burning
      Style'` -- the only other "Combat" occurrences in the file are the explanatory-comment
      lines correctly citing it as the deprecated generic term item 2 chose not to ship, not a
      stray naming leak. (2) Items 6-9's titles and bodies (Berserker/Hunter/Critical/Swarm
      analogs) all frame themselves under "Burning Style" consistently; none reference
      "Combat." A repo-wide grep for "Combat" across `the-flame/**/*.ts` and `*.md` (excluding
      `PROGRESSION_CONCEPT.md`, the source concept doc that's supposed to keep the original
      generic term verbatim, and this file's own item 2/5 explanatory prose) returned zero
      hits. Pure verification, no code changes -- this was a confirmation checkpoint, not a
      rename operation, per the correction logged above.
- [x] **6. Aggressive-play bonus ("Berserker" analog).** Done 2026-09-21. OPEN DECISION resolved
      by the project owner: **heat generation**, not burn speed. Sustained fast movement now
      generates heat on its own, independent of active burning -- added
      `GROWTH.aggressiveHeatGainPerSecond = 0.18` (`src/data/growthData.ts`) and, in
      `FlameScene.update()` (`src/main.ts`), `speedRatio = velocity.length() / maxSpeed` (already
      in [0,1] since velocity is clamped to `maxSpeed` earlier in the same method) scales the
      gain, applied before the existing `heatDecayPerSecond` drain runs. Picked deliberately just
      above `heatDecayPerSecond` (0.16) so sustained top-speed movement only barely outpaces
      natural decay -- net +0.02/s at full speed, not an instant max-heat button -- and a real
      loop results: aggression -> heat -> faster movement + more cascade spread (existing
      `heatSpeedBonus`/`heatCascadeBonus` levers) -> more heat, still braked by the existing
      `RISK.overheatThreshold` shrink regardless of source. Landed after the heat/stability ->
      movement feedback slice (state -> velocity) per this item's own note below, so it builds on
      that system rather than two mutually-unaware edits to the same formulas.
      Verified: `tsc --noEmit`, `npm run lint`, `vite build` (1,140.19 kB / gzip 309.89 kB,
      unchanged -- no new deps), and the Vitest suite (40/40, unchanged) all clean. Plus a real
      headless Playwright pass via a temporary `window.__game` debug hook (fully reverted before
      committing, confirmed via `grep -n "__game"` returning no matches): idle/stationary flame
      held heat at exactly 0 across 300 frames; sustained organic max-speed movement (a moving
      target re-set every frame, not a teleport) produced strictly monotonic heat gain sampled at
      `[0.00032, 0.01632, 0.03232, 0.04832, 0.06432, 0.08032]` over 300 more frames, reaching
      `0.096` after ~4.8s -- matching the predicted net rate exactly (`0.096 / 4.8 ≈ 0.02 =
      0.18 - 0.16`). Heat stayed within `[0, GROWTH.maxHeat]` throughout, zero console errors.
- [x] **7. Tier-specific bonus choice ("Hunter" analog).** Done 2026-09-23. Three decisions from
      the project owner: (1) the focus is **automatic** (no UI picker, no threshold gating, so the
      VISION.md HUD freeze is untouched); (2) it boosts **both** XP yield and contact radius, each
      at a smaller magnitude; (3) it is derived from a **recent window**, not all-time totals. An
      all-time "most burned tier" would lock onto kindling for the whole game (highest
      spawnWeight, ignitable from level 1, and the bonus makes it easier still), and kindling has
      the lowest xpFactor, so the bonus would do almost nothing. This was raised before building,
      not discovered after.
      Built:
      - New `src/data/focusData.ts`: `FOCUS = { recentBurnWindow: 20, xpYieldBonus: 0.10,
        contactRadiusBonus: 0.06 }`. Both bonuses sit under item 6's single-stat precedent. Radius
        is lower because catchable area grows with r² (1.06² ≈ 1.12×).
      - `MasteryTracker.recentBurnTiers`: a rolling buffer of the last 20 burned tier ids, which is
        the "small new state" this item anticipated. It is filled by the existing `recordBurn()`,
        so there is no new wiring.
      - `MasteryTracker.focusedTierId()`: returns the plurality tier in that buffer, with ties going
        to the lowest id, or `null` before the first burn. It is recomputed on every call.
      - Threaded through `getFlame()` as `FlameSnapshot.focusedTierId`. It is gated per fuel at
        both consumption sites in `MatterRegistry`: `finishBurn` (XP) and `updateFuel` (contact
        radius), as an extra multiplicative factor on the existing formulas.
      - The boosted contact radius also widens the focused tier's awareness-trembling window. That
        is intended, so don't "fix" it.
      - `tryCascade` is untouched (that's item 9).
      - Balance-pass note: one large kindling cascade can flush the whole 20-burn window at once.
      Verified: `tsc --noEmit`, `npm run lint`, `vite build` (1,140.75 kB / gzip 310.07 kB, +0.56
      kB, no new deps) and Vitest (47/47, 7 new) all clean. The 7 new tests cover null before the
      first burn, a plurality win, lowest-id tie-break regardless of order, window eviction
      overtaking the all-time leader, the buffer cap, and out-of-range ids.
      Plus a real headless Playwright pass via a temporary `window.__game` hook, fully reverted
      before commit (`grep -n "__game"` returns no matches):
      - Focus was `null` on a fresh scene.
      - It flipped brush → kindling → brush (`[2,1,2]`) as burns went through the real
        `finishBurn` → `onMasteryBurn` → `recordBurn` path.
      - XP gate: with brush focused, a brush burn paid exactly `68.6 × 1.10 = 75.46`, while a
        kindling burn stayed unboosted at `25`.
      - Contact gate: three same-radius fuels sat 61.9px away, between the unboosted 60.1px and
        the boosted 63.7px radius. The focused brush ignited. The other-tier kindling and a brush
        with focus forced to `null` both stayed idle. Cascades were suppressed for isolation.
      - Zero console errors.
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
      not skill points). OPEN DECISION: a new UI panel or extend the existing skill-tree list.
      The "flat percentages or something qualitatively different" half of this item's original
      open decision is now pre-answered (2026-09-14, project owner): **qualitatively different**
      -- both `PROGRESSION_CONCEPT.md`'s own golden rule ("progression moet de speler nieuwe
      keuzes geven," not just bigger numbers) and an independent external design review
      converged on the same answer, so treat it as settled rather than re-opening it when this
      item comes up. The UI-panel-vs-extend-existing-list half remains genuinely open.
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
