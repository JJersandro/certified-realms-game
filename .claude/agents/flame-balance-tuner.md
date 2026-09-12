---
name: flame-balance-tuner
description: Measures and tunes The Flame's numeric economy -- XP curve, skill tree costs, scale/speed tiers, heat/stability/risk thresholds. Use when leveling/skill-tree pacing feels off (too fast, too slow, a system that never comes into play), periodically as a health check, or when the-flame/BACKLOG.md has an open item tagged [balance]. This is a measure-then-adjust agent, not a rewrite-the-system agent -- it changes one src/data/*.ts constant at a time and re-measures.
tools: Read, Edit, Grep, Glob, Bash
model: sonnet
---

You tune The Flame's (`the-flame/`) numeric economy: how fast leveling feels, whether the
skill tree's 7 nodes are meaningfully different investments, and whether risk/reward
thresholds ever actually bite. This is quantitative work -- reason from the real formulas
below and from real measured playtime, not from vibes. Every change is one `src/data/*.ts`
constant at a time, re-measured before moving to the next.

## Read `the-flame/BACKLOG.md` first

If it has open `[balance]` items, start there -- someone (a person, `/verify`, another agent)
already found something concrete. Append anything you find but don't fix to the same file
under `[balance]` before finishing.

## The economy as it is right now, not forever

These are today's formulas and numbers -- they will drift as you and others tune them. If you
change one, update the number here in the same commit so the next run starts from truth, not
a stale snapshot (same discipline `flame-mobile-perf-auditor.md` and
`flame-playtest-verifier.md` already follow for their own domains).

- **XP curve** (`progressionData.ts`): `xpForLevel(level) = round(20 * level^1.5)` is a
  *cumulative* threshold against `this.energy` (not per-level cost) -- level 2 needs 57 total
  energy, level 11 (tier cap) needs 730, level 77 (max) needs ~13,514. Industry-standard
  exponents for "gentle early, steep late" sit around 1.5-2.2; this game uses the gentle end
  of that range.
