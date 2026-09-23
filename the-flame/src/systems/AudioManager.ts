import { AUDIO } from '../data/audioData';

// Pure state+query object, no host/dependency (SkillTreeManager-shaped, not
// MatterRegistry's Host-shaped) -- it only ever needs to be told "play this
// now" or "here is the current heat value", never needs to read back other
// systems' state to decide anything for itself. Owns the one AudioContext
// for the whole session plus a master GainNode everything routes through,
// so the mute toggle is a single node's gain, not per-sound bookkeeping.
export class AudioManager {
  private context: AudioContext;
  private masterGain: GainNode;
  private muted = false;

  // Reused noise buffer for every ember-crackle play -- generated once here,
  // never re-allocated per play (the callsite in MatterRegistry.updateFuel
  // can fire many times a second across a dense burning cluster).
  private noiseBuffer: AudioBuffer;

  // Ambient drone runs continuously for the whole session once unlocked --
  // one oscillator/filter/gain triple created and started here, never
  // recreated. setAmbientIntensity() only ever touches its AudioParams.
  private ambientOscillator: OscillatorNode;
  private ambientFilter: BiquadFilterNode;
  private ambientGain: GainNode;

  // Instability flutter: same "create once, start once, touch only
  // AudioParams per frame" shape as the ambient drone above, but a looped
  // noise source through a bandpass filter instead of a tonal oscillator --
  // a deliberately different timbre so danger doesn't just sound like a
  // louder heat drone.
  private instabilityNoise: AudioBufferSourceNode;
  private instabilityFilter: BiquadFilterNode;
  private instabilityGain: GainNode;

  constructor(){
    this.context = new AudioContext();

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = AUDIO.masterVolume;
    this.masterGain.connect(this.context.destination);

    this.noiseBuffer = this.createNoiseBuffer(AUDIO.emberCrackle.noiseBufferSeconds);

    this.ambientOscillator = this.context.createOscillator();
    this.ambientOscillator.type = AUDIO.ambient.type;
    this.ambientOscillator.frequency.value = AUDIO.ambient.baseFrequency;

    this.ambientFilter = this.context.createBiquadFilter();
    this.ambientFilter.type = 'lowpass';
    this.ambientFilter.frequency.value = AUDIO.ambient.baseFilterCutoff;

    this.ambientGain = this.context.createGain();
    this.ambientGain.gain.value = AUDIO.ambient.baseVolume;

    this.ambientOscillator.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);
    this.ambientOscillator.start();

    // AudioBufferSourceNode can only ever be started once, so looping the
    // existing noise buffer here (rather than creating fresh short bursts
    // like playEmberCrackle does) is what makes this a continuous layer.
    this.instabilityNoise = this.context.createBufferSource();
    this.instabilityNoise.buffer = this.noiseBuffer;
    this.instabilityNoise.loop = true;

    this.instabilityFilter = this.context.createBiquadFilter();
    this.instabilityFilter.type = AUDIO.instability.filterType;
    this.instabilityFilter.frequency.value = AUDIO.instability.filterFrequency;
    this.instabilityFilter.Q.value = AUDIO.instability.filterQ;

    this.instabilityGain = this.context.createGain();
    this.instabilityGain.gain.value = 0; // silent at full stability

    this.instabilityNoise.connect(this.instabilityFilter);
    this.instabilityFilter.connect(this.instabilityGain);
    this.instabilityGain.connect(this.masterGain);
    this.instabilityNoise.start();

