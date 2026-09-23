export const GROWTH = {
  // Was 9 -- too small to render any of the ribbon/glow/halo detail that's
  // supposed to make this read as "living fire" rather than a flat dot, and
  // the tiny radius also made the contact-radius formula (flame.size +
  // fuel.r) ungenerous from the very first second of play.
  baseFlameSize: 16,
  maxFlameSize: 72,
  sizeEnergyFactor: 0.55,
  heatRisePerBurnSecond: 0.42,
  heatDecayPerSecond: 0.16,
  maxHeat: 1,
  instabilityFromDirectionChange: 0.8,
  stabilityRecoveryPerSecond: 0.7,
  minStability: 0.25,
  maxStability: 1,
  // Movement feedback slice (owner build plan, 2026-09-14): heat/stability
  // already drive wobble/color/glow/particles every frame but never touched
  // movement itself -- these two close that loop. Conservative starting
  // constants, real balance pass later, same pattern as every other
  // "implement the mechanism first" item in this codebase.
  //
  // Max fractional speed bonus at heat===maxHeat (a hot flame is more eager
  // to close distance, mirroring what heat already does to its glow/stretch).
  heatSpeedBonus: 0.15,
  // Max steering-error angle (radians) applied at the lowest reachable
  // stability (minStability above, i.e. (1-minStability)=0.75 of this
  // value) -- a fragile flame is measurably harder to aim, not just
  // uglier. ~0.3 rad =~17 degrees at full effect.
  maxSteeringErrorRad: 0.3,

  // PROGRESSION_QUEUE.md item 6 ("Berserker" analog): sustained fast
  // movement generates heat on its own, not just active burning -- a real
  // "play aggressively, run hot" loop, since heat already raises cascade
  // spread and movement speed (this same feedback slice) while also
  // risking the overheat shrink. Deliberately picked just above
  // heatDecayPerSecond (0.16) so sustained top-speed movement can only
  // just barely out-pace natural decay -- heat builds slowly from
  // aggression alone, it isn't an instant max-heat button. Conservative
  // starting constant, real balance pass later.
  aggressiveHeatGainPerSecond: 0.18
} as const;
