# The Flame -- development backlog

Shared queue for the agent team (`.claude/agents/flame-*.md`). Every agent reads its own
section before starting a run and appends anything it finds but doesn't fix before finishing.
This is not the roadmap (`README.md`'s 15 phases) -- it's the ongoing process backlog for
balance, visuals, mobile performance, and playtest findings on top of the shipped game.

Format per item: `- [ ] <one line summary> (found by <agent>, <date>) -- <file/formula/detail>`.
Check an item off (`- [x]`) rather than deleting it when it's resolved, so the history of what
was found and fixed stays visible.

## [balance]

- [ ] `hasSize` gate in `tryLevelUp()` (`main.ts`) is confirmed dead weight, not just
      suspected (dry-run, 2026-09-12) -- binary-searched the minimum energy needed to reach
      each of levels 2/5/11/22/39/56/77 via `window.__game`, and at every one of those
      thresholds the flame's size (derived from that same energy) already exceeded
      `minFlameSizeForLevel` before the XP gate cleared. So today, `energy >= xpForLevel()`
      is the *only* gate that ever actually decides a level-up; the size check never
      independently blocks anyone. This contradicts `progressionData.ts`'s own comment
      ("physical growth and XP grinding stay coupled"). Open decision, not fixed here: either
      steepen `minFlameSizeForLevel`'s curve so it sometimes binds (making size a real second
      axis), or accept XP-only and simplify/remove the now-decorative size check. Needs a
      product call, not a unilateral number change.
- [ ] Not yet measured: real wall-clock time-to-level-2/tier-2 during natural (non-forced)
      play, and whether the skill tree's 36-total-point cost across 7 nodes produces a
      meaningful number of purchase decisions per realistic session (gated on world-clears,
      which are themselves rare in a short session). Needs a real timed playthrough, not a
      forced-state probe.

## [visual]

- [x] Level-up had zero visual reaction (only `audio.playLevelUp()` + HUD text) -- fixed
      2026-09-12: added `FlameScene.playLevelUpFlourish()` (`main.ts`), a brief scale-pop
      tween on the flame body + core plus a matching glow-intensity spike, respecting
      `reducedMotion`. Verified via before/during/after screenshots of a forced level-up
      (energy set directly, `tryLevelUp()` called) -- the flame visibly swells and its glow
      halo brightens at the moment LV ticks 1->2, not just the HUD number.
- [ ] Not yet checked: whether a *tier*-up (a bigger deal than a level-up, only 7 per game)
      deserves its own distinct reaction layered on top of the level-up flourish -- currently
      they'd look identical since tier-up is just a level-up that also happens to cross a
      tier boundary. Also not yet checked: ribbon `lobeVariance`/`tipJitter` actually visibly
      breaking circular symmetry per `avoidSolidCircleAppearance`, and whether ignite/burn
      reactions could use the same layered-feedback treatment as level-up now has.

## [mobile-perf]

_(empty -- see flame-mobile-perf-auditor.md's own "what to actually check" list for known
starting points; it hasn't been run against the current shipped state yet)_

## [playtest]

_(empty -- flame-playtest-verifier runs per-change rather than periodically, so items here are
things it noticed but weren't the specific behavior it was verifying)_
