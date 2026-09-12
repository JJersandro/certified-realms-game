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
- [ ] Real wall-clock time-to-level-2/tier-up measured via natural (real pointer-driven,
      non-forced) play, port 5221, 2026-09-12 -- **left open, tuning likely warranted**.
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
- [ ] Not yet checked: whether ignite/burn reactions could use the same layered-feedback
      treatment level-up/tier-up now have (currently ignite is one particle burst + one audio
      ping, and `finishBurn()` adds a scorch mark on top of the same single-burst-plus-tone
      shape -- see `flame-visual-designer.md`'s "known thin spots" for the fuller reasoning).

## [mobile-perf]

_(empty -- see flame-mobile-perf-auditor.md's own "what to actually check" list for known
starting points; it hasn't been run against the current shipped state yet)_

## [playtest]

_(empty -- flame-playtest-verifier runs per-change rather than periodically, so items here are
things it noticed but weren't the specific behavior it was verifying)_
