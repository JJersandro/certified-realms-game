import { GROWTH } from './growthData';

// 7 tiers over 77 levels (11 levels per tier). Leveling *up* (main.ts's tryLevelUp())
// is gated on accumulated XP alone -- flame-balance-tuner confirmed (2026-09-12,
// BACKLOG.md [balance]) that minFlameSizeForLevel below is always already satisfied
// by the time xpForLevel clears, because flameSize is a deterministic function of the
// same energy value XP reads, so a size gate on top of the XP gate never independently
// blocked anyone. minFlameSizeForLevel is still real and in use, though: tryLevelDown()
// reads it to decide how much shrinkage (from the risk system's overheat/fragile drain)
// demotes a level, and its gentler-than-XP per-level minimum means demotion fires before
// an XP-equivalent check would. So today the two curves aren't "coupled forward
// progress," they're XP-forward / size-backward.
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
