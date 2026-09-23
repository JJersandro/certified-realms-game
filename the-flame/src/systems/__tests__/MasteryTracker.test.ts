import { describe, it, expect } from 'vitest';
import { MasteryTracker } from '../MasteryTracker';
import { MATTER } from '../../data/matterData';
import { MASTERY } from '../../data/masteryData';
import { FOCUS } from '../../data/focusData';

describe('MasteryTracker initial state', () => {
  it('starts every counter at zero, with one burnsPerTier slot per MATTER tier', () => {
    const mastery = new MasteryTracker();
    expect(mastery.burnsPerTier).toHaveLength(MATTER.length);
    expect(mastery.burnsPerTier.every(count => count === 0)).toBe(true);
    expect(mastery.cascadesTriggered).toBe(0);
    expect(mastery.riskyIgnitionsSurvived).toBe(0);
    expect(mastery.worldsCleared).toBe(0);
    expect(mastery.distanceTraveled).toBe(0);
    expect(mastery.masteryPoints).toBe(0);
  });
});

describe('MasteryTracker.recordBurn -- item 4 Mastery Points threshold', () => {
  it('awards exactly one Mastery Point the instant kindling burns cross the threshold', () => {
    const mastery = new MasteryTracker();
    for(let i = 0; i < MASTERY.kindlingBurnThreshold - 1; i++) mastery.recordBurn(MATTER[0].id);
    expect(mastery.masteryPoints).toBe(0); // one burn short -- not awarded yet

    mastery.recordBurn(MATTER[0].id); // the threshold-crossing burn
    expect(mastery.burnsPerTier[0]).toBe(MASTERY.kindlingBurnThreshold);
    expect(mastery.masteryPoints).toBe(MASTERY.kindlingBurnReward);
  });

  it('does not award again on further kindling burns past the threshold', () => {
    const mastery = new MasteryTracker();
    for(let i = 0; i < MASTERY.kindlingBurnThreshold + 20; i++) mastery.recordBurn(MATTER[0].id);
    expect(mastery.masteryPoints).toBe(MASTERY.kindlingBurnReward);
  });

  it('does not award for the same total count reached on a different tier', () => {
    const mastery = new MasteryTracker();
    for(let i = 0; i < MASTERY.kindlingBurnThreshold; i++) mastery.recordBurn(MATTER[1].id);
    expect(mastery.burnsPerTier[1]).toBe(MASTERY.kindlingBurnThreshold);
    expect(mastery.masteryPoints).toBe(0);
  });
});

describe('MasteryTracker.recordBurn', () => {
  it('increments only the counter matching the given tier id', () => {
    const mastery = new MasteryTracker();
    mastery.recordBurn(MATTER[0].id); // kindling
    expect(mastery.burnsPerTier[0]).toBe(1);
    expect(mastery.burnsPerTier.slice(1).every(count => count === 0)).toBe(true);
  });

  it('accumulates independently per tier across repeated calls', () => {
    const mastery = new MasteryTracker();
    mastery.recordBurn(MATTER[0].id);
    mastery.recordBurn(MATTER[0].id);
    mastery.recordBurn(MATTER[6].id); // embercore
    expect(mastery.burnsPerTier[0]).toBe(2);
    expect(mastery.burnsPerTier[6]).toBe(1);
    expect(mastery.burnsPerTier[1]).toBe(0);
  });

  it('every MATTER tier writes to a distinct, correctly-indexed counter', () => {
    const mastery = new MasteryTracker();
    for(const tier of MATTER) mastery.recordBurn(tier.id);
    expect(mastery.burnsPerTier).toEqual(new Array(MATTER.length).fill(1));
  });

  it('is a no-op for an out-of-range tier id instead of throwing or misindexing', () => {
    const mastery = new MasteryTracker();
    expect(() => mastery.recordBurn(0)).not.toThrow();
    expect(() => mastery.recordBurn(MATTER.length + 1)).not.toThrow();
    expect(mastery.burnsPerTier.every(count => count === 0)).toBe(true);
  });
});

describe('MasteryTracker.recordCascadeTriggered', () => {
  it('increments cascadesTriggered by exactly one per call', () => {
    const mastery = new MasteryTracker();
    mastery.recordCascadeTriggered();
    mastery.recordCascadeTriggered();
    mastery.recordCascadeTriggered();
    expect(mastery.cascadesTriggered).toBe(3);
  });

  it('does not touch any other counter', () => {
    const mastery = new MasteryTracker();
    mastery.recordCascadeTriggered();
    expect(mastery.burnsPerTier.every(count => count === 0)).toBe(true);
    expect(mastery.riskyIgnitionsSurvived).toBe(0);
    expect(mastery.worldsCleared).toBe(0);
    expect(mastery.distanceTraveled).toBe(0);
  });
});

describe('MasteryTracker.recordRiskyIgnitionSurvived', () => {
  it('increments riskyIgnitionsSurvived by exactly one per call', () => {
    const mastery = new MasteryTracker();
    mastery.recordRiskyIgnitionSurvived();
    expect(mastery.riskyIgnitionsSurvived).toBe(1);
    mastery.recordRiskyIgnitionSurvived();
    expect(mastery.riskyIgnitionsSurvived).toBe(2);
  });
});

