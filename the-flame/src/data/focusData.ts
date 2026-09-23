// PROGRESSION_QUEUE.md item 7 ("Hunter" analog): the matter tier the flame
// has burned most among its last recentBurnWindow burns
// (MasteryTracker.focusedTierId()) gets a small multiplicative bonus to
// both XP yield and contact radius against that tier. Automatic, no picker
// -- project owner decision.
//
// Recent window, not all-time: an all-time leader locks onto kindling for
// the whole game (highest spawnWeight, ignitable from level 1, and the
// bonus itself makes it easier still to burn), and kindling has the lowest
// xpFactor, so the bonus would land where it's worth least. 20 is large
// enough that one stray burn doesn't flip the focus, small enough that
// deliberately hunting a tier for about a dozen burns does. A single large
// kindling cascade can flush the whole window at once -- expected dynamics,
// something for the balance pass to watch, not a bug.
//
// Two effects at once, so each sits below item 6's single-stat 0.15-0.18
// precedent. Contact radius is lower still: catchable area grows with r^2
// (1.06^2 =~ 1.12x) and it already stacks with three other radius
// multipliers at its call site. Conservative starting constants, real
// balance pass later.
export const FOCUS = {
  recentBurnWindow: 20,
  xpYieldBonus: 0.10,
  contactRadiusBonus: 0.06
} as const;
