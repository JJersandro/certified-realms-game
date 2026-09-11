export const GROWTH = {
  baseFlameSize: 9,
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
