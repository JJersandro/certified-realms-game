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
  }
} as const;
