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
  kindlingBurnReward: 1
} as const;
