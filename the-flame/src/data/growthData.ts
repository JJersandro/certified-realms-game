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
  maxStability: 1
} as const;