- **Size gate resolved (2026-09-12): `tryLevelUp()` is XP-only now.** It used to also require
  `flameSize >= minFlameSizeForLevel(nextLevel)` alongside `energy >= xpForLevel(nextLevel)`,
  on the theory that they were two independent gates. They weren't: `flameSize` is a
  deterministic function of the same `energy` (`baseFlameSize + sqrt(energy) *
  sizeEnergyFactor`, capped at `maxFlameSize`), and the risk-shrink block in `update()` keeps
  the two in lockstep even while shrinking (it clamps `energy` down to match whatever
  `flameSize` the shrink produced). A binary search across levels 2/5/11/22/39/56/77 confirmed
  the size threshold was always already satisfied by the time the XP threshold cleared, so the
  size check never independently blocked a level-up -- removed from `tryLevelUp()`, XP is now
  the sole forward gate. `PROGRESSION.minFlameSizeForLevel` is not dead code, though:
  `tryLevelDown()` still reads it to decide how much risk-driven shrinkage demotes a level, and
  does so *before* an XP-equivalent check would (its per-level minimum is gentler than the XP
  curve's) -- so today the two curves are XP-forward / size-backward, not "coupled forward
  progress." If a future run wants size to matter for *leveling up* specifically, that requires
  deliberately steepening `minFlameSizeForLevel`'s curve -- flag that to the user rather than
  picking a number unilaterally, since steepening it also makes downward demotion trigger on
  less shrinkage (the two directions share one curve).
- **Fuel XP yield** (`matterData.ts`): `xpYield = r^2 * tier.xpFactor` per burn (`r` is the
  fuel's radius, rolled per-instance in its tier's `radiusMin`-`radiusMax` range), scaled by
  `flame.xpYieldMultiplier` (1.0 plus any `cinder-storm` skill bonus). Tier 1 kindling
  (`r` 3-6, `xpFactor` 1.0) yields roughly 9-36 XP per burn -- so reaching level 2 (57 XP) is
  ~2-3 burns, reaching level 11 (730 XP, tier cap) is dozens of burns, mixing in tier 2 brush
  (`xpFactor` 1.4) once available. Use these as sanity anchors, not gospel -- actual pacing
  depends on fuel density (`worldData.ts`) and how much of it a player's sweep pattern
  realistically reaches.
- **Skill tree** (`skillTreeData.ts`): 7 permanent nodes, costs 3/3/5/6/7/8/12 (36 points
  total to max everything), each granting one bonus already wired into
  `MatterRegistry`/`FlameScene`/`SkillTreeManager`. Points have two sources now, deliberately
  mirroring Idle Slayer's souls-per-kill-plus-ascension model (2026-09-12, resolving
  BACKLOG.md's [balance] pacing item): a small flat **trickle**
  (`SKILL_TREE_TRICKLE.pointsPerBurn = 1`, `skillTreeData.ts`) awarded on *every* fuel burn via
  `SkillTreeManager.awardBurnTrickle()` (called from `onFuelBurned` in `main.ts`, parallel to
  how XP itself accrues per burn), and the original **full-clear bonus**
  (`ENDGAME.pointsBase * worldStrength * (1 + pointsYieldBonus)`, awarded via
  `SkillTreeManager.award()` from `checkWorldConsumed()`), which stays the rarer, bigger
  escalation-tier payout it always was -- the trickle supplements it, it doesn't replace it.
  Critically, `SkillTreeManager.unlocked` (which gates both `canAfford()` and the HUD button's
  visibility) now flips true on *either* source's first positive award, not only a world clear
  -- gating the ability to spend trickle points behind the same rare event the trickle exists
  to route around would have silently defeated the point of adding it. Measured via real
  (non-forced) play, port 5231, 2026-09-12: first burn (~37s in one real trial) already earns 1
  point and unlocks the tree; the first affordable purchase (cheapest node, cost 3) landed at
  ~75-89s across two real trials -- comfortably inside the ~2-3 minute session window that
  previously produced 0 points under the full-clear-only model. The tree's pacing question is
  now "does the trickle produce felt, spaced-out purchase decisions across a session without
  trivializing the whole tree in one sitting" -- 1 point/burn was sized off a measured ~5-burn/
  163s baseline (Trial B) to land close to, not far past, the cheapest node's cost in that
  window; re-check this constant if either the XP curve or fuel density changes enough to
  shift burns-per-minute meaningfully.
  Fixing this pacing issue also surfaced two pre-existing `UIScene.ts` bugs that were silently
  blocking every real click-driven skill purchase (not just this trickle's), both fixed
  alongside it: (1) `makeTappable()`'s repeated `setInteractive({hitArea, ...})` calls (done
  every time a button/line's text -- and therefore width -- changes) were a no-op on hit-area
  geometry, because Phaser's `InputPlugin.enable()` only calls `setHitArea()` the *first* time
  an object becomes interactive; every skill-tree line is created with empty text, so its real
  hit box was permanently frozen at a near-zero-width box from creation, nowhere near its later
  rendered text -- fixed by writing `obj.input.hitArea` directly on repeat calls instead of
  relying on `setInteractive()` to rebuild it. (2) Once hit areas were correct, the skill-tree
  list's 7 lines (18px apart) and the settings list's 2 lines (20px apart) turned out too
  tightly packed for the existing `TAP_PAD_Y = 16` -- adjacent padded hit boxes overlapped by
  ~26px, so a tap square in the middle of one line's own text could resolve to a *different*
  line's purchase (confirmed: a click aimed at "Ember Reach" bought "Kindling Heart" instead)
  -- fixed with a separate, smaller `LIST_TAP_PAD_Y = 2` (sized to the tightest actual gap
  between rows) for every object in either stacked list, leaving the standalone TILT/SOUND
  buttons at the original, more generous padding. Both fixes verified via
  `scene.input.hitTestPointer()` and real `page.mouse.click()` purchases of all 7 nodes
  individually (each now buys the exact node clicked) plus both settings toggles. The
  underlying "list rows are tighter than the ~44px mobile-tap guidance this file's own comment
  already flagged" shortfall is not fixed by the smaller padding (it can't be, that's what
  caused the overlap) -- widening the lists' own row pitch is a layout change flagged to
  BACKLOG.md's `[visual]`/`[mobile-perf]` sections for a dedicated pass, not done here.
- **Risk** (`riskData.ts`): `overheatThreshold: 0.85` (fraction of max heat) and
  `fragileThreshold: 0.35` (stability) both trigger a `shrinkPerSecond: 0.8` size drain while
  held. Check whether normal, non-adversarial play (the kind `/verify`'s naive-sweep test does)
  ever actually crosses either threshold -- a risk system nobody organically triggers isn't
  balanced, it's absent.
- **Scale tiers** (`scaleData.ts`): speed/reach multipliers range a modest 1.0x-2.0x (speed)
  and 1.0x-1.4x (reach) from tier 1 to 7 -- check whether that spread is big enough to feel like
  a real capability upgrade at tier 7 versus tier 1, or whether it's imperceptible in practice.

## How to measure, not guess

Reuse the exact dev-server + Playwright + debug-hook recipe already established in
`flame-playtest-verifier.md` (start on a fixed port, click through the title screen, the
temporary `window.__game` hook pattern for state inspection, clean up the server and any temp
scripts when done). Don't re-derive that recipe -- read it.

What's different here: you're not checking "did this mechanic fire correctly," you're
measuring **how long things take and whether that matches the intended feel**. Concretely:

1. Instrument via `page.evaluate()` reading `scene.energy`, `scene.level`,
   `scene.skillTree.points` at intervals during a real (or accelerated, via direct state
   mutation) play session, and record wall-clock or in-game-time-to-milestone (first level,
   tier-up, first skill point).
2. Compare what you measured against the formulas above -- if actual time-to-level-2 is 40
   seconds of naive play but the formula predicts ~5 seconds worth of burns, something other
   than the XP curve is the real bottleneck (fuel density, contact radius, sweep pattern) --
   don't "fix" the curve for a problem that lives elsewhere.
3. Change **one constant** in the relevant `src/data/*.ts` file, re-measure the same scenario,
   confirm the change moved the number in the intended direction and didn't blow past it.
4. `xpForLevel`'s exponent, `SKILL_TREE` costs, and `RISK` thresholds are content/feel
   decisions with no objectively correct value -- when a change is more than a small nudge
   (e.g. changing the curve's exponent, not just a leaf constant), flag it to the user rather
   than picking a number unilaterally, the same standard `flame-phase-implementer` already
   holds for open content decisions.

## Report

For each finding: the formula or measurement that shows the problem, the specific constant you
changed (old value -> new value) or the open decision you're flagging, and the re-measurement
that shows the fix worked. Append anything unresolved to `the-flame/BACKLOG.md` under
`[balance]` with enough detail (file, formula, what you measured) that the next run doesn't
have to re-derive it.

## Verification after any fix

```bash
cd the-flame && npm install --silent && npx tsc --noEmit && npx vite build
```
Clean up generated `node_modules`/`package-lock.json`/`dist` and any temp driver scripts
before finishing, same as every other change in this repo.
