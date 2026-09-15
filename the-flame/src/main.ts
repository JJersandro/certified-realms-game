import Phaser from 'phaser/dist/phaser-arcade-physics.js';
import { FLAME_VISUAL, activePalette, type FlamePalette } from './data/flameVisualData';
import { ACCESSIBILITY } from './data/accessibilityData';
import { GROWTH } from './data/growthData';
import { PROGRESSION } from './data/progressionData';
import { capabilitiesForLevel } from './data/scaleData';
import { formForLevel } from './data/evolutionData';
import { WORLD } from './data/worldData';
import { TILT_CONTROL } from './data/tiltData';
import { RISK } from './data/riskData';
import { ENDGAME } from './data/endgameData';
import { SKILL_TREE } from './data/skillTreeData';
import { MatterRegistry } from './systems/MatterRegistry';
import { WorldManager } from './systems/WorldManager';
import { TiltControl } from './systems/TiltControl';
import { SkillTreeManager } from './systems/SkillTreeManager';
import { MasteryTracker } from './systems/MasteryTracker';
import { AudioManager } from './systems/AudioManager';
import { UIScene } from './scenes/UIScene';
import { TitleScene } from './scenes/TitleScene';

type ControlMode = 'touch' | 'gyroscope';

type Ribbon = {
  visual: Phaser.GameObjects.Ellipse;
  phase: number;
  speed: number;
  width: number;
  height: number;
  alpha: number;
  // photographic-fire-study: distinct per-ribbon proportions and an
  // independent jitter phase/speed so no two lobes move identically
  lobeScale: number;
  jitterPhase: number;
  jitterSpeed: number;
};

class FlameScene extends Phaser.Scene {
  flame!: Phaser.GameObjects.Arc;
  halo!: Phaser.GameObjects.Arc;
  core!: Phaser.GameObjects.Ellipse;
  target = new Phaser.Math.Vector2();
  velocity = new Phaser.Math.Vector2();
  lastDirection = 0;
  flameSize: number = GROWTH.baseFlameSize;
  energy = 0;
  heat = 0;
  stability = 1;
  burned = 0;
  level = 1;
  matterSystem!: MatterRegistry;
  world!: WorldManager;
  tilt = new TiltControl();
  controlMode: ControlMode = 'touch';
  ribbons: Ribbon[] = [];
  scorches: Phaser.GameObjects.Arc[] = [];
  particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  // Phase 11: planetary/world endgame -- worldStrength escalates every full
  // clear (see checkWorldConsumed()) and drives tougher matter HP on the
  // next generated world; worldsCleared distinguishes the first clear's
  // flat escalation from every subsequent clear's random one.
  skillTree = new SkillTreeManager();
  // PROGRESSION_QUEUE.md item 3: Mastery domain tracking-only counters --
  // no UI/currency/thresholds yet (see MasteryTracker's own header comment).
  // SkillTreeManager-shaped (no constructor dependency), same as skillTree
  // above.
  mastery = new MasteryTracker();
  worldStrength = 1.0;
  worldsCleared = 0;
  // Phase 13: all sound is synthesized at runtime via raw Web Audio, no
  // loaded/licensed audio files -- see AudioManager and audioData.ts.
  audio = new AudioManager();
  // Phase 14: two independent, session-only accessibility toggles. Neither
  // gets its own state class -- each is a single boolean FlameScene owns and
  // mutates directly, same weight as any other scene flag (controlMode,
  // etc.), not a new category of state that would warrant a system class.
  colorblindSafe = false;
  reducedMotion = false;
  // postFX controllers on the flame/core -- mutable objects Phaser returns
  // from addGlow(), kept so updateFlameVisual() can retint them every frame
  // alongside the existing evolvedColor computation. Undefined under a
  // Canvas fallback (postFX is WebGL-only and silently no-ops there), so
  // every use is optional-chained.
  flameGlow?: Phaser.FX.Glow;
  coreGlow?: Phaser.FX.Glow;

  constructor(){ super('flame'); }

  // Phase 14: single accessor for "which palette is currently active" so no
  // call site duplicates the colorblindSafe ? ... : ... check.
  palette(): FlamePalette {
    return activePalette(this.colorblindSafe);
  }

