export type MatterTier = {
  id: number;
  name: string;
  radiusMin: number;
  radiusMax: number;
  color: number;
  maxHpPerRadius: number;
  drainPerMs: number;
  xpFactor: number;
  minLevelToIgnite: number;
  spawnWeight: number;
  // cascading destruction (Phase 10): while this tier burns, nearby idle
  // matter within radiusMultiplier * this instance's own radius has a
  // per-neighbor cascadeChance of catching too -- denser/rarer materials
  // spread less readily than dry kindling/brush.
  //
  // PROGRESSION_QUEUE.md item 9 raised this from 3.5 to 7.5 on every tier,
  // measured on real spawned worlds: at 3.5 only ~1% (level 1) / ~2% (level
  // 40) of ignitions started any chain at all, too rare for item 9's chain
  // reward to ever show up. At 7.5: ~4% / ~9%. Picked by a rule fixed before
  // measuring -- the lowest value with a level-40 rate of at least 8% (6.5
  // gave 6.6%). A chain's expected branching stays far below 1, so it can't
  // snowball. See BACKLOG.md [balance] for the full numbers.
  cascadeRadiusMultiplier: number;
  cascadeChance: number;
};

// 7 tiers, gated by player level rather than raw flame size (see progressionData.ts) --
// minLevelToIgnite lines up with the 11-levels-per-tier split of the 77-level curve.
export const MATTER: readonly MatterTier[] = [
  { id: 1, name: 'kindling',  radiusMin: 3,  radiusMax: 6,  color: 0xd7c7aa, maxHpPerRadius: 6,  drainPerMs: 0.30, xpFactor: 1.0, minLevelToIgnite: 1,  spawnWeight: 30, cascadeRadiusMultiplier: 7.5, cascadeChance: 0.35 },
  { id: 2, name: 'brush',     radiusMin: 6,  radiusMax: 10, color: 0x5d8c55, maxHpPerRadius: 8,  drainPerMs: 0.22, xpFactor: 1.4, minLevelToIgnite: 1,  spawnWeight: 25, cascadeRadiusMultiplier: 7.5, cascadeChance: 0.30 },
  { id: 3, name: 'timber',    radiusMin: 9,  radiusMax: 14, color: 0x6b625b, maxHpPerRadius: 10, drainPerMs: 0.16, xpFactor: 1.8, minLevelToIgnite: 12, spawnWeight: 18, cascadeRadiusMultiplier: 7.5, cascadeChance: 0.24 },
  { id: 4, name: 'resin',     radiusMin: 12, radiusMax: 17, color: 0xb2793a, maxHpPerRadius: 12, drainPerMs: 0.13, xpFactor: 2.2, minLevelToIgnite: 23, spawnWeight: 12, cascadeRadiusMultiplier: 7.5, cascadeChance: 0.18 },
  { id: 5, name: 'bone',      radiusMin: 14, radiusMax: 19, color: 0xd8cdb8, maxHpPerRadius: 14, drainPerMs: 0.11, xpFactor: 2.6, minLevelToIgnite: 34, spawnWeight: 8,  cascadeRadiusMultiplier: 7.5, cascadeChance: 0.12 },
  { id: 6, name: 'ore',       radiusMin: 16, radiusMax: 21, color: 0x8a8a92, maxHpPerRadius: 16, drainPerMs: 0.09, xpFactor: 3.2, minLevelToIgnite: 45, spawnWeight: 5,  cascadeRadiusMultiplier: 7.5, cascadeChance: 0.08 },
  { id: 7, name: 'embercore', radiusMin: 18, radiusMax: 24, color: 0xff5b18, maxHpPerRadius: 20, drainPerMs: 0.07, xpFactor: 4.0, minLevelToIgnite: 56, spawnWeight: 2,  cascadeRadiusMultiplier: 7.5, cascadeChance: 0.05 }
] as const;
