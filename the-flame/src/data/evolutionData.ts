import { PROGRESSION } from './progressionData';
import { FLAME_VISUAL, type FlamePalette } from './flameVisualData';

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
//
// Phase 14: built from a FlamePalette rather than hardcoded hex, so the
// colorblind-safe alternate palette (see FLAME_VISUAL's activePalette()) can
// swap every tier's family at once instead of this table silently keeping
// stale literal copies of the default palette's hues.
function buildForms(palette: FlamePalette): readonly EvolutionForm[] {
  return [
    { tier: 1, base: palette.orange, hot: palette.gold, calm: palette.emberRed },
    { tier: 2, base: palette.hotRed, hot: palette.gold, calm: palette.emberRed },
    { tier: 3, base: palette.orange, hot: palette.magenta, calm: palette.hotRed },
    { tier: 4, base: palette.magenta, hot: palette.violet, calm: palette.orange },
    { tier: 5, base: palette.violet, hot: palette.cyan, calm: palette.magenta },
    { tier: 6, base: palette.cyan, hot: palette.blue, calm: palette.violet },
    { tier: 7, base: palette.blue, hot: palette.core, calm: palette.cyan }
  ];
}

export const EVOLUTION = {
  forms: buildForms(FLAME_VISUAL.palette)
} as const;

export function formForLevel(level: number, palette: FlamePalette = FLAME_VISUAL.palette): EvolutionForm {
  const tier = PROGRESSION.tierForLevel(level);
  return buildForms(palette)[tier - 1];
}
