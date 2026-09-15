// PROGRESSION_QUEUE.md item 2: single source of truth for what each of the
// 7-domain progression concept's domains (PROGRESSION_CONCEPT.md) actually
// means *in The Flame* -- translated, not ported, per
// .claude/agents/flame-progression-architect.md's "Translation, not
// porting" rule. Every later progression item, and every future agent run
// touching this system, should reference this file rather than re-deriving
// the mapping from the concept doc's generic RPG language.
//
// "Burning Style" is named directly here rather than the concept doc's
// literal "Combat" -- PROGRESSION_QUEUE.md's own "How the 7 domains map
// onto The Flame" section already settles Combat -> Burning Style as
// framing (not marked OPEN DECISION), and item 2's own instruction to
// avoid "the generic concept language" rules out writing "Combat" here
// even as a placeholder. See PROGRESSION_QUEUE.md item 5, which is a
// confirmation checkpoint for this name, not a rename step.
export type ProgressionDomain = {
  name: string;
  description: string;
};

export const PROGRESSION_DOMAINS: readonly ProgressionDomain[] = [
  {
    name: 'Foundation',
    description: 'The flame\'s baseline growth: the XP/energy curve across 77 levels and 7 tiers, and the speed/reach capability boost each tier grants (SCALE.tierCapabilities) -- getting stronger at exactly what the flame already does, burning and moving.'
  },
  {
    name: 'Burning Style',
    description: 'How the flame burns, not just how much: bonuses for aggressive/fast play, focusing a chosen matter tier, a flat chance at a bonus burn, extra reward for igniting already-weakened fuel, and payoff that scales with how far a single cascade chain spreads.'
  },
  {
    name: 'Economy',
    description: 'Already covered by the flame\'s existing energy/XP accrual and skill points (the per-burn trickle plus the world-clear bonus) -- no new currency exists or is planned for this domain.'
  },
  {
    name: 'Mastery',
    description: 'What the flame has actually done, not what it has accumulated: burns landed per tier, cascades triggered, worlds fully cleared, risky ignitions survived, and total distance traveled, each crossing thresholds for its own Mastery Points.'
  },
  {
    name: 'Ascension',
    description: 'A deliberate, player-triggered full reset of level/energy/flameSize back to a fresh spark, awarding Ascension Points spent on a second, separate "unique skills" tree -- the existing skill tree and its points are untouched by it.'
  },
  {
    name: 'Transcendence',
    description: 'A mix of rule-changing effects rather than another stat boost, reached through major cross-domain milestones -- the exact set of effects is still an open design question (see PROGRESSION_QUEUE.md item 17).'
  },
  {
    name: '7-Core',
    description: 'The ultimate layer, representing mastery of every other domain at once -- not yet queued, since it depends on Foundation, Burning Style, Mastery, Ascension, and Transcendence all existing in some real form first.'
  }
] as const;
