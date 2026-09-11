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