describe('MasteryTracker.recordWorldCleared', () => {
  it('increments worldsCleared by exactly one per call', () => {
    const mastery = new MasteryTracker();
    mastery.recordWorldCleared();
    mastery.recordWorldCleared();
    expect(mastery.worldsCleared).toBe(2);
  });
});

describe('MasteryTracker.addDistance', () => {
  it('accumulates positive deltas across multiple calls', () => {
    const mastery = new MasteryTracker();
    mastery.addDistance(12.5);
    mastery.addDistance(7.5);
    expect(mastery.distanceTraveled).toBe(20);
  });

  it('accumulates distance traveled regardless of direction -- moving out and back adds both legs', () => {
    const mastery = new MasteryTracker();
    mastery.addDistance(50); // out
    mastery.addDistance(50); // back to the same point
    expect(mastery.distanceTraveled).toBe(100);
  });

  it('ignores zero, negative, and NaN deltas instead of corrupting the running total', () => {
    const mastery = new MasteryTracker();
    mastery.addDistance(10);
    mastery.addDistance(0);
    mastery.addDistance(-5);
    mastery.addDistance(NaN);
    expect(mastery.distanceTraveled).toBe(10);
  });
});

describe('MasteryTracker.focusedTierId -- item 7 recent-window focus', () => {
  const kindling = MATTER[0].id;
  const brush = MATTER[1].id;
  const timber = MATTER[2].id;
  const bone = MATTER[4].id;

  it('is null before the first burn', () => {
    const mastery = new MasteryTracker();
    expect(mastery.focusedTierId()).toBeNull();
  });

  it('focuses the only tier burned so far', () => {
    const mastery = new MasteryTracker();
    mastery.recordBurn(timber);
    expect(mastery.focusedTierId()).toBe(timber);
  });

  it('picks the most-burned tier within the window', () => {
    const mastery = new MasteryTracker();
    mastery.recordBurn(kindling);
    for(let i = 0; i < 3; i++) mastery.recordBurn(brush);
    for(let i = 0; i < 5; i++) mastery.recordBurn(bone);
    expect(mastery.focusedTierId()).toBe(bone);
  });

  it('breaks a tie toward the lowest tier id, whichever was recorded first', () => {
    const mastery = new MasteryTracker();
    mastery.recordBurn(bone);
    mastery.recordBurn(bone);
    mastery.recordBurn(brush);
    mastery.recordBurn(brush);
    expect(mastery.focusedTierId()).toBe(brush);
  });

  it('evicts burns older than the window, so recent hunting overtakes an all-time leader', () => {
    const mastery = new MasteryTracker();
    for(let i = 0; i < FOCUS.recentBurnWindow; i++) mastery.recordBurn(kindling);
    const half = FOCUS.recentBurnWindow / 2;
    for(let i = 0; i < half; i++) mastery.recordBurn(timber);
    // window is now half kindling, half timber -- tie goes to kindling
    expect(mastery.focusedTierId()).toBe(kindling);

    mastery.recordBurn(timber);
    // one more timber evicts one more kindling -- timber leads the window
    // even though kindling still leads all-time burnsPerTier
    expect(mastery.focusedTierId()).toBe(timber);
    expect(mastery.burnsPerTier[0]).toBeGreaterThan(mastery.burnsPerTier[2]);
  });

  it('never holds more than FOCUS.recentBurnWindow entries', () => {
    const mastery = new MasteryTracker();
    for(let i = 0; i < FOCUS.recentBurnWindow * 3; i++) mastery.recordBurn(MATTER[i % MATTER.length].id);
    expect(mastery.recentBurnTiers).toHaveLength(FOCUS.recentBurnWindow);
  });

  it('ignores out-of-range tier ids', () => {
    const mastery = new MasteryTracker();
    mastery.recordBurn(0);
    mastery.recordBurn(MATTER.length + 1);
    expect(mastery.recentBurnTiers).toHaveLength(0);
    expect(mastery.focusedTierId()).toBeNull();

    mastery.recordBurn(brush);
    mastery.recordBurn(0);
    expect(mastery.focusedTierId()).toBe(brush);
  });
});

describe('MasteryTracker counters stay independent of each other', () => {
  it('a mix of every kind of record/add call only moves its own counter(s)', () => {
    const mastery = new MasteryTracker();
    mastery.recordBurn(MATTER[2].id);
    mastery.recordCascadeTriggered();
    mastery.recordRiskyIgnitionSurvived();
    mastery.recordWorldCleared();
    mastery.addDistance(42);

    expect(mastery.burnsPerTier[2]).toBe(1);
    expect(mastery.burnsPerTier.filter((_, i) => i !== 2).every(count => count === 0)).toBe(true);
    expect(mastery.cascadesTriggered).toBe(1);
    expect(mastery.riskyIgnitionsSurvived).toBe(1);
    expect(mastery.worldsCleared).toBe(1);
    expect(mastery.distanceTraveled).toBe(42);
  });
});
