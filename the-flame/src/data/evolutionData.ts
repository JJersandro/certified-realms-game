import { PROGRESSION } from './progressionData';

export type EvolutionForm = {
  tier: number;
  // three points the flame's color continuously blends between --
  // base is the tier's resting identity, hot is where heat pushes it,
  // calm is where high stability settles it. Same interpolation model
  // already used for the heat-driven orange->gold shift (Phase 3),
  // just generalized to a per-tier family instead of one fixed pair.
  base: number;
  hot: number;
  calm: number;
};

// One color family per tier -- warm ember tones at low tiers, shifting
// through magenta/violet, and into cyan/blue at the highest tiers. Tier
// still gates which family you're in (no separate unlock axis, per the
// same "one tier system" principle Phase 6 established); heat/stability
// only flavor *within* the current family.
export const EVOLUTION = {
  forms: [
    { tier: 1, base: 0xff8a18, hot: 0xffc43b, calm: 0xff3b16 },
    { tier: 2, base: 0xff5b18, hot: 0xffc43b, calm: 0xff3b16 },
    { tier: 3, base: 0xff8a18, hot: 0xe35c9c, calm: 0xff5b18 },
    { tier: 4, base: 0xe35c9c, hot: 0xd34fe0, calm: 0xff8a18 },
    { tier: 5, base: 0xd34fe0, hot: 0x38b9e8, calm: 0xe35c9c },
    { tier: 6, base: 0x38b9e8, hot: 0x2874d0, calm: 0xd34fe0 },
    { tier: 7, base: 0x2874d0, hot: 0xfff5c9, calm: 0x38b9e8 }
  ]
} as const satisfies { forms: readonly EvolutionForm[] };

export function formForLevel(level: number): EvolutionForm {
  const tier = PROGRESSION.tierForLevel(level);
  return EVOLUTION.forms[tier - 1];
}
