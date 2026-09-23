# The Flame -- development backlog

Shared queue for the agent team (`.claude/agents/flame-*.md`). Every agent reads its own
section before starting a run and appends anything it finds but doesn't fix before finishing.
This is not the roadmap (`README.md`'s 15 phases) -- it's the ongoing process backlog for
balance, visuals, mobile performance, and playtest findings on top of the shipped game.

Format per item: `- [ ] <one line summary> (found by <agent>, <date>) -- <file/formula/detail>`.
Check an item off (`- [x]`) rather than deleting it when it's resolved, so the history of what
was found and fixed stays visible.

## [balance]

- [x] `hasSize` gate in `tryLevelUp()` (`main.ts`) confirmed dead weight (dry-run,
      2026-09-12) and **resolved** (real pass, 2026-09-12, flame-balance-tuner) by picking
      option (b): removed the redundant `hasSize` check from `tryLevelUp()`, keeping
      `energy >= xpForLevel(nextLevel)` as the sole forward gate. Decision, not just a
      cleanup: `minFlameSizeForLevel` is still real code, not dead -- `tryLevelDown()`
      (unchanged) is its one remaining consumer, and it does genuine independent work there
      (demoting a level on risk-driven shrink, and doing so *sooner* than an XP-equivalent
      check would, since the size curve's per-level minimum is gentler than the XP curve's).
      Steepening the curve instead (option a) was rejected for now because the curve is
      shared between the two directions -- steepening it to make it bind on the way up would
      also make demotion trigger on much less shrinkage on the way down, a second, coupled
      side effect that needs its own product call rather than being absorbed silently into
      this fix. Re-verified via the same binary-search technique used to find the bug
      (`window.__game` + Playwright, port 5221): after the change, the minimum energy that
      flips `tryLevelUp()` to levels 2/5/11/22/39/56/77 matches `xpForLevel()` exactly (57,
      224, 730, 2064, 4872≈4871, 8381, 13514≈13513, rounding-boundary only), zero console
      errors. Separately confirmed `tryLevelDown()` still demotes correctly on a direct
      `flameSize` cut (level 5 -> 1 when `flameSize` set to 10, `energy` left untouched) --
      proving the size curve's remaining consumer is unaffected. `tsc --noEmit` and
      `vite build` both clean. Comments in `progressionData.ts` and around
      `tryLevelUp()`/`tryLevelDown()` in `main.ts` updated to describe the real
      XP-forward/size-backward shape instead of the old (never-true) "coupled forward
      progress" claim.
- [x] Real wall-clock time-to-level-2/tier-up measured via natural (real pointer-driven,
      non-forced) play, port 5221, 2026-09-12 -- **skill-point pacing half resolved (real
      pass, 2026-09-12, flame-balance-tuner); the level/tier-up timing half stays open, see
      below.**
      Two trials, both real contact/burn, no state mutation of energy/level/flameSize:
      - Trial A (steered toward the literal nearest alive fuel, ignoring tier gating --
        a plausible "chase whatever's closest" novice path): first contact took 146.9s of
        pure travel time and landed on a level-gated tier-3 "timber" fuel; forcing it via
        the risky-ignition hold (`CHOICES.riskyIgnition`, 900ms) dumped 528 XP in one shot
        (base 352 xp * 1.5 bonus), jumping level 1 -> 8 in a single event, then heat/risk
        shrink immediately started eating the surplus energy back down. No tier-up (level
        12) inside the ~170s budget.
      - Trial B (steered toward the nearest *ignitable* fuel -- the tier-appropriate,
        "normal" path, avoiding the forced-hold detour): first burn and level-2 both hit at
        t=87.3s (~1.5 min) from a single tier-2 "brush" fuel yielding 89.6 XP (one burn
        already clears the 57 XP level-2 threshold). By t=163.5s (~2.7 min) the session had
        burned 5 fuels total and reached level 4 (energy ~201-209). No tier-up.
      - Both trials: this rolled world had 263 total fuel instances. Trial B's steady-state
        rate (5 burns / ~163s) extrapolates to roughly 260+ minutes of continuous,
        perfectly-targeted play to burn every instance in one world -- i.e. a full world
        clear (the skill tree's *only* point source) is not reachable in a single short
        session under any realistic play pattern measured here, let alone the ~2-3 minute
        window this item asked about. **In a realistic ~2-3 minute session: 0 world clears,
        0 skill points, level 2-4 reached (not tier-1's cap at level 11), and reaching that
        first level is dominated by travel time across the 4000x3000 world/fuel density, not
        by the XP curve's shape** -- consistent with the XP-curve sanity anchors in this
        file's own header (2-3 burns is right for the *count*; the actual time bottleneck is
        finding/reaching those burns, exactly as `flame-balance-tuner.md`'s guidance warned
        might be the case). Open decision for a future run: this is a session-pacing problem,
        not a `xpForLevel`-curve problem -- fixing it means either shrinking `WORLD`'s size/
        fuel-spread, adding a smaller non-full-clear skill-point trickle, or accepting
        multi-session (not multi-minute) cadence as the intended feel for the skill tree.
        Flagging rather than picking a number here since it's the same shape of open call as
        the `hasSize` item above.
      - **Resolved for the skill-point half of this item (2026-09-12, flame-balance-tuner)**,
        per explicit user direction ("just like Idle Slayer"): picked the third option this
        item flagged -- added a small non-full-clear skill-point trickle -- rather than
        shrinking `WORLD` or accepting multi-session cadence. Idle Slayer's actual model
        (souls drip from every kill, not from a rare ascension-only event; ascension is a
        bigger, less-frequent multiplier layered on top, not the only income source) maps
        onto The Flame as: `SKILL_TREE_TRICKLE.pointsPerBurn = 1` (new constant,
        `skillTreeData.ts`), awarded via a new `SkillTreeManager.awardBurnTrickle()` called
        from `onFuelBurned` in `main.ts` (parallel to how XP itself accrues per burn), on top
        of -- not replacing -- `checkWorldConsumed()`'s existing full-clear bonus, which stays
        the bigger, rarer escalation-tier reward. Sized off this item's own Trial B baseline
        (5 burns / ~163s): 1 point/burn puts a player at 5 points by that point, enough for
        exactly one purchase (cheapest node costs 3) without affording the whole tree (36
        total). Also had to flip `SkillTreeManager.unlocked` to trigger on *either* source's
        first positive award, not only a world clear (previously the only path) -- gating the
        ability to *spend* trickle points behind the same rare event the trickle exists to
        route around would have silently defeated the point of adding it; this was a necessary
        consequence of the requested change, not a separate unilateral design call. Verified
        via real (non-forced) play, port 5231: two independent real trials both showed the
        first burn (~37-38s in) immediately earning 1 point and unlocking the tree, and the
        first affordable-purchase threshold (3 points) landing at ~75-89s -- comfortably inside
        the ~2-3 minute window that previously produced 0 points. `tsc --noEmit`/`vite build`
        clean, zero console errors across both trials.
        **Surfaced two pre-existing, unrelated bugs while verifying the real click-purchase
        flow this trickle is meant to enable** (both in `UIScene.ts`, both fixed in the same
        pass since they blocked verifying the very feature being added, not a new design
        choice): (1) `makeTappable()`'s hit area was rebuilt on every text change in theory,
        but Phaser's `InputPlugin.enable()` only calls `setHitArea()` the *first* time an
        object becomes interactive -- every later `setInteractive()` call on an already-
        interactive object silently no-ops the geometry update. Every skill-tree line is
        created with empty text, so its real hit box was frozen forever at a near-zero-width
        box from creation, nowhere near where its actual text later rendered -- confirmed via
        `scene.input.hitTestPointer()` returning zero hits at a line's own `getBounds()`
        center. Fixed by writing `obj.input.hitArea` directly when `obj.input` already exists.
        (2) Once hit areas were correct, the skill-tree list's 7 lines (18px apart) and
        settings list's 2 lines (20px apart) were too tightly packed for the existing
        `TAP_PAD_Y = 16` -- adjacent padded hit boxes overlapped by ~26px, so a real click
        aimed at "Ember Reach" bought "Kindling Heart" instead. Fixed with a separate, smaller
        `LIST_TAP_PAD_Y = 2` (sized to the tightest real gap between rows) applied to every
        object in either stacked list, leaving the standalone TILT/SOUND buttons at the
        original padding. Both fixes verified: real clicks on all 7 skill-tree lines each now
        purchase the exact node clicked (individually confirmed, not just the first one), and
        both settings toggles (colorblind/reduced motion) still flip correctly. The underlying
        "list rows are tighter than the ~44px mobile-tap-target guidance this same file already
        flagged" shortfall is not fixed by shrinking padding further (that's what caused the
        overlap) -- widening the lists' own row pitch is a layout change, flagged below under
        `[visual]`/`[mobile-perf]` for a dedicated pass rather than done here.
      - **Still open**: the level/tier-up wall-clock timing itself (Trial A/B's finding that
        travel time, not the XP curve, dominates early pacing) is untouched by this fix and
        remains a live open decision -- shrinking `WORLD`'s size/fuel-spread is still on the
        table for whoever picks this up next.
- [x] `UIScene.ts`'s skill-tree list (7 lines, 18px row pitch) and settings list (2 lines, 20px
      pitch) now have *correct, non-overlapping* tap targets (see the resolved item above) but
      each target is still only as tall as the 12px text plus a 2px pad on each side (~16px) --
      well under the ~44px minimum mobile-tap guidance this file's own `TAP_PAD_Y` comment
      already calls out as a shortfall for standalone buttons, and now more so for these two
      lists specifically, since padding couldn't be the fix here (found by flame-balance-tuner,
      2026-09-12). **Resolved (real pass, 2026-09-13, flame-mobile-perf-auditor)**: row pitch
      widened from 18/20px to a shared `LIST_ROW_PITCH = 32` with `LIST_TAP_PAD_Y = 8` (29px
      padded target, ~1.7x the old ~17px), landed by a prior interrupted run and verified real
      here rather than re-implemented. Verified via Playwright, port 5260, phone-emulated
      viewports (`hasTouch: true`, mobile UA, deviceScaleFactor 2-3): (1) portrait 390x844 --
      clicking 4 non-adjacent skill-tree rows (indices 0, 2, 4, 6) each purchased exactly its own
      node (`ember-reach`, `ashborn-resilience`, `magma-core`, `phoenix-ember`, in that order,
      confirmed both via `skillTree.purchased` set diffs after each click and a screenshot
      showing exactly those 4 lines turn green/"(owned)"), with zero cross-purchase and the flame
      confirmed not steering (`flame.x/y` unchanged) -- no regression from the pitch/pad change.
      (2) HUD-collision check at three short landscape phone viewports (667x375, 844x390,
      640x360) with *both* the skill-tree list and settings list open simultaneously: a full
      pairwise bounding-box overlap check across every visible HUD element (title/subtitle,
      stage/level, TILT/SOUND/SKILL TREE buttons, all 7 skill-tree lines, SETTINGS button, both
      settings lines) found zero collisions at any of the three sizes; screenshots confirm this
      visually. (3) The row-pitch comment's own claimed "~7px margin to spare on a 360px-tall
      viewport" is measurably more conservative than reality: real measurement of the topmost
      skill-tree row's clearance above the top-HUD row was 48px at 640x360 and 78px at 844x390,
      and even an extreme 568x320 (iPhone SE 1st-gen landscape, well below the comment's own
      "360-375px" floor) still cleared by 28px with no collision -- the conclusion (no collision,
      real fix) holds, the comment's specific number is just an underestimate from the original
      run's own math rather than a re-measurement; left as-is rather than edited since it's not
      wrong in effect and this file's job is verification, not comment copyediting. `tsc --noEmit`
      and `vite build` both clean throughout.
