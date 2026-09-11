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
    }
  ],
  palette: {
    emberRed: 0xff3b16,
    hotRed: 0xff5b18,
    orange: 0xff8a18,
    gold: 0xffc43b,
    core: 0xfff5c96a,
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
    turbulence: 0.15
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
