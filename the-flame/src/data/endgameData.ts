// Phase 11: once every fuel instance ever spawned into the world has been
// burned, the world is "consumed" -- the player is awarded points and the
// next world regenerates tougher. Both numbers below are explicit project-
// owner decisions, not inferred: a flat 10% jump on the very first clear,
// then a random 8%-25% compounding jump on every clear after that.
export const ENDGAME = {
  firstEscalationMultiplier: 1.10,
  escalationRandomRange: [0.08, 0.25] as [number, number],
  pointsBase: 5
} as const;