- [ ] Cascade chains were nearly nonexistent; reach raised 3.5 -> 7.5 as a first step, density
      still the real lever (found by flame-progression-architect, 2026-09-23) --
      `matterData.ts` `cascadeRadiusMultiplier`, `worldData.ts` spawn.
      - Measured for PROGRESSION_QUEUE.md item 9 on real spawned worlds, read-only on game
        state. For each fuel as a source, neighbors within `r × M` give a chain-start
        probability of `1 − (1 − cascadeChance)^k`.
      - First run, 5 worlds:
        - level 1: 1.06% / 1.76% / 2.26% / 3.15% / 4.34% at M = 3.5 / 4.5 / 5.5 / 6.5 / 7.5
        - level 40: 2.53% / 4.03% / 5.75% / 8.00% / 10.86% at the same M values
      - Deciding run, 10 worlds, level 40: 1.76% at 3.5, 6.63% at 6.5, 8.72% at 7.5.
      - The pre-set rule ("lowest M with a level-40 rate ≥ 8%") picked 7.5. Expected branching
        per chain link stays around 0.1, so chains can't snowball.
      - Still open:
        - Uniform spawning (about 90 fuels per 2000×1500 region) means reach alone gives only
          about 4% of ignitions a chain at low levels.
        - Clustering spawns, or per-tier reach (dry kindling spreading further than ore), would
          make cascades a real mechanic.
        - Item 9's chain XP bonus (`swarmData.ts`) scales directly with how often this fires.