  create(){
    this.cameras.main.setBackgroundColor('#080604');
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.target.set(WORLD.width / 2, WORLD.height / 2);

    this.halo = this.add.circle(
      this.target.x,
      this.target.y,
      this.flameSize * 2.1,
      this.palette().orange,
      0.08
    ).setDepth(3);
    // Phase 14: postFX (Phaser 3.60+, WebGL-only -- silently a no-op under a
    // Canvas fallback, so no manual fallback path needed). The halo's color
    // is set once here and never changed per frame (only its radius/alpha
    // are, in updateFlameVisual), and "orange" is one of the values the
    // colorblind-safe palette leaves untouched -- so a static bloom color
    // is correct, not just simpler, here.
    this.halo.postFX?.addBloom(this.palette().orange, 1, 1, 1.1, 0.85, 3);

    this.createFlameBody();
    this.createParticles();

    this.matterSystem = new MatterRegistry({
      scene: this,
      particles: this.particles,
      scorches: this.scorches,
      getFlame: () => ({
        x: this.flame.x,
        y: this.flame.y,
        size: this.flameSize,
        level: this.level,
        contactRadiusMultiplier: capabilitiesForLevel(this.level).contactRadiusMultiplier
          * (1 + this.skillTree.contactRadiusBonus()),
        cascadeChanceBonus: this.skillTree.cascadeChanceBonus(),
        xpYieldMultiplier: 1 + this.skillTree.xpYieldBonus(),
        heat: this.heat,
        palette: this.palette()
      }),
      addHeat: (amount) => {
        const eased = amount * (1 - this.skillTree.heatRiseReductionBonus());
        this.heat = Math.min(GROWTH.maxHeat, this.heat + eased);
      },
      applyStabilityPenalty: (amount) => {
        this.stability = Phaser.Math.Clamp(this.stability - amount, GROWTH.minStability, GROWTH.maxStability);
      },
      onFuelBurned: (xpYield) => {
        this.energy += xpYield;
        this.burned++;
        this.flameSize = Math.min(
          GROWTH.maxFlameSize,
          GROWTH.baseFlameSize + Math.sqrt(this.energy) * GROWTH.sizeEnergyFactor
        );
        this.tryLevelUp();
        // Idle-Slayer-style trickle (BACKLOG.md [balance] pacing item): a
        // small flat skill-point drip on every burn, independent of and in
        // addition to checkWorldConsumed()'s much rarer full-clear bonus
        // below -- see SKILL_TREE_TRICKLE's comment in skillTreeData.ts.
        const justUnlockedByTrickle = this.skillTree.awardBurnTrickle();
        if(justUnlockedByTrickle) this.game.events.emit('ui:skillTreeUnlocked');
        this.emitSkillTreeChanged();
        this.checkWorldConsumed();
      },
      onIgnite: () => this.audio.playIgnite(),
      onEmberCrackle: () => this.audio.playEmberCrackle(),
      onBurnComplete: (intensity) => this.playBurnCompleteFlourish(intensity),
      // PROGRESSION_QUEUE.md item 3 -- same "pure notification straight into
      // a record method" shape as the audio/visual callbacks just above.
      onMasteryBurn: (tierId) => this.mastery.recordBurn(tierId),
      onCascadeTriggered: () => this.mastery.recordCascadeTriggered(),
      onRiskyIgnitionSurvived: () => this.mastery.recordRiskyIgnitionSurvived()
    });

    this.world = new WorldManager(this.matterSystem);
    this.world.populate(this.worldStrength);

    this.cameras.main.startFollow(this.flame, true, 0.09, 0.09);

    const aimAt = (p: Phaser.Input.Pointer) => {
      // Phase 13: an AudioContext starts suspended under mobile/browser
      // autoplay policy until a user gesture resumes it. This same
      // function is also registered on 'pointerdown' below, so the very
      // first tap already in this game becomes the audio-unlock gesture
      // for free -- unlock() is idempotent, so calling it again on every
      // subsequent pointermove/pointerdown is harmless.
      this.audio.unlock();
      if(this.controlMode !== 'touch') return;
      // Deliberate narrow exception to the event-only cross-scene rule: a
      // synchronous per-pointer-event hit test against UIScene's HUD chrome
      // has no natural fit as a discrete event, and Phaser does not stop
      // this scene's own pointermove/pointerdown listener just because
      // UIScene's interactive objects sit visually on top of it -- these
      // are two independent listeners on two scenes' input plugins, not one
      // bubbling chain. A full event round-trip here would be needless
      // complexity for a same-frame geometry query.
      if((this.scene.get('ui') as UIScene).isPointOverUI(p.x, p.y)) return;
      const world = this.cameras.main.getWorldPoint(p.x, p.y);
      this.target.set(world.x, world.y);
    };
    this.input.on('pointermove', aimAt);
    this.input.on('pointerdown', aimAt);

    this.game.events.on('ui:requestToggleControlMode', () => this.toggleControlMode());
    this.game.events.on('ui:requestPurchase', ({ nodeId }: { nodeId: string }) => {
      const node = SKILL_TREE.find(n => n.id === nodeId);
      if(!node) return;
      if(this.skillTree.purchase(node)){
        this.emitSkillTreeChanged();
        this.audio.playSkillPurchase();
      }
    });
    this.game.events.on('ui:requestToggleMute', () => {
      const label = this.audio.toggleMute();
      this.game.events.emit('ui:audioMuteChanged', { label });
    });
    // Phase 14: same request/confirm round-trip every other toggle this
    // session uses -- FlameScene owns and mutates the real boolean, UIScene
    // only ever renders whatever gets echoed back.
    this.game.events.on('ui:requestToggleColorblind', () => {
      this.colorblindSafe = !this.colorblindSafe;
      this.recolorRibbons();
      this.game.events.emit('ui:colorblindChanged', { on: this.colorblindSafe });
    });
    this.game.events.on('ui:requestToggleReducedMotion', () => {
      this.reducedMotion = !this.reducedMotion;
      this.game.events.emit('ui:reducedMotionChanged', { on: this.reducedMotion });
    });

    this.scene.launch('ui');
  }

