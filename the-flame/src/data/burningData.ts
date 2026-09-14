export const BURNING = {
  // Was 1 -- a natural-movement playtest (no dwelling on a known fuel
  // pixel, just realistic sweeping) went 18+ seconds with zero ignitions.
  // A more generous global reach fixes that without touching per-tier
  // scale bonuses (scaleData.ts), which stack on top of this.
  contactRadiusMultiplier: 1.6,
  // Fuel never spawns within this distance of the flame's position at
  // spawn time -- was 120, which combined with the sparse per-region
  // density below meant a fresh flame often had nothing reachable nearby.
  safeZoneRadius: 70,
  burnPulse: {
    frequency: 0.03,
    scale: 0.12,
    alpha: 0.18
  },
  emberBurst: {
    min: 4,
    max: 24
  },
  scorch: {
    alpha: 0.22,
    radiusMultiplier: 1.25,
    fadeMs: 9000
  },
  // Movement/spread feedback slice (owner build plan, 2026-09-14): a flame
  // running hot spreads fire more readily -- max fractional bonus added to
  // MatterRegistry.tryCascade()'s chance formula at heat===GROWTH.maxHeat,
  // still capped at 1 there same as every other cascadeChance contributor.
  // A real, if small, feedback loop: more cascading -> more heat (via
  // addHeat on every ignite) -> more cascading -- but the existing
  // RISK.overheatThreshold shrink already brakes runaway heat regardless of
  // source, so this doesn't need its own separate cap beyond the shared one.
  // Conservative starting constant, real balance pass later.
  heatCascadeBonus: 0.15
} as const;