- [ ] Sustained fast play keeps heat above `RISK.overheatThreshold` about 90% of the time (found
      by flame-progression-architect, 2026-09-23) -- `growthData.ts` heat gain/decay,
      `MatterRegistry.ignite()` / burn heat.
      - A scripted 60-second max-speed lawnmower sweep (4 worlds each) spent 90.49% of frames
        at heat ≥ 0.85 with cascade reach 3.5, and 90.67% with 7.5. So the cascade change
        didn't cause it.
      - Cause: about 80 ignitions per minute, each adding 0.08 heat, plus
        `heatRisePerBurnSecond` 0.42/s for every burning fuel, plus item 6's movement heat, all
        against a 0.16/s decay.
      - The flame ends the minute around level 1–3, so the overheat shrink is likely eating
        progress during aggressive play. Needs a real flame-balance-tuner pass on heat sources
        vs. decay; not changed here.

## [visual]

- [x] Level-up had zero visual reaction (only `audio.playLevelUp()` + HUD text) -- fixed
      2026-09-12: added `FlameScene.playLevelUpFlourish()` (`main.ts`), a brief scale-pop
      tween on the flame body + core plus a matching glow-intensity spike, respecting
      `reducedMotion`. Verified via before/during/after screenshots of a forced level-up
      (energy set directly, `tryLevelUp()` called) -- the flame visibly swells and its glow
      halo brightens at the moment LV ticks 1->2, not just the HUD number.
