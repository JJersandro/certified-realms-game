import { GROWTH } from './growthData';

// 7 tiers over 77 levels (11 levels per tier) -- leveling requires both enough
// accumulated XP *and* a minimum flame size for that level, so physical growth
// and XP grinding stay coupled rather than either one alone carrying progress.
export const PROGRESSION = {
  totalLevels: 77,
  tierCount: 7,
  levelsPerTier: 11,
  xpForLevel(level: number): number {
    return Math.round(20 * Math.pow(level, 1.5));
  },
  minFlameSizeForLevel(level: number): number {
    const span = GROWTH.maxFlameSize - GROWTH.baseFlameSize;
    return Math.min(GROWTH.maxFlameSize, GROWTH.baseFlameSize + (level - 1) * (span / 76));
  },
  tierForLevel(level: number): number {
    return Math.min(this.tierCount, Math.ceil(level / this.levelsPerTier));
  }
} as const;
