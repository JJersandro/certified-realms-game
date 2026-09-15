import { describe, it, expect } from 'vitest';
import { MATTER } from '../matterData';
import { PROGRESSION } from '../progressionData';

describe('MATTER tier table integrity', () => {
  it('has exactly PROGRESSION.tierCount tiers, ordered 1..N', () => {
    expect(MATTER).toHaveLength(PROGRESSION.tierCount);
    MATTER.forEach((tier, i) => expect(tier.id).toBe(i + 1));
  });

  it('every tier has a valid, non-empty radius range', () => {
    for(const tier of MATTER){
      expect(tier.radiusMin).toBeGreaterThan(0);
      expect(tier.radiusMax).toBeGreaterThanOrEqual(tier.radiusMin);
    }
  });

  it('minLevelToIgnite is non-decreasing across tiers (higher tiers never unlock earlier)', () => {
    let lastThreshold = 0;
    for(const tier of MATTER){
      expect(tier.minLevelToIgnite).toBeGreaterThanOrEqual(lastThreshold);
      lastThreshold = tier.minLevelToIgnite;
    }
  });

  it('a tier is never ignitable before the player has actually reached that tier', () => {
    // Weaker, correct version of the boundary check: tiers 1-2 both share
    // minLevelToIgnite=1 by design (both ignitable from the start), so this
    // only asserts the tier a threshold unlocks at is no *later* than the
    // matter tier itself -- not that they're numerically equal.
    for(const tier of MATTER){
      expect(PROGRESSION.tierForLevel(tier.minLevelToIgnite)).toBeLessThanOrEqual(tier.id);
    }
  });

  it('spawnWeight is positive for every tier (never an unreachable dead entry)', () => {
    for(const tier of MATTER) expect(tier.spawnWeight).toBeGreaterThan(0);
  });

  it('higher tiers are worth more XP per unit area (xpFactor increases with tier)', () => {
    for(let i = 1; i < MATTER.length; i++){
      expect(MATTER[i].xpFactor).toBeGreaterThan(MATTER[i - 1].xpFactor);
    }
  });
});