- [x] Tier-up (only 7 per 77-level game) previously looked identical to an ordinary level-up
      that happened to cross it -- fixed 2026-09-12: added `FlameScene.playTierUpFlourish()`
      (`main.ts`), called in addition to `playLevelUpFlourish()` from `tryLevelUp()` whenever
      `PROGRESSION.tierForLevel(this.level) > PROGRESSION.tierForLevel(before)`. Distinct from
      the level-up flourish in both magnitude and shape, not just a scaled-up copy: a
      longer/stronger scale-pop (220ms/+0.4 vs 90ms/+0.22), a longer glow-outer-strength spike
      (420ms/+5 vs 180ms/+2.5), a 10-particle burst, and a new expanding ring rendered in the
      *new* tier's `formForLevel().base` color (a preview flash of the color family being
      evolved into) -- the ring is a genuinely different shape (radial expansion, not a body
      scale-pop), tracks the flame's position every tween frame, and respects `reducedMotion`
      by damping its final radius the same way every other amplitude effect in this file does.
      Verified via a forced level 10->11 (same-tier, `tierForLevel` stays 1) vs forced 11->12
      (`tierForLevel` 1->2) using `window.__game` + direct `tryLevelUp()` calls with all fuel
      frozen (`alive = false`) to stop organic burns from interfering -- screenshots at the
      same ~60ms/~200ms points into each tween show only a modest body pop for the plain
      level-up, versus a clearly larger expanding ring plus bigger pop for the tier-up.
