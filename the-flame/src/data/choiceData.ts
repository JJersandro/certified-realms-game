// Phase 8's meaningful choice: matter you're not yet leveled enough to
// ignite can still be forced -- hold contact on it and it lights anyway,
// for a bonus XP yield, at a heat/stability cost. No menu, no prompt --
// the choice is made by staying in contact instead of moving on, same
// "touch = commitment" language the rest of the game already speaks.
export const CHOICES = {
  riskyIgnition: {
    holdMs: 900,
    xpBonusMultiplier: 1.5,
    heatPenalty: 0.3,
    stabilityPenalty: 0.2
  }
} as const;