  createFlameBody(){
    this.flame = this.add.circle(
      this.target.x,
      this.target.y,
      this.flameSize,
      this.palette().orange,
      0.9
    ).setDepth(6);
    // Phase 14: postFX Glow on the main flame body and core -- the cheapest
    // available meaningfully-less-flat visual upgrade Phaser's built-in
    // post-processing offers, no shader code/assets. Controllers are
    // returned mutable so updateFlameVisual() can retint .color every frame
    // to track the same evolvedColor the fill itself is set to, rather than
    // freezing the glow to whatever hue existed at creation time.
    this.flameGlow = this.flame.postFX?.addGlow(this.palette().orange, 0, 1.4, false, 0.1, 12);

    this.core = this.add.ellipse(
      this.target.x,
      this.target.y,
      this.flameSize * 0.72,
      this.flameSize * 1.25,
      this.palette().core,
      0.82
    ).setDepth(7);
    this.coreGlow = this.core.postFX?.addGlow(this.palette().core, 0, 1.1, false, 0.1, 10);

    const colors = this.ribbonColors();

    for(let i = 0; i < FLAME_VISUAL.motion.ribbonCount; i++){
      // no two lobes the same size or shape -- a random per-ribbon scale
      // on top of the index-based progression, rather than a perfectly
      // uniform sequence
      const lobeScale = 1 + (Math.random() * 2 - 1) * FLAME_VISUAL.motion.lobeVariance;

      // flame-visual-designer finding (2026-09-12): the ribbon ellipse's
      // half-height needs to clear the flame body's own radius (flameSize)
      // for a ribbon lobe to actually poke past the flame's opaque circular
      // silhouette (depth 6, drawn on top of these ribbons at depth 5) --
      // otherwise it's fully occluded and invisible regardless of how much
      // lobeVariance/tipJitter perturb its shape. The old 1.7-2.05 factor's
      // half-height (0.85-1.03x flameSize before lobeScale) sat right at or
      // under that threshold, so at low lobeScale/low heat/rest state most
      // ribbons rendered fully hidden -- see BACKLOG.md's [visual] item and
      // the before/after screenshots that motivated this change. 3.4-3.8
      // guarantees a clearing half-height (>=1.19x flameSize) even at
      // lobeVariance's minimum lobeScale (0.7), so a jagged ribbon tip is
      // reliably visible outside the flame's edge at every tier/size.
      const visual = this.add.ellipse(
        this.target.x,
        this.target.y,
        this.flameSize * (0.44 + i * 0.035) * lobeScale,
        this.flameSize * (3.4 + (i % 2) * 0.4) * lobeScale,
        colors[i],
        FLAME_VISUAL.presentation.preferLayeredTransparency ? 0.24 + i * 0.025 : 0.8
      ).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);

      this.ribbons.push({
        visual,
        phase: i * 1.47,
        speed: FLAME_VISUAL.motion.twistFrequency[i % FLAME_VISUAL.motion.twistFrequency.length],
        width: 1 + i * 0.08,
        height: 1 + i * 0.16,
        alpha: 0.24 + i * 0.025,
        lobeScale,
        jitterPhase: Math.random() * Math.PI * 2,
        jitterSpeed: 0.006 + Math.random() * 0.01
      });
    }
  }

  ribbonColors(): number[] {
    const p = this.palette();
    return [p.emberRed, p.hotRed, p.orange, p.violet, p.cyan];
  }

  // Ribbon fill color is set once at creation and, unlike the flame/core
  // (recolored every frame in updateFlameVisual from the live evolvedColor
  // computation), never touched per frame -- so toggling the colorblind
  // palette needs one explicit repaint here rather than picking the change
  // up automatically next frame.
  recolorRibbons(){
    const colors = this.ribbonColors();
    this.ribbons.forEach((ribbon, i) => ribbon.visual.setFillStyle(colors[i], ribbon.alpha));
  }

  emitLevelChanged(){
    this.game.events.emit('ui:levelChanged', {
      level: this.level,
      stageName: capabilitiesForLevel(this.level).name
    });
  }

  emitControlModeChanged(label: string){
    this.game.events.emit('ui:controlModeChanged', { label });
  }

  async toggleControlMode(){
    if(this.controlMode === 'gyroscope'){
      this.tilt.disable();
      this.controlMode = 'touch';
      this.emitControlModeChanged('TILT: OFF');
      return;
    }

    this.emitControlModeChanged('TILT: …');
    const granted = await this.tilt.enable();
    if(!granted){
      this.emitControlModeChanged('TILT: N/A');
      this.time.delayedCall(1200, () => { if(this.controlMode === 'touch') this.emitControlModeChanged('TILT: OFF'); });
      return;
    }

    this.controlMode = 'gyroscope';
    this.emitControlModeChanged('TILT: ON');
    // no per-enable fallback timer here -- update() checks
    // this.tilt.msSinceLastEvent() every frame and reverts to touch if the
    // sensor never starts (or later stops) delivering events, covering both
    // "no sensor" and "sensor went stale mid-session" with one check.
  }

  // flame-balance-tuner finding (2026-09-12, see BACKLOG.md [balance]): this used to also
  // require `flameSize >= PROGRESSION.minFlameSizeForLevel(nextLevel)` alongside the XP
  // check below, on the theory that physical growth and XP grinding were two independent
  // gates. They aren't -- flameSize is a deterministic function of the same `energy` this
  // XP check reads (see onFuelBurned above), and the risk-shrink block in update() keeps
  // energy and flameSize in lockstep even when shrinking (it clamps energy down to match
  // whatever flameSize the shrink produced). A binary search across levels 2/5/11/22/39/
  // 56/77 confirmed the size threshold is already satisfied at every one of those levels
  // by the time the XP threshold clears, so the size check never independently blocked a
  // level-up -- it was dead weight dressed up as a second progression axis. Removed here;
  // XP is the sole forward gate. `PROGRESSION.minFlameSizeForLevel` is not unused, though
  // -- it still does real, independent work in tryLevelDown() below, where it governs how
  // much shrinkage (from the risk system's overheat/fragile drain) it takes to demote a
  // level, and it triggers demotion *before* an XP-equivalent check would (its per-level
  // minimum is gentler than the XP curve's). If a "size matters" second axis is wanted for
  // *leveling up* specifically, that requires deliberately steepening this curve (a feel
  // decision, flagged to the user rather than picked here) -- see BACKLOG.md.
  tryLevelUp(){
    const before = this.level;
    while(this.level < PROGRESSION.totalLevels){
      const nextLevel = this.level + 1;
      const hasXp = this.energy >= PROGRESSION.xpForLevel(nextLevel);
      if(!hasXp) break;
      this.level = nextLevel;
    }
    if(this.level !== before){
      this.emitLevelChanged();
      this.audio.playLevelUp();
      this.playLevelUpFlourish();
      // A tier-up (only 7 per 77-level game) is strictly bigger news than an
      // ordinary level-up that happens to cross it -- layer a second,
      // distinct reaction on top rather than letting the two look identical
      // (flame-visual-designer finding, 2026-09-12).
      if(PROGRESSION.tierForLevel(this.level) > PROGRESSION.tierForLevel(before)){
        this.playTierUpFlourish();
      }
    }
  }

  // flame-visual-designer finding: a level-up previously changed only the HUD
  // label and played one tone -- no reaction on the flame body itself, which
  // is exactly the "single clean signal instead of layered feedback" shape
  // that reads as flat/static. A brief scale-pop (decaying yoyo, not a held
  // state) plus a matching glow-intensity spike gives the moment a second,
  // visual channel alongside the existing sound, without adding any new
  // gameplay state -- setRadius()/setSize() in updateFlameVisual() drive the
  // base size every frame regardless, and Phaser's .scale is an independent
  // transform on top of that, so the two don't fight each other.
  playLevelUpFlourish(){
    const motionScale = this.reducedMotion ? ACCESSIBILITY.reducedMotionScale : 1;
    const pop = 1 + 0.22 * motionScale;
    for(const target of [this.flame, this.core]){
      this.tweens.add({
        targets: target,
        scale: pop,
        duration: 90,
        yoyo: true,
        ease: 'Quad.Out'
      });
    }
    if(this.flameGlow){
      const baseOuter = this.flameGlow.outerStrength;
      this.flameGlow.outerStrength = baseOuter + 2.5 * motionScale;
      this.time.delayedCall(180, () => { if(this.flameGlow) this.flameGlow.outerStrength = baseOuter; });
    }
  }

  // flame-visual-designer finding (2026-09-12): a tier-up is only 7 per
  // 77-level game -- meaningfully rarer and bigger news than an ordinary
  // level-up crossing it, but before this it triggered the exact same
  // playLevelUpFlourish() and looked identical. This layers a second,
  // distinct reaction on top (called in addition to, not instead of, the
  // level-up flourish above) rather than just scaling up the same tween:
  // a longer/stronger scale-pop, a longer glow spike, and an expanding
  // "shockwave" ring rendered in the *new* tier's resting color (form.base)
  // -- a preview flash of the color family the flame is now evolving into,
  // distinct in shape (an expanding ring, not a body scale-pop) from
  // anything level-up already does. Respects reducedMotion the same way
  // every other amplitude-driven effect in this file does (damping, not
  // zeroing, per ACCESSIBILITY's own reasoning).
  playTierUpFlourish(){
    const motionScale = this.reducedMotion ? ACCESSIBILITY.reducedMotionScale : 1;
    const pop = 1 + 0.4 * motionScale;
    for(const target of [this.flame, this.core]){
      this.tweens.add({
        targets: target,
        scale: pop,
        duration: 220,
        yoyo: true,
        ease: 'Quad.Out'
      });
    }
    if(this.flameGlow){
      const baseOuter = this.flameGlow.outerStrength;
      this.flameGlow.outerStrength = baseOuter + 5 * motionScale;
      this.time.delayedCall(420, () => { if(this.flameGlow) this.flameGlow.outerStrength = baseOuter; });
    }

    const form = formForLevel(this.level, this.palette());
    const ring = this.add.circle(this.flame.x, this.flame.y, this.flameSize * 0.9, form.base, 0.5)
      .setDepth(8)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: ring,
      radius: this.flameSize * (1.6 + 1.4 * motionScale),
      alpha: 0,
      duration: 520,
      ease: 'Cubic.Out',
      onUpdate: () => ring.setPosition(this.flame.x, this.flame.y),
      onComplete: () => ring.destroy()
    });

    // A second, larger particle burst on top of the ambient ember trickle --
    // same reasoning as ignite's existing particle burst, just bigger, since
    // a tier-up is a bigger event than a single ignition.
    this.particles.setPosition(this.flame.x, this.flame.y);
    this.particles.explode(10);
  }

  // Loose end from the mobile-perf/visual audit pass: tier-down (the risk
  // system's overheat/fragile shrink demoting a level enough to cross back
  // below a tier boundary) had zero discrete reaction -- audioData.ts's own
  // comment on levelUp used to note this explicitly ("no matching sound on
  // tryLevelDown()"). Tier-up already telegraphs its own approach
  // continuously (heat/stability already drive wobble/color/particles as
  // they climb toward the risk thresholds), so this only needed the same
  // "the moment itself" treatment tier-up already has -- distinct in
  // direction, not just a copy: a shrink (not grow) pop, a glow dip (not
  // spike), and a *contracting* ring (starts wide, closes to nothing) in
  // the *old* tier's dim/calm color (form.calm, a fading-out cue) rather
  // than tier-up's expanding ring in the new tier's hot base color (a
  // preview-of-what's-next cue) -- the two should never read as the same
  // event played in reverse.
  playTierDownFlourish(){
    const motionScale = this.reducedMotion ? ACCESSIBILITY.reducedMotionScale : 1;
    const shrink = 1 - 0.22 * motionScale;
    for(const target of [this.flame, this.core]){
      this.tweens.add({
        targets: target,
        scale: shrink,
        duration: 200,
        yoyo: true,
        ease: 'Quad.In'
      });
    }
    if(this.flameGlow){
      const baseOuter = this.flameGlow.outerStrength;
      const dip = Math.max(0, baseOuter - 4 * motionScale);
      this.flameGlow.outerStrength = dip;
      this.time.delayedCall(380, () => { if(this.flameGlow) this.flameGlow.outerStrength = baseOuter; });
    }

    const form = formForLevel(this.level, this.palette());
    const ring = this.add.circle(this.flame.x, this.flame.y, this.flameSize * (1.6 + 1.2 * motionScale), form.calm, 0.4)
      .setDepth(8)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: ring,
      radius: this.flameSize * 0.2,
      alpha: 0,
      duration: 460,
      ease: 'Cubic.In',
      onUpdate: () => ring.setPosition(this.flame.x, this.flame.y),
      onComplete: () => ring.destroy()
    });
  }

  // flame-visual-designer finding (2026-09-13, BACKLOG.md [visual]): the
  // "one particle burst + one audio ping" shape level-up/tier-up used to
  // have and no longer do (see playLevelUpFlourish/playTierUpFlourish above)
  // was still true of finishBurn() -- a burn completing (fuel actually gone,
  // XP awarded, scorch mark placed) got a particle burst and nothing on the
  // flame body itself. Deliberately *not* added to ignite() instead: it's
  // the single most frequent event in the game and a cascade chain
  // (tryCascade in MatterRegistry) can call ignite() many times in one
  // frame, so a per-ignite body reaction would pile into overlapping,
  // jittery tweens during exactly the moments already the most visually
  // busy. finishBurn() calls land staggered across each fuel's own
  // burn-duration timer instead (see MatterHost.onBurnComplete's comment),
  // so it doesn't have that pile-up problem. intensity (0..1, the burning
  // fuel's radius normalized against the largest tier's max radius) scales
  // the reaction down to near-nothing for the common small kindling/brush
  // burns that make up most of the game's volume, and up to a clearly
  // visible (but still smaller than a level-up's) pop for a rare large
  // embercore burn -- reuses the same scale-pop + glow-spike shape as
  // playLevelUpFlourish rather than inventing a third visual language.
  playBurnCompleteFlourish(intensity: number){
    const motionScale = this.reducedMotion ? ACCESSIBILITY.reducedMotionScale : 1;
    const pop = 1 + (0.04 + intensity * 0.10) * motionScale;
    const duration = 70 + intensity * 40;
    for(const target of [this.flame, this.core]){
      this.tweens.add({
        targets: target,
        scale: pop,
        duration,
        yoyo: true,
        ease: 'Quad.Out'
      });
    }
    if(this.flameGlow){
      const baseOuter = this.flameGlow.outerStrength;
      const spike = (0.4 + intensity * 1.6) * motionScale;
      this.flameGlow.outerStrength = baseOuter + spike;
      this.time.delayedCall(duration + 20, () => { if(this.flameGlow) this.flameGlow.outerStrength = baseOuter; });
    }
  }

  // No longer a mirror of tryLevelUp() (which is XP-only, see above) -- this is the one
  // remaining consumer of PROGRESSION.minFlameSizeForLevel. Shrinking (see the risk-shrink
  // block in update()) below a level's own size requirement demotes it, re-gating whatever
  // matter/capabilities that level had unlocked. This still does real, independent work:
  // the size curve's per-level minimum is gentler than the XP curve's, so demotion fires
  // sooner (at less energy/size lost) than an XP-equivalent check would.
  tryLevelDown(){
    const before = this.level;
    while(this.level > 1 && this.flameSize < PROGRESSION.minFlameSizeForLevel(this.level)){
      this.level--;
    }
    if(this.level !== before){
      this.emitLevelChanged();
      // Mirrors tryLevelUp()'s own tier-crossing check above -- only a
      // tier-boundary crossing gets the discrete reaction, not every
      // ordinary demotion (same "only the rarer, bigger event" reasoning).
      if(PROGRESSION.tierForLevel(this.level) < PROGRESSION.tierForLevel(before)){
        this.audio.playTierDown();
        this.playTierDownFlourish();
      }
    }
  }

  // Phase 11: event-driven (called from onFuelBurned, same pattern as
  // cascades), not a per-frame poll. The world is "consumed" once every
  // fuel instance ever spawned into it -- including ones burned in prior
  // worlds before a regenerate() -- has alive === false. Because
  // MatterRegistry.finishBurn sets fuel.alive = false before invoking this
  // callback, and regenerate() replaces the whole fuels array in one
  // synchronous call, this check is always evaluated against exactly the
  // world currently in play.
  checkWorldConsumed(){
    if(this.matterSystem.fuels.length === 0) return;
    if(!this.matterSystem.fuels.every(f => !f.alive)) return;

    // Points scale with the strength of the world just cleared, computed
    // BEFORE escalating worldStrength for the next world.
    const pointsAwarded = Math.round(
      ENDGAME.pointsBase * this.worldStrength * (1 + this.skillTree.pointsYieldBonus())
    );
    // award() itself detects the unlocked false->true transition now (see
    // SkillTreeManager) -- the burn trickle can trigger it first in practice,
    // so this can no longer assume it's the only unlock path.
    const justUnlocked = this.skillTree.award(pointsAwarded);

    if(this.worldsCleared === 0){
      this.worldStrength *= ENDGAME.firstEscalationMultiplier;
    } else {
      const [min, max] = ENDGAME.escalationRandomRange;
      this.worldStrength *= 1 + Phaser.Math.FloatBetween(min, max);
    }
    this.worldsCleared++;
    // PROGRESSION_QUEUE.md item 3: a separate Mastery-domain counter from
    // worldsCleared above -- that field drives ENDGAME's own escalation
    // formula and isn't itself a Mastery concept, even though both
    // increment at this same real-world moment (see MasteryTracker's
    // worldsCleared comment).
    this.mastery.recordWorldCleared();

    // Flame keeps its current level/size/evolution/heat/stability -- only
    // the world's fuel/matter resets and gets tougher.
    this.world.regenerate(this.worldStrength);

    this.audio.playWorldClear();
    if(justUnlocked) this.game.events.emit('ui:skillTreeUnlocked');
    this.emitSkillTreeChanged();
  }

  emitSkillTreeChanged(){
    this.game.events.emit('ui:skillTreeChanged', {
      points: this.skillTree.points,
      nodes: SKILL_TREE.map(n => ({
        id: n.id,
        name: n.name,
        cost: n.cost,
        owned: this.skillTree.purchased.has(n.id),
        afford: this.skillTree.canAfford(n)
      }))
    });
  }

  createParticles(){
    const g = this.make.graphics({x:0, y:0}, false);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();

    this.particles = this.add.particles(0, 0, 'particle', {
      speed:{min:FLAME_VISUAL.particles.emberSpeedMin,max:FLAME_VISUAL.particles.emberSpeedMax},
      lifespan:{min:FLAME_VISUAL.particles.emberLifeMin,max:FLAME_VISUAL.particles.emberLifeMax},
      scale:{start:.9,end:0},
      alpha:{start:.55,end:0},
      quantity:0,
      emitting:false,
      blendMode:Phaser.BlendModes.ADD
    });
  }

  updateFlameVisual(t:number, dtS:number){
    const currentDirection = Math.atan2(this.velocity.y, this.velocity.x || 1);
    // Phaser.Math.Angle.Wrap already clamps its result to [-PI, PI], so
    // directionDelta can never exceed that range -- no extra guard needed.
    const directionDelta = Phaser.Math.Angle.Wrap(currentDirection - this.lastDirection);

    this.stability = Phaser.Math.Clamp(
      this.stability - Math.abs(directionDelta) * GROWTH.instabilityFromDirectionChange * 0.01,
      GROWTH.minStability,
      GROWTH.maxStability
    );

    this.stability = Phaser.Math.Clamp(
      this.stability + dtS * GROWTH.stabilityRecoveryPerSecond,
      GROWTH.minStability,
      GROWTH.maxStability
    );
    this.lastDirection = currentDirection;

    // Phase 14: reduced motion dampens (doesn't zero) every sine-driven
    // amplitude term below -- wobble, ribbon sway/jitter, halo pulsing --
    // by the same scale factor, rather than special-casing each source.
    const motionScale = this.reducedMotion ? ACCESSIBILITY.reducedMotionScale : 1;

    const wobble = 1
      + Math.sin(t * 0.012) * (0.06 + (1 - this.stability) * 0.08) * motionScale
      + Math.sin(t * 0.027) * 0.035 * motionScale;
    const speed = Phaser.Math.Clamp(this.velocity.length() / 180, 0, 1);
    const heatStretch = 1 + this.heat * 0.12;
    const flameAlpha = 0.84 + this.heat * 0.13;

    const form = formForLevel(this.level, this.palette());
    const settledColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(form.base),
      Phaser.Display.Color.ValueToColor(form.calm),
      100,
      Math.round(this.stability * 100)
    );
    const evolvedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(settledColor.color),
      Phaser.Display.Color.ValueToColor(form.hot),
      100,
      Math.round(this.heat * 100)
    ).color;

    this.flame.setRadius(this.flameSize * wobble);
    this.flame.setAlpha(flameAlpha);
    this.flame.setPosition(this.flame.x, this.flame.y);
    this.flame.setFillStyle(evolvedColor, flameAlpha);
    // Glow tracks the flame's actual current color (heat/stability-blended,
    // evolution-form-based) rather than staying frozen at creation-time hue.
    if(this.flameGlow) this.flameGlow.color = evolvedColor;

    const coreColor = Phaser.Display.Color.ValueToColor(evolvedColor).lighten(35).color;
    this.core.setPosition(this.flame.x, this.flame.y);
    this.core.setSize(
      this.flameSize * 0.72 * (1 + speed * 0.3),
      this.flameSize * 1.25 * heatStretch
    );
    this.core.setFillStyle(coreColor, 0.82);
    this.core.setAlpha(0.76 + this.heat * 0.2);
    this.core.rotation = currentDirection + Math.PI / 2;
    if(this.coreGlow) this.coreGlow.color = coreColor;

    this.halo
      .setPosition(this.flame.x, this.flame.y)
      .setRadius(this.flameSize * (2.0 + 0.28 * this.heat + 0.22 * motionScale * Math.sin(t * 0.008)))
      .setAlpha(Math.min(0.19, 0.035 + this.flameSize / 700 + this.heat * 0.05));

    for(const ribbon of this.ribbons){
      const s = Math.sin(t * ribbon.speed + ribbon.phase);
      const c = Math.cos(t * ribbon.speed * 0.73 + ribbon.phase * 0.8);
      const stretch = 1 + speed * FLAME_VISUAL.motion.stretch * 0.18 + this.heat * 0.16;
      const instability = 1 + (1 - this.stability) * 0.28;

      // independent per-ribbon jitter so tips flicker/taper unevenly
      // rather than every lobe swaying in perfect lockstep
      const jitter = Math.sin(t * ribbon.jitterSpeed + ribbon.jitterPhase) * FLAME_VISUAL.motion.tipJitter * motionScale;

      ribbon.visual.setPosition(
        this.flame.x + s * this.flameSize * FLAME_VISUAL.motion.swayAmplitude * motionScale * (0.7 + speed) * instability,
        this.flame.y - c * this.flameSize * (0.22 + this.heat * 0.08)
      );

      ribbon.visual.setSize(
        this.flameSize * (0.38 + ribbon.width * 0.05) * ribbon.lobeScale * (1 + this.heat * 0.08 + jitter),
        // matches createFlameBody()'s bumped 3.4-3.8 base -- see the comment
        // there. Keeps the same lobeScale/stretch/jitter modulation, just on
        // a taller base so tips clear the flame body's opaque circle instead
        // of rendering fully hidden underneath it.
        this.flameSize * (3.2 + ribbon.height * 0.3) * ribbon.lobeScale * stretch * (1 - jitter * 0.6)
      );
      ribbon.visual.rotation = currentDirection + Math.PI / 2 + s * (0.28 + this.heat * 0.1) + jitter * 0.3;
      ribbon.visual.setAlpha(Math.min(0.38, ribbon.alpha + this.flameSize / 5000 + this.heat * 0.05));
    }
  }

  update(t:number, dt:number){
    const dtS = dt / 1000;

    if(this.controlMode === 'gyroscope'){
      // checked every frame, not just once after enabling -- a sensor that
      // stops delivering events mid-session (permission revoked, OS
      // suspends it on background/foreground) would otherwise leave
      // steering permanently frozen with no recovery.
      if(this.tilt.msSinceLastEvent() > TILT_CONTROL.fallbackTimeoutMs){
        this.tilt.disable();
        this.controlMode = 'touch';
        this.emitControlModeChanged('TILT: N/A');
        this.time.delayedCall(1200, () => { if(this.controlMode === 'touch') this.emitControlModeChanged('TILT: OFF'); });
      } else if(this.tilt.hasBaseline){
        const steer = this.tilt.read(TILT_CONTROL.maxTiltDegrees);
        this.target.set(
          this.flame.x + steer.x * TILT_CONTROL.lookaheadPx,
          this.flame.y + steer.y * TILT_CONTROL.lookaheadPx
        );
      }
    }

    const desired = new Phaser.Math.Vector2(
      this.target.x - this.flame.x,
      this.target.y - this.flame.y
    ).scale(5.2);

    // Movement feedback slice: stability already degrades from erratic
    // steering (see updateFlameVisual below) but never fed back into
    // movement itself -- a fragile flame now steers noisily, not just
    // cosmetically. Rotating desired (rather than velocity directly) keeps
    // the error proportional to how far off-target the flame already is,
    // instead of injecting a constant wobble regardless of intent.
    if(this.stability < GROWTH.maxStability){
      const errorAngle = Phaser.Math.FloatBetween(-1, 1)
        * GROWTH.maxSteeringErrorRad * (1 - this.stability);
      desired.rotate(errorAngle);
    }

    this.velocity.lerp(desired, Math.min(1, dtS * 5.5));

    // Heat -> speed: a hot flame is more eager to close distance, mirroring
    // what heat already does to its glow/stretch (movement feedback slice).
    const maxSpeed = (90 + this.flameSize * 8) * capabilitiesForLevel(this.level).speedMultiplier
      * (1 + this.skillTree.speedBonus())
      * (1 + this.heat * GROWTH.heatSpeedBonus);
    if(this.velocity.length() > maxSpeed) this.velocity.setLength(maxSpeed);

    const prevX = this.flame.x;
    const prevY = this.flame.y;
    this.flame.x = Phaser.Math.Clamp(this.flame.x + this.velocity.x * dtS, 10, WORLD.width - 10);
    this.flame.y = Phaser.Math.Clamp(this.flame.y + this.velocity.y * dtS, 10, WORLD.height - 10);
    // PROGRESSION_QUEUE.md item 3: cumulative scalar distance, accumulated
    // from the flame's own per-frame movement delta (post-clamp, so a frame
    // that hits the world bounds only counts the distance actually moved).
    this.mastery.addDistance(Phaser.Math.Distance.Between(prevX, prevY, this.flame.x, this.flame.y));

    this.heat = Math.max(0, this.heat - GROWTH.heatDecayPerSecond * dtS);
    // Continuous state, not a discrete event -- cheap AudioParam sets each
    // frame, same reasoning that already justifies every other per-frame
    // heat-driven visual update (see updateFlameVisual below).
    this.audio.setAmbientIntensity(this.heat);

    const fragileThreshold = RISK.fragileThreshold - this.skillTree.stabilityFloorBonus();
    if(this.heat >= RISK.overheatThreshold || this.stability <= fragileThreshold){
      const targetSize = Math.max(GROWTH.baseFlameSize, this.flameSize - RISK.shrinkPerSecond * dtS);
      if(targetSize < this.flameSize){
        const targetEnergy = Math.pow((targetSize - GROWTH.baseFlameSize) / GROWTH.sizeEnergyFactor, 2);
        this.energy = Math.min(this.energy, targetEnergy);
        this.flameSize = targetSize;
        this.tryLevelDown();
      }
    }

    this.updateFlameVisual(t, dtS);

    this.matterSystem.updateAll(t, dt);

    this.particles.setPosition(this.flame.x, this.flame.y);
    if(Math.random() < FLAME_VISUAL.particles.emberChance + this.heat * 0.12) this.particles.explode(1);
  }
}

new Phaser.Game({
  type:Phaser.AUTO,
  parent:'game',
  width:window.innerWidth,
  height:window.innerHeight,
  backgroundColor:'#080604',
  scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight},
  render:{antialias:true,powerPreference:'high-performance'},
  // Phase 15: TitleScene is first, so it auto-starts and boots before
  // FlameScene/UIScene begin simulating or rendering anything (Phaser only
  // auto-starts index 0 of a scene array) -- the player must tap through
  // the title screen before gameplay starts. FlameScene still calls
  // this.scene.launch('ui') itself once it starts.
  scene:[TitleScene, FlameScene, UIScene]
});