- [x] Verified 2026-09-12: `lobeVariance`/`tipJitter` (`flameVisualData.ts`) were present but
      under-applied, not fully inert -- confirmed by screenshot, not just code reading. Root
      cause: ribbon ellipses are drawn at depth 5, the main flame body circle at depth 6 (drawn
      on top) with alpha ~0.84-0.97 (near-opaque), and the ribbon ellipse's half-height (the
      old `1.7-2.05` factor, half of that after `lobeScale`) sat right at or under the flame
      body's own radius (`flameSize`) -- so most of each ribbon's area, and at low `lobeScale`/
      rest state (heat=0, speed=0, `stretch=1`) sometimes *all* of it, rendered fully hidden
      underneath the opaque flame circle regardless of how much lobeVariance/tipJitter perturbed
      its shape. A screenshot of the flame at rest (level 1, `baseFlameSize`) showed a plain
      solid-looking red-orange disc with no visible ribbon break in the silhouette -- a direct
      `avoidSolidCircleAppearance` violation, and `preferLayeredTransparency`/jaggedness reduced
      to invisible. Fixed by raising the ribbon height multiplier so its half-height reliably
      clears the flame body's radius even at lobeVariance's minimum `lobeScale` (0.7): the
      create-time ellipse factor `1.7 + (i%2)*0.35` -> `3.4 + (i%2)*0.4` (`createFlameBody()`),
      and the matching per-frame `setSize()` factor `1.45 + ribbon.height*0.15` -> `3.2 +
      ribbon.height*0.3` (`updateFlameVisual()`), both in `main.ts`. Re-screenshotted after the
      change: at rest, the flame now shows clear thin ribbon tips poking past the disc edge in
      multiple directions (no longer a closed circle outline); mid-play (higher heat/size), the
      ribbons read as a distinctly jagged, asymmetric multi-lobed star/cross radiating unevenly
      around the core body, matching the photographic-fire-study reference's "no two flame
      lobes share the same size or shape" language. No further action needed on this item.
- [x] Ignite/burn layered-feedback item -- **resolved (real pass, 2026-09-13,
      flame-visual-designer)**: deliberately split the two events rather than treating them the
      same. **Ignite left untouched on purpose**: it's the single most frequent event in the
      game, and a cascade chain (`tryCascade()` in `MatterRegistry.ts`) can call `ignite()` many
      times in one frame/tick -- a per-ignite flame-body reaction would pile into overlapping,
      jittery tweens during exactly the moments already the most visually busy, so it keeps its
      existing single burst+ping. **`finishBurn()`** ("this fuel is actually gone, XP awarded")
      got the new reaction instead: a cascade's several `finishBurn()` calls land staggered
      across each fuel's own independent burn-duration timer (duration scales with `fuel.r`),
      not stacked in one frame, so it doesn't have ignite's pile-up problem. Implementation
      (reuses `playLevelUpFlourish()`'s tween/glow shape rather than inventing a third visual
      language): added `MatterHost.onBurnComplete(intensity: number)` to the type
      (`MatterRegistry.ts`), called from `finishBurn()` with
      `intensity = Phaser.Math.Clamp(fuel.r / maxFuelRadius, 0, 1)` (`maxFuelRadius` = embercore's
      `radiusMax`, the largest any tier ever spawns, so intensity is a stable 0..1 scale across
      every tier); wired in `main.ts`'s `MatterHost` object literal to a new
      `FlameScene.playBurnCompleteFlourish(intensity)` -- a scale-pop tween on `this.flame`/
      `this.core` (`pop = 1 + (0.04 + intensity*0.10) * motionScale`, `duration = 70 +
      intensity*40`) plus a matching `flameGlow.outerStrength` spike
      (`(0.4 + intensity*1.6) * motionScale`, reset after `duration+20`ms), both damped by
      `reducedMotion` the same way every other amplitude effect in this file already is. Sized
      so common small kindling/brush burns (most of the game's volume, `r` 3-10) get a
      barely-there flourish and rare large embercore burns (`r` up to 24) get a clearly visible
      one, smaller than a level-up's own pop (peak scale 1.14 vs level-up's 1.22) so the
      hierarchy of "burn < level-up < tier-up" stays readable. Verified via `window.__game` +
      Playwright (temporary debug hook, reverted before finishing, port 5261): synthetic
      `registry.finishBurn()` calls at `r=3` (kindling min) and `r=24` (embercore max) produced
      exactly the predicted numeric peaks (flame/core `scaleX` 1.0525 and 1.14, `flameGlow.
      outerStrength` spikes 0.6 and 2.0) with zero console errors; a third run with
      `reducedMotion = true` on the `r=24` case produced exactly `1.063`/`0.9` (the same formulas
      times `ACCESSIBILITY.reducedMotionScale` = 0.45), confirming the damping path. Screenshots
      at the same flame position/zoom show the small-burn case as visually near-identical to
      baseline (correct -- it's supposed to be near-invisible for the game's most common burn
      size) and the large-burn case as a clearly brighter, larger yellow-white bloom halo around
      the flame body, distinct from and smaller than the tier-up ring. `tsc --noEmit`/
      `vite build` both clean.

