// Heat/stability stop being purely cosmetic here: past these thresholds,
// the flame actively shrinks (draining the same `energy` value that drives
// growth, via FlameScene.update()) instead of only looking more volatile.
export const RISK = {
  overheatThreshold: 0.85,   // fraction of GROWTH.maxHeat
  fragileThreshold: 0.35,    // stability at/below this counts as fragile
  shrinkPerSecond: 0.8       // flameSize lost per second while either holds
} as const;
