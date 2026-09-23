import { PROGRESSION } from './progressionData';

export type ScaleTier = {
  name: string;
  speedMultiplier: number;
  contactRadiusMultiplier: number;
};

// One row per PROGRESSION tier (indexed tier-1) -- name, speed, and reach all
// come from the same tier now, rather than three separate systems that could
// drift out of sync. SPARK..INFERNO carry over the original 5 stage labels;
// WILDFIRE/CATACLYSM extend the same escalating-intensity naming for the two
// tiers Phase 4's 7-tier hierarchy added beyond the original 5.
export const SCALE = {
  tierCapabilities: [
    { name: 'SPARK',     speedMultiplier: 1.0,  contactRadiusMultiplier: 1.0 },
    { name: 'EMBER',     speedMultiplier: 1.15, contactRadiusMultiplier: 1.05 },
    { name: 'FLAME',     speedMultiplier: 1.3,  contactRadiusMultiplier: 1.1 },
    { name: 'BLAZE',     speedMultiplier: 1.45, contactRadiusMultiplier: 1.15 },
    { name: 'INFERNO',   speedMultiplier: 1.6,  contactRadiusMultiplier: 1.2 },
    { name: 'WILDFIRE',  speedMultiplier: 1.8,  contactRadiusMultiplier: 1.3 },
    { name: 'CATACLYSM', speedMultiplier: 2.0,  contactRadiusMultiplier: 1.4 }
  ]
} as const satisfies { tierCapabilities: readonly ScaleTier[] };

export function capabilitiesForLevel(level: number): ScaleTier {
  const tier = PROGRESSION.tierForLevel(level);
  return SCALE.tierCapabilities[tier - 1];
}
