// PROGRESSION_QUEUE.md item 4: the single easiest, most legible counter
// (burns-per-tier) gets the first threshold reward -- one counter, one
// threshold, one reward to start, not all counters/thresholds at once.
// Kindling (MATTER[0], tier id 1) has the lowest minLevelToIgnite of any
// tier, so it's reachable and burned repeatedly from level 1 onward,
// making "N kindling burns" the most legible early milestone to build
// this pattern against. Later items (10, 11) add their own counters'
// thresholds/rewards here as they're built -- this file, not a new one
// per item, per the existing "one named as const object per concern"
// convention (this concern being "Mastery Points earn conditions").
export const MASTERY = {
  kindlingBurnThreshold: 50,
  kindlingBurnReward: 1,

  // Item 10 (Mobility Mastery): distanceTraveled crossing each of these
  // (world pixels, ascending) awards distanceReward once. Escalating
  // rather than evenly spaced because top speed grows ~6x over a run
  // ((90 + flameSize*8) * tier speedMultiplier: ~218 px/s at the start,
  // ~1,300 px/s at max size and tier), so each milestone stays a similar
  // amount of play time apart. Measured: a flat-out early-game sweep covers
  // ~17,400 px/min, so the first lands after ~1.5 minutes of fast movement
  // -- sooner than item 4's 50-kindling milestone (~4.5 minutes in the same
  // sweep, at ~11 kindling burns/min), which is fine for the one thing every
  // player does from the first second. Conservative starting constants,
  // real balance pass later.
  distanceThresholds: [25000, 100000, 250000],
  distanceReward: 1
} as const;
