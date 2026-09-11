// Phase 14: accessibility tunables. Two independent, session-only toggles --
// the colorblind-safe palette (see COLORBLIND_PALETTE in flameVisualData.ts,
// which lives there since it's a straight alternate of FLAME_VISUAL.palette)
// and reduced motion, whose one tunable lives here since it's a distinct
// concern (damping existing motion amplitudes, not swapping colors).
export const ACCESSIBILITY = {
  // Multiplies the amplitude terms of updateFlameVisual()'s wobble sine
  // pulsing, per-ribbon sway/jitter, and the halo's sine pulsing when
  // reduced motion is on. Deliberately not 0 -- a fully static flame would
  // read as broken rather than accessible; this keeps the flame visibly
  // "alive" while noticeably calming it.
  reducedMotionScale: 0.45
} as const;
