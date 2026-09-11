// Phase 11 skill tree: unlocked by the first full world clear, spent on
// points earned from every clear thereafter. Exactly 7 nodes -- this game's
// numeric identity (7 tiers, 77 levels) stays consistent here too. Each
// node maps to exactly one mechanical bonus already present elsewhere in
// the codebase (contact radius, heat gain, stability floor, cascade
// chance, speed, xp yield, points yield); see SkillTreeManager for how the
// bonuses are summed and main.ts for where each is wired in.
export type SkillEffect =
  | 'contactRadius'
  | 'heatRiseReduction'
  | 'stabilityFloor'
  | 'cascadeChance'
  | 'speed'
  | 'xpYield'
  | 'pointsYield';

export type SkillNode = {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: SkillEffect;
  magnitude: number;
};

export const SKILL_TREE: readonly SkillNode[] = [
  {
    id: 'ember-reach',
    name: 'Ember Reach',
    description: 'Extends contact reach, letting the flame touch matter from slightly further away.',
    cost: 3,
    effect: 'contactRadius',
    magnitude: 0.08
  },
  {
    id: 'kindling-heart',
    name: 'Kindling Heart',
    description: 'Every burn raises heat a little less, delaying overheat.',
    cost: 3,
    effect: 'heatRiseReduction',
    magnitude: 0.15
  },
  {
    id: 'ashborn-resilience',
    name: 'Ashborn Resilience',
    description: 'Raises the stability floor, making the fragile danger zone harder to reach.',
    cost: 5,
    effect: 'stabilityFloor',
    magnitude: 0.1
  },
  {
    id: 'smoke-veil',
    name: 'Smoke Veil',
    description: 'Adds flat probability to every cascade roll, spreading fire further through matter.',
    cost: 6,
    effect: 'cascadeChance',
    magnitude: 0.1
  },
  {
    id: 'magma-core',
    name: 'Magma Core',
    description: 'Boosts the flame\'s maximum movement speed.',
    cost: 7,
    effect: 'speed',
    magnitude: 0.1
  },
  {
    id: 'cinder-storm',
    name: 'Cinder Storm',
    description: 'Increases XP yield from every burn.',
    cost: 8,
    effect: 'xpYield',
    magnitude: 0.15
  },
  {
    id: 'phoenix-ember',
    name: 'Phoenix Ember',
    description: 'Increases points earned from every world clear.',
    cost: 12,
    effect: 'pointsYield',
    magnitude: 0.25
  }
] as const;