    // Mobile/battery: a backgrounded tab has no reason to keep an inaudible
    // drone (or any oscillator/filter graph) actively processing. Web Audio
    // has no per-node "pause" -- suspending the whole AudioContext is what
    // actually stops the ambient oscillator (and everything else) from
    // consuming CPU while hidden, and it's resumable without a fresh user
    // gesture since the context was already running under a prior gesture.
    document.addEventListener('visibilitychange', () => {
      if(document.hidden){
        this.context.suspend().catch(() => {});
      } else {
        this.context.resume().catch(() => {});
      }
    });
  }

  private createNoiseBuffer(seconds: number): AudioBuffer {
    const length = Math.max(1, Math.floor(this.context.sampleRate * seconds));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  // Safe to call repeatedly -- an AudioContext starts 'suspended' under
  // mobile/browser autoplay policy until a user gesture resumes it.
  // FlameScene calls this from its existing pointerdown handler, so the
  // very first tap already in this game becomes the audio-unlock gesture.
  unlock(){
    if(this.context.state === 'suspended') this.context.resume().catch(() => {});
  }

  toggleMute(): string {
    this.muted = !this.muted;
    const now = this.context.currentTime;
    // Ramp rather than jump straight to/from 0 -- an instant gain change
    // clicks/pops.
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(
      this.muted ? 0 : AUDIO.masterVolume,
      now + AUDIO.muteRampSeconds
    );
    return this.muted ? 'SOUND: OFF' : 'SOUND: ON';
  }

  // Short oscillator note with a fast-attack/exponential-decay gain
  // envelope -- shared by the ignite ping, level-up chime, world-clear
  // fanfare, and skill-purchase blip (all "one tone at one pitch" shapes).
  private playTone(frequency: number, type: OscillatorType, volume: number, startTime: number, durationSeconds: number, attackSeconds = 0.006){
    const osc = this.context.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + attackSeconds);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + durationSeconds + 0.02);
  }

  playIgnite(){
    const cfg = AUDIO.ignite;
    const now = this.context.currentTime;

    const osc = this.context.createOscillator();
    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.startFrequency, now);
    osc.frequency.exponentialRampToValueAtTime(cfg.endFrequency, now + cfg.durationSeconds);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(cfg.volume, now + cfg.attackSeconds);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.durationSeconds);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + cfg.durationSeconds + 0.02);
  }

  playEmberCrackle(){
    const cfg = AUDIO.emberCrackle;
    const now = this.context.currentTime;

    const maxOffset = Math.max(0, this.noiseBuffer.duration - cfg.durationSeconds);
    const offset = Math.random() * maxOffset;

    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.context.createBiquadFilter();
    filter.type = cfg.filterType;
    filter.frequency.value = cfg.filterFrequency;
    filter.Q.value = cfg.filterQ;

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(cfg.volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.durationSeconds);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now, offset, cfg.durationSeconds);
  }

  playLevelUp(){
    const cfg = AUDIO.levelUp;
    const now = this.context.currentTime;
    cfg.notes.forEach((freq, i) => {
      const startTime = now + i * (cfg.noteDurationSeconds + cfg.gapSeconds);
      this.playTone(freq, cfg.type, cfg.volume, startTime, cfg.noteDurationSeconds);
    });
  }

  playTierDown(){
    const cfg = AUDIO.tierDown;
    const now = this.context.currentTime;
    cfg.notes.forEach((freq, i) => {
      const startTime = now + i * (cfg.noteDurationSeconds + cfg.gapSeconds);
      this.playTone(freq, cfg.type, cfg.volume, startTime, cfg.noteDurationSeconds);
    });
  }

  playWorldClear(){
    const cfg = AUDIO.worldClear;
    const now = this.context.currentTime;
    cfg.notes.forEach((freq, i) => {
      const startTime = now + i * (cfg.noteDurationSeconds + cfg.gapSeconds);
      this.playTone(freq, cfg.type, cfg.volume, startTime, cfg.noteDurationSeconds);
    });
  }

  playSkillPurchase(){
    const cfg = AUDIO.skillPurchase;
    const now = this.context.currentTime;
    this.playTone(cfg.frequency, cfg.type, cfg.volume, now, cfg.durationSeconds);
  }

  // Continuous state, not a discrete event -- called once per frame from
  // FlameScene.update() at the point this.heat is already available, the
  // same reasoning that already justifies every other per-frame
  // heat-driven visual update in this codebase. Cheap AudioParam sets, no
  // envelope/scheduling needed.
  setAmbientIntensity(heat: number){
    const cfg = AUDIO.ambient;
    const clamped = Math.max(0, Math.min(1, heat));
    this.ambientFilter.frequency.value = cfg.baseFilterCutoff + (cfg.maxFilterCutoff - cfg.baseFilterCutoff) * clamped;
    this.ambientOscillator.frequency.value = cfg.baseFrequency + (cfg.maxFrequency - cfg.baseFrequency) * clamped;
    this.ambientGain.gain.value = cfg.baseVolume + (cfg.maxVolume - cfg.baseVolume) * clamped;
  }

  // Continuous state, same reasoning/pattern as setAmbientIntensity above,
  // called from the same per-frame FlameScene.update() spot right after it.
  // t is the scene's own elapsed-time clock (same one updateFlameVisual's
  // Math.sin(t * rate) wobble/sway terms already use), not wall-clock time,
  // so the flutter stays perfectly in step with everything else driven by
  // that clock (including under reducedMotion, which slows nothing here --
  // this is audio, not motion amplitude, so ACCESSIBILITY.reducedMotionScale
  // doesn't apply the way it does to visual terms).
  setInstabilityIntensity(stability: number, t: number){
    const cfg = AUDIO.instability;
    const instability = 1 - Math.max(0, Math.min(1, stability));
    const flutterRate = cfg.baseFlutterRate + (cfg.maxFlutterRate - cfg.baseFlutterRate) * instability;
    const flutter = 0.5 + 0.5 * Math.sin(t * flutterRate);
    this.instabilityGain.gain.value = instability * cfg.maxVolume * flutter;
  }
}
