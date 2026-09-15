import { describe, it, expect } from 'vitest';
import { PROGRESSION } from '../progressionData';
import { GROWTH } from '../growthData';

describe('PROGRESSION.xpForLevel', () => {
  it('matches the documented cumulative anchors', () => {
    // These are the exact numbers flame-balance-tuner measured and recorded
    // in BACKLOG.md/its own agent file -- a regression here silently
    // invalidates every prior pacing measurement, not just this test.
    expect(PROGRESSION.xpForLevel(2)).toBe(57);
    expect(PROGRESSION.xpForLevel(11)).toBe(730);
    expect(PROGRESSION.xpForLevel(77)).toBe(13513);
  });

  it('is strictly increasing across the full level range', () => {
    for(let level = 2; level <= PROGRESSION.totalLevels; level++){
      expect(PROGRESSION.xpForLevel(level)).toBeGreaterThan(PROGRESSION.xpForLevel(level - 1));
    }
  });
});

describe('PROGRESSION.tierForLevel', () => {
  it('places level 1 in tier 1 and level 77 in tier 7', () => {
    expect(PROGRESSION.tierForLevel(1)).toBe(1);
    expect(PROGRESSION.tierForLevel(77)).toBe(7);
  });

  it('advances tier exactly at each 11-level boundary', () => {
    // 11 levels per tier, 7 tiers -- the boundaries this game's matterData
    // minLevelToIgnite values (1/12/23/34/45/56/67) are built against.
    expect(PROGRESSION.tierForLevel(11)).toBe(1);
    expect(PROGRESSION.tierForLevel(12)).toBe(2);
    expect(PROGRESSION.tierForLevel(22)).toBe(2);
    expect(PROGRESSION.tierForLevel(23)).toBe(3);
  });

  it('never exceeds the tier count even past the max level', () => {
    expect(PROGRESSION.tierForLevel(PROGRESSION.totalLevels)).toBe(PROGRESSION.tierCount);
  });
});

describe('PROGRESSION.minFlameSizeForLevel', () => {
  it('starts at baseFlameSize and caps at maxFlameSize', () => {
    expect(PROGRESSION.minFlameSizeForLevel(1)).toBe(GROWTH.baseFlameSize);
    expect(PROGRESSION.minFlameSizeForLevel(PROGRESSION.totalLevels)).toBe(GROWTH.maxFlameSize);
  });

  it('is non-decreasing across the full level range', () => {
    for(let level = 2; level <= PROGRESSION.totalLevels; level++){
      expect(PROGRESSION.minFlameSizeForLevel(level))
        .toBeGreaterThanOrEqual(PROGRESSION.minFlameSizeForLevel(level - 1));
    }
  });
});
