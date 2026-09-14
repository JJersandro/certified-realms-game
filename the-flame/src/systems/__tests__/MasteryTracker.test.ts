import { describe, it, expect } from 'vitest';
import { MasteryTracker } from '../MasteryTracker';
import { MATTER } from '../../data/matterData';

describe('MasteryTracker initial state', () => {
  it('starts every counter at zero, with one burnsPerTier slot per MATTER tier', () => {
    const mastery = new MasteryTracker();
    expect(mastery.burnsPerTier).toHaveLength(MATTER.length);
    expect(mastery.burnsPerTier.every(count => count === 0)).toBe(true);
    expect(mastery.cascadesTriggered).toBe(0);
    expect(mastery.riskyIgnitionsSurvived).toBe(0);
    expect(mastery.worldsCleared).toBe(0);
    expect(mastery.distanceTraveled).toBe(0);
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
