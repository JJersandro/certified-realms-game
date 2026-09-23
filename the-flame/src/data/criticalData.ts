// PROGRESSION_QUEUE.md item 8 ("Critical" analog): every ignition has a
// flat chance to be critical, and a critical burn finishes on the next
// frame instead of draining over seconds -- normal XP, just instant
// (project owner decision: instant-finish over bonus XP, a felt effect
// rather than another number, unlike items 6 and 7).
//
// ~1 in 12 ignitions: frequent enough to notice within a minute of play,
// rare enough to stay a moment rather than the norm. Rolled on every
// ignition path (direct contact, risky hold, cascade link), so a cascade
// can pop several at once. A critical burn skips its burn-time heat
// (GROWTH.heatRisePerBurnSecond) but keeps finishBurn()'s flat heat, so
// crits run the flame very slightly cooler. Conservative starting
// constant, real balance pass later.
export const CRITICAL = {
  chance: 0.08
} as const;
