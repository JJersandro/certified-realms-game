export const FLAME_VISUAL = {
  identity: 'living fire rather than a static blob',
  references: [
    {
      id: 'vertical-spectrum-flame',
      role: 'primary visual reference',
      observations: [
        'long, layered flame ribbons',
        'twisting and folding flow',
        'hot orange and red in the main body',
        'violet, magenta, cyan and blue in cooler lower wisps',
        'fine translucent smoke-like tendrils',
        'small glowing ember particles around the body',
        'large areas of dark negative space'
      ]
    },
    {
      id: 'horizontal-fire-flow',
      role: 'motion reference',
      observations: [
        'strong directional sweep',
        'elongated ribbon forms',
        'curling tips and hooked tendrils',
        'bright orange core with darker red edges',
        'motion should read as continuous flow rather than a pulsing circle'
      ]
    },
    {
      id: 'photographic-fire-study',
      role: 'silhouette and irregularity reference',
      observations: [
        'jagged, irregular silhouettes -- no two flame lobes share the same size or shape',
        'tips taper to fine licking points rather than rounding off smoothly',
        'some flames read as a single upright plume, others as a low, wind-blown horizontal streak',
        'compact chaotic multi-lobed eruptions sit alongside slender single S-curved ribbons -- both are valid, not just one silhouette family',
        'strictly warm-toned in this particular set (deep red base, orange-yellow body, pale yellow-white hottest tips) -- a reminder to keep the low tiers (SPARK, EMBER) purely warm even as higher tiers introduce the palette\'s cooler hues',
        'sharp contrast against a neutral ground emphasizes silhouette irregularity over smooth gradient -- the current per-ribbon shapes are too uniform/symmetric by comparison'
      ]
    }
  ],
  palette: {
    emberRed: 0xff3b16,
    hotRed: 0xff5b18,
    orange: 0xff8a18,
    gold: 0xffc43b,
    core: 0xfff5c9,
    violet: 0xd34fe0,
    magenta: 0xe35c9c,
    cyan: 0x38b9e8,
    blue: 0x2874d0
  },
  motion: {
    ribbonCount: 5,
    twistFrequency: [0.008, 0.013, 0.021],
    swayAmplitude: 0.22,
    stretch: 1.8,
    directionalInfluence: 0.7,
    turbulence: 0.15,
    // per-ribbon shape irregularity (photographic-fire-study) -- breaks up
    // the otherwise-uniform, perfectly-symmetric ribbon proportions
    lobeVariance: 0.3,
    tipJitter: 0.12
  },
  particles: {
    emberChance: 0.55,
    emberSpeedMin: 8,
    emberSpeedMax: 34,
    emberLifeMin: 220,
    emberLifeMax: 650
  },
  presentation: {
    preserveDarkNegativeSpace: true,
    avoidSolidCircleAppearance: true,
    preferLayeredTransparency: true,
    keepGameMinimal: true
  }
} as const;

// Not `typeof FLAME_VISUAL.palette` -- that infers each key's `as const`
// literal number type, which COLORBLIND_PALETTE's different hex values
// can't satisfy. Same shape, widened to plain `number` per key.
export type FlamePalette = { [K in keyof typeof FLAME_VISUAL.palette]: number };

// Phase 14: one universal colorblind-safe alternate palette -- a deliberate
// product decision to ship exactly one broadly-more-distinguishable palette
// rather than separately-tuned protanopia/deuteranopia/tritanopia variants.
// The default palette's warm reds (emberRed/hotRed) sit close to orange, and
// its violet/magenta sit close to each other, on the red-green axis that
// red-green color-deficient vision struggles to separate. This shifts
// emberRed/hotRed toward the orange-yellow register and violet/magenta
// toward blue, while leaving gold/core/cyan/orange/blue close to their
// default values -- the blue/yellow axis is the one color-deficient vision
// generally preserves best, so pushing the "hot" and "cool" ends of the
// palette further apart along that axis is what actually buys real
// distinguishability, not just a different-looking re-skin.
export const COLORBLIND_PALETTE: FlamePalette = {
  emberRed: 0xffa726,
  hotRed: 0xffcf4d,
  orange: 0xff8a18,
  gold: 0xffc43b,
  core: 0xfff5c9,
  violet: 0x5b6ee1,
  magenta: 0x1f4fd8,
  cyan: 0x38b9e8,
  blue: 0x2874d0
} as const;

export function activePalette(colorblindSafe: boolean): FlamePalette {
  return colorblindSafe ? COLORBLIND_PALETTE : FLAME_VISUAL.palette;
}
