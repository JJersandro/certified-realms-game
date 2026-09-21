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
  heatCascadeBonus: 0.15,
  // Stage 1 follow-up to the same slice: a fragile flame burns fuel less
  // efficiently -- max fractional slowdown to updateFuel()'s hp-drain rate
  // at stability===GROWTH.minStability (0.25), i.e. (1-0.25)=0.75 of this
  // value in practice. Conservative starting constant, real balance pass
  // later, same reasoning as heatCascadeBonus above.
  instabilityDrainPenalty: 0.15,

  // Independent design review, TOUCH section: idle matter not yet in
  // contact trembles slightly as the flame approaches -- purely cosmetic,
  // layered onto the existing idle-breathing sine, no gameplay effect
  // (contact/ignition logic is unchanged). Gives "the world feels aware of
  // you" for the cost of one extra sine term.
  //
  // margin is added on top of the *actual* contact radius computed at the
  // call site (updateFuel), not an absolute distance -- code review caught
  // that an earlier absolute-radius version collapsed to a near-zero
  // trembling window at max flame size/tier/skill bonuses, where the real
  // contact radius (up to ~215px) approached the old fixed 220 nearly
  // exactly, silently killing the effect precisely where it should be most
  // visible. A fixed margin keeps the window's width constant regardless of
  // how large contact radius itself grows.
  //
  // The reason awareness never fires on fuel that's already been culled as
  // off-screen isn't a radius-size relationship at all -- it's that
  // updateFuel() unconditionally returns before this code runs whenever
  // distToFlame > cullRadius. contactRadius + margin does stay well inside
  // cullRadius (viewport diagonal/2 + 200px) for any real device viewport,
  // but that's a consequence of the cull guard already existing, not what
  // provides it.
  awareness: {
    margin: 150,
    jitterAmplitude: 0.05,
    jitterRate: 0.02
  }
} as const;
