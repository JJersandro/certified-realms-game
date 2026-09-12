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

// Idle-Slayer-style trickle (2026-09-12, flame-balance-tuner, BACKLOG.md [balance]
// pacing item): a full world clear is the *only* skill-point source above this line,
// and real playtest measurement (see BACKLOG.md) showed that extrapolates to 260+
// minutes of continuous, perfectly-targeted play -- i.e. 0 skill points in any
// realistic short session. Idle Slayer's actual model (per the project owner's
// research) is a permanent currency that drips continuously from every ordinary kill,
// not from a rare event; ascension (the closest analogue to this game's world-clear
// bonus) sits on top of that as a bigger, less-frequent escalation, not the only
// income source. This constant is that same continuous drip's direct equivalent here:
// a small, flat, deterministic number of skill points on every fuel burn, independent
// of the fuel's tier/xpYield (tier-scaling would let it explode at high tiers the way
// xpYield itself does -- see matterData.ts's embercore numbers -- which is fine for XP
// but not for a currency meant to stay a small side-drip). Sized off the measured
// Trial-B playtest baseline (5 real burns in ~163s, level 1-4): 1 point/burn puts a
// player at 5 points by that point, enough for exactly one purchase (the cheapest node
// costs 3) without affording the whole tree (36 total) -- "a felt purchase decision,
// not a shopping spree" in the same short window the XP-pacing measurement used.
// Awarding any amount here also flips SkillTreeManager.unlocked (see award()) --
// deliberately not gated behind a world clear the way it used to be exclusively,
// since gating the *spend* side behind the same rare event this trickle exists to
// route around would silently defeat the point of adding it.
export const SKILL_TREE_TRICKLE = {
  pointsPerBurn: 1
} as const;
