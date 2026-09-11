import { GROWTH } from './growthData';

// 7 tiers over 77 levels (11 levels per tier) -- leveling requires both enough
// accumulated XP *and* a minimum flame size for that level, so physical growth
// and XP grinding stay coupled rather than either one alone carrying progress.
const TOTAL_LEVELS = 77;
const TIER_COUNT = 7;
const LEVELS_PER_TIER = 11;

export const PROGRESSION = {
  totalLevels: TOTAL_LEVELS,
  tierCount: TIER_COUNT,
  levelsPerTier: LEVELS_PER_TIER,
  xpForLevel(level: number): number {
    return Math.round(20 * Math.pow(level, 1.5));
  },
  minFlameSizeForLevel(level: number): number {
    const span = GROWTH.maxFlameSize - GROWTH.baseFlameSize;
    return Math.min(GROWTH.maxFlameSize, GROWTH.baseFlameSize + (level - 1) * (span / (TOTAL_LEVELS - 1)));
  },
  tierForLevel(level: number): number {
    return Math.min(TIER_COUNT, Math.ceil(level / LEVELS_PER_TIER));
  }
} as const;