## [mobile-perf]

- [x] Full priority-ordered audit run against the current shipped state (2026-09-13,
      flame-mobile-perf-auditor, port 5260). Summary of findings, one fixed, the rest confirmed
      healthy or flagged:
      1. **Frame budget / instance counts -- doc was stale, now updated.** `worldData.ts`'s
         `baseFuelCount` was bumped ~50% per-region since this file's own "roughly 150-250 alive"
         estimate (a `[balance]` change, not tracked here at the time) -- current regions are 90/
         95/80/65 base (not 45-65) at density ranges 0.7-1.0/0.8-1.1/0.6-0.9/0.5-0.8 (not one
         flat 0.5-1.1 range), giving a real total range of ~220-320, not ~150-250. Measured
         directly across several sessions: 231, 257, 262, 271, 274, 276, 278, 290, all inside that
         range. `flame-mobile-perf-auditor.md` updated with the corrected formula/range. Per-fuel
         `updateAll()` cost itself is unchanged in shape and still fine at this size on a modern
         phone GPU/CPU -- no per-frame stutter observed at ~290 fuel across any of this session's
         runs. Camera-distance culling is still not implemented and remains a real, concrete
         lever if instance counts grow further -- flagging again per this file's own standing
         guidance, not re-litigating it.
      2. **Cascading-ignition O(n²) shape confirmed present, currently benign.** `MatterRegistry.
         tryCascade()` still does a full linear scan of `this.fuels` per ignition and recurses,
         the exact shape flagged as a risk before it shipped. Stress-tested directly (not just
         read): forcing `Math.random` to always succeed every cascade roll and picking the fuel
         with the largest `cascadeRadiusMultiplier` at max level (worst case for chance/gating)
         still only touched ~230 fuel in a single linear pass with zero recursion, because real
         spawn density (~290 fuel spread across a 4000x3000 world, average ~200px+ apart) keeps
         actual cascade radii (tens to ~100px) well under typical inter-fuel spacing -- the
         world's own sparseness is what currently bounds this, not the algorithm. Even a fully
         pathological theoretical case (every fuel within radius of every other, full O(n²) chain
         at n≈300) would be ~90,000 cheap `Distance.Between` calls, sub-10ms by extrapolation from
         this session's other benchmarks -- a single-frame hitch at worst, not a sustained
         problem, and not reachable at today's density. Re-flag if regional density or world size
         changes meaningfully in a future phase.
      3. **`emitSkillTreeChanged()` per-burn cost -- real bug, found and fixed.** The skill-point
         trickle (`[balance]`, above) made this fire on every single fuel burn, not just rare
         events. Benchmarked directly (`page.evaluate`, 5000-call loops): a bare `game.events.emit`
         with a listener costs ~0.2-0.4us, but the real `emitSkillTreeChanged()` cost ~115-120us
         per call *regardless of whether the skill-tree list was open or visible on screen*.
         Root cause, isolated piece by piece: `UIScene.renderSkillTreeLines()` ran unconditionally
         on every call (even while every line was `setVisible(false)`) and called
         `Text#setColor()` on all 7 lines every time; unlike `Text#setText()` (which
         short-circuits via `if (value !== this._text)`), `TextStyle#setColor()` has no such
         guard and unconditionally calls `this.parent.updateText()` -- a full canvas re-measure/
         redraw + WebGL texture re-upload -- confirmed via isolated benchmark showing
         `line.setColor()` alone costs ~10us per call even passing the *same* color value
         repeatedly. 7 lines x ~10-15us plus incidental `setText`/`makeTappable` overhead
         accounted for the full ~115us. Not catastrophic at one burn per event (a small fraction
         of a 16.6ms frame budget), but pure waste during the overwhelming majority of play time
         the panel is closed, and it scales linearly with simultaneous burns -- a cascade landing
         20-50 `finishBurn()`s in a tight window would turn this into single-digit milliseconds of
         wasted GPU-adjacent work. **Fixed** in `UIScene.onSkillTreeChanged()`
         (`src/scenes/UIScene.ts`): `latestPoints`/`latestNodes` and the always-visible
         `skillTreeButton` label still update unconditionally every burn (its point count does
         need to redraw every burn, and `setText`'s own short-circuit keeps that cheap when it
         doesn't), but the expensive `renderSkillTreeLines()` call is now gated behind
         `if(this.listOpen)`. The explicit `renderSkillTreeLines()` call in the button's own
         open/close toggle handler is untouched, so opening the panel still immediately shows
         fresh data. Re-benchmarked after the fix: closed-list cost dropped from ~115us to ~2.5us
         per call (~46x), open-list cost is unchanged (~160us, correct -- the panel is actively
         being viewed and live-updates same as before). Re-verified the purchase-correctness
         regression (same 4-non-adjacent-row click test as the `[balance]` tap-target item above)
         still passes identically after the fix, with a screenshot confirming exactly the 4
         clicked nodes show "(owned)" in green and no others. `tsc --noEmit`/`vite build` clean.
      4. **Unbounded growth: scorches confirmed correctly capped-per-world, tween lifecycle
         confirmed healthy, no new growth risks found.** `WorldManager.regenerate()`'s
         `clearScorches()` call (a prior fix) re-verified directly across 4 simulated world clears
         in one session (burn 3 real fuel -> force-clear -> repeat): `scorches.length` returned to
         exactly 0 after every single clear, never compounding, fuel count reset to a fresh
         ~260-280 each time as expected. Separately stress-tested the new (2026-09-13,
         flame-visual-designer, see `[visual]` above) `playBurnCompleteFlourish()`'s tween
         creation, since it now runs on every burn: 60 back-to-back `finishBurn()` calls created
         the expected short-lived tweens, and the *scorch-fade* tweens (separate,
         `BURNING.scorch.fadeMs = 9000`, one per burn) were still present at the 60-count mark
         after a 15s wait -- initially looked like a leak, but was resolved as a false alarm on
         direct inspection: their `duration` was confirmed to be exactly `9000` (the scorch fade,
         not the ~70-260ms burn/level flourishes), and a longer poll (60s total, 110 game-loop
         frames) showed the count holding steady at exactly 60 while frames kept advancing --
         consistent with this environment's documented very-low-real-fps behavior under load
         (see `flame-playtest-verifier.md`'s tilt-timing note) stretching out a 9-real-second fade
         well past 60 real seconds of wall clock, not an actual accumulation bug. `SkillTreeManager`
         (`purchased` Set, capped at 7), the `'ui:skillTreeChanged'` event payload (rebuilt fresh
         from the fixed 7-entry `SKILL_TREE` every emit, not accumulated), and `UIScene` itself
         (still no `update()` loop, purely event-reactive) all confirmed as still true / no new
         risk.
      5. **Touch input: real touch-event drag confirmed working, one defensive CSS fix added.**
         Verified with a real touch gesture, not just mouse events under a touch context: used a
         CDP session's `Input.dispatchTouchEvent` (touchStart/touchMove x15/touchEnd) on a
         390x844 mobile-UA/hasTouch/dsf-3 context -- the flame's target and position updated
         correctly following the drag, `window.scrollX/scrollY` stayed 0 throughout, and
         `visualViewport.scale` stayed 1 (no accidental page-scroll or pinch-zoom), confirming
         Phaser's default `inputTouchCapture` (calls `preventDefault()` on canvas-targeted touch
         events by default, confirmed by reading `phaser.esm.js`'s `TouchManager.startListeners`)
         is doing its job. **Added one defensive fix anyway**: `index.html` had no `touch-action`
         CSS at all on `html,body,#game` or the canvas -- JS-level `preventDefault()` on
         `touchmove`/`touchstart` is the primary defense Phaser already provides, but is a known
         weak spot specifically for Safari/iOS pinch-zoom, which is partly driven by separate
         `gesturestart`/`gesturechange` events outside the standard touch-event pipeline that a
         `touchmove` handler's `preventDefault()` does not reliably suppress in every iOS version
         -- `touch-action: none` is the standard belt-and-suspenders fix and this headless-
         Chromium environment cannot exercise the Safari-specific gesture-event path to prove or
         disprove the gap directly, so it's added defensively rather than left as an unverified
         risk. Added `touch-action:none` to `html,body,#game{...}` and `#game canvas{...}` in
         `index.html`. Re-ran the CDP touch-drag test after the change to confirm it doesn't
         regress normal touch steering -- identical result, flame still follows the drag
         correctly, zero console errors. Safe-area insets (notch/home-indicator) were not an
         issue to fix: `index.html`'s viewport meta has no `viewport-fit=cover`, so per spec the
         layout viewport already excludes the unsafe area by default (`viewport-fit: auto`
         behaves as `contain`) -- HUD elements at fixed pixel offsets are not at risk of being
         drawn under a notch precisely because this game never opted into full-bleed safe-area
         coverage. Legibility at phone DPI confirmed via screenshots at 2-3x device scale factor
         across all viewports tested above -- 11-12px canvas text stayed crisp and readable.
      6. **Bundle size: grown in absolute terms, but confirmed still ~100% attributable to
         Phaser itself, not app code -- and a real, flaggable optimization exists.** Current
         `vite build` output is a single 1,246.73 kB chunk (343.24 kB gzip), still over the
         500kB warning threshold this file's item 4 already described (that item's own "500kB+"
         phrasing was about crossing Vite's warning threshold, not the exact size -- the absolute
         number has grown since whenever that line was written, tracking Phaser's own version).
         Confirmed via direct comparison that this is still ~entirely Phaser: `phaser.min.js` in
         `node_modules` alone is ~1.2MB, matching the build output almost exactly, while this
         game's own source is ~2500 lines across 20 files -- negligible post-minification.
         **New, concrete finding**: this game uses zero Phaser physics (`Arcade`/`Matter`) despite
         `MatterRegistry`/`Fuel` naming that suggests otherwise -- those are this project's own
         plain TypeScript classes, confirmed via `grep` finding no `Phaser.Physics`/
         `scene.physics`/`Phaser.Physics.Matter` references anywhere in `src/`. The default
         `import Phaser from 'phaser'` bundles the full engine including both unused physics
         systems. `phaser-arcade-physics.min.js` (Matter excluded) is only ~1.1MB, ~100KB smaller
         -- not a dramatic win on its own, and there is no off-the-shelf Phaser distribution that
         excludes *both* engines while keeping the renderer/input/tween/FX systems this game does
         use. A build that strips both would need a custom Phaser build (webpack `DefinePlugin`-
         style exclusion flags per Phaser's own build docs) or a bundler alias/exclude
         configuration -- real engineering effort, not a one-line swap, and changes what future
         phases can assume is available (e.g. if a later phase ever wants real physics). Flagging
         as a design/build-tooling call for whoever owns bundle size next, not implemented here.
      7. **Battery/thermal: `AudioContext` suspend/resume on `visibilitychange` re-confirmed
         working**, dispatching synthetic `hidden`/visible `visibilitychange` events and reading
         `audio['context'].state`: `running` -> `suspended` -> `running` exactly as documented.
         `renderer.type` confirmed `2` (WEBGL) in this environment, and all three Phase-14 postFX
         pipelines (`flameGlow`/`coreGlow`/`haloBloom`) confirmed still attached via
         `gameObject.postPipelines.length > 0`. No changes needed here; both already correct.
      8. **A concurrent-edit note, not a code finding**: mid-session, a separate
         flame-visual-designer run landed the `[visual]` burn-complete-flourish item (above) in
         this same working tree while this audit was in progress -- `main.ts` briefly had its own
         temporary `window.__game` debug hook mid-session (not mine, cleaned up by that run before
         this one needed to add its own differently-named `window.__auditGame` hook for this
         session's verification, itself reverted before finishing). Mentioned here only because
         it explains why `git diff` briefly showed more churn in `main.ts`/`MatterRegistry.ts`
         than this session's own changes account for -- both runs' diffs are legitimate, the
         `[visual]` one is documented under that section above, and the two did not conflict.
         `playBurnCompleteFlourish()`'s own per-call cost was benchmarked as part of this pass
         (item 4 above, and directly: ~33us/call including its two tween creations and a
         `delayedCall` schedule) and confirmed cheap even at burst rates -- no action needed
         there, noted for completeness since it lands in the same "per-burn cost" category this
         audit was specifically asked to check.

## [playtest]

_(empty -- flame-playtest-verifier runs per-change rather than periodically, so items here are
things it noticed but weren't the specific behavior it was verifying)_
