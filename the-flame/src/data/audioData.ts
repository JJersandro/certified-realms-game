// Phase 13: all sound in this game is synthesized at runtime via the raw
// Web Audio API -- no loaded/licensed audio files exist anywhere in the
// project, matching every other visual in the game being procedurally
// rendered rather than drawn from an asset. This file is the tunable-numbers
// home for that synthesis, same `as const` pattern as every other
// src/data/*.ts file; the actual node graph/scheduling lives in
// src/systems/AudioManager.ts.
export const AUDIO = {
  // Everything routes through one master GainNode at this level; the mute
  // toggle ramps that node's gain between 0 and this value rather than
  // touching any per-sound gain, so relative balance between sounds never
  // shifts when muting/unmuting.
  masterVolume: 0.55,
  muteRampSeconds: 0.15,

  // 1. Ignite ping -- fired from MatterRegistry.ignite(), the single choke
  // point every ignition path (direct contact, forced hold, cascade link)
  // already funnels through, so a cascade chain naturally produces a
  // rapid-fire flurry of these with no extra cascade-specific sound.
  ignite: {
    volume: 0.16,
    type: 'triangle' as OscillatorType,
    startFrequency: 880,
    endFrequency: 260,
    attackSeconds: 0.004,
    durationSeconds: 0.1
  },

  // 2. Ember crackle -- short filtered-noise burst, triggered probabilistically
  // while a fuel is actively burning. probabilityDivisor scales down
  // MatterRegistry.updateFuel's existing ember-particle chance
  // (0.15 + progress*0.16) so a dense cluster of simultaneously-burning
  // fuel doesn't turn into noise mush.
  emberCrackle: {
    volume: 0.05,
    probabilityDivisor: 7,
    noiseBufferSeconds: 1.0,
    durationSeconds: 0.07,
    filterType: 'bandpass' as BiquadFilterType,
    filterFrequency: 2200,
    filterQ: 1.1
  },

  // 3. Level-up chime -- short ascending arpeggio, on tryLevelUp()'s actual
  // level increase. See tierDown below for the tier-down descent.
  levelUp: {
    volume: 0.15,
    type: 'sine' as OscillatorType,
    notes: [523.25, 659.25, 783.99], // C5, E5, G5
    noteDurationSeconds: 0.11,
    gapSeconds: 0.03
  },

  // 3b. Tier-down descent -- a short descending arpeggio (levelUp's mirror
  // image), only on tryLevelDown() actually crossing a *tier* boundary, not
  // every ordinary level-down. Distinct minor-feeling interval spacing
  // (not just levelUp's notes in reverse) so it reads as "lost ground,"
  // not "level-up played backwards."
  tierDown: {
    volume: 0.15,
    type: 'sine' as OscillatorType,
    notes: [659.25, 523.25, 392.0], // E5, C5, G4
    noteDurationSeconds: 0.13,
    gapSeconds: 0.035
  },

  // 4. World-clear fanfare -- a longer, distinct descending-then-rising
  // phrase (not just a scaled-up level-up chime) so a full world clear
  // reads as a bigger moment.
  worldClear: {
    volume: 0.2,
    type: 'sine' as OscillatorType,
    notes: [783.99, 587.33, 440.0, 587.33, 783.99, 1046.5], // G5 D5 A4 D5 G5 C6
    noteDurationSeconds: 0.19,
    gapSeconds: 0.035
  },

  // 5. Skill purchase blip -- single short bright tone, only on a
  // successful SkillTreeManager.purchase().
  skillPurchase: {
    volume: 0.15,
    type: 'triangle' as OscillatorType,
    frequency: 1046.5, // C6
    durationSeconds: 0.09
  },

  // 6. Ambient heat drone -- continuous background layer, always running
  // softly once unlocked. Filter cutoff and gain are continuously
  // interpolated between the base/max pair below by heat (0-1), set every
  // frame from FlameScene.update() the same way heat already drives visual
  // stretch/glow every frame.
  ambient: {
    type: 'sawtooth' as OscillatorType,
    baseFrequency: 55,
    maxFrequency: 110,
    baseFilterCutoff: 200,
    maxFilterCutoff: 1200,
    baseVolume: 0.015,
    maxVolume: 0.075
  }
} as const;
