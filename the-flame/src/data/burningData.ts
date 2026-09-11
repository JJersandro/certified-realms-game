export const BURNING = {
  contactRadiusMultiplier: 1,
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
