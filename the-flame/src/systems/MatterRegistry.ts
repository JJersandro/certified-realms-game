import Phaser from 'phaser/dist/phaser-arcade-physics.js';
import { FlamePalette } from '../data/flameVisualData';
import { BURNING } from '../data/burningData';
import { GROWTH } from '../data/growthData';
import { MATTER, MatterTier } from '../data/matterData';
import { CHOICES } from '../data/choiceData';
import { AUDIO } from '../data/audioData';

type BurnState = 'idle' | 'burning';

export type Fuel = {
  x: number;
  y: number;
  r: number;
  maxHp: number;
  hp: number;
  xpYield: number;
  alive: boolean;
  pulse: number;
  tier: MatterTier;
  burnState: BurnState;
  // ms of continuous contact while not yet ignitable -- crossing
  // CHOICES.riskyIgnition.holdMs force-ignites at a cost (see updateFuel).
  forceProgress: number;
  forcedBonus: boolean;
  visual: Phaser.GameObjects.Arc;
  burnVisual: Phaser.GameObjects.Arc;
};

export type FlameSnapshot = {
  x: number;
  y: number;
  size: number;
  level: number;
  // scale-tier reach bonus (see scaleData.ts) -- multiplies BURNING's base
  // contactRadiusMultiplier, so higher tiers reach further as well as
  // moving faster.
  contactRadiusMultiplier: number;
  // Phase 11 skill tree bonuses -- MatterRegistry has no direct reference
  // to SkillTreeManager, so these arrive pre-computed each frame via
  // getFlame() rather than reaching for a new Host callback.
  cascadeChanceBonus: number;
  xpYieldMultiplier: number;
  // Movement/spread feedback slice (owner build plan, 2026-09-14): 0-1
  // current heat, same value already driving wobble/color/glow every frame
  // in FlameScene -- threaded through here so tryCascade() can read it too,
  // the same "arrives pre-computed via getFlame()" pattern as the two
  // skill-tree bonuses above.
  heat: number;
  // Phase 14: the colorblind-safe palette toggle lives on FlameScene --
  // same "arrives pre-computed via getFlame()" pattern as the skill-tree
  // bonuses above, so burnVisual/scorch colors (the two remaining
  // FLAME_VISUAL.palette reads MatterRegistry owned) stay in sync with it.
  palette: FlamePalette;
};

export type MatterHost = {
  scene: Phaser.Scene;
  particles: Phaser.GameObjects.Particles.ParticleEmitter;
  scorches: Phaser.GameObjects.Arc[];
  getFlame: () => FlameSnapshot;
  addHeat: (amount: number) => void;
  applyStabilityPenalty: (amount: number) => void;
  onFuelBurned: (xpYield: number) => void;
  // Phase 13: pure "something happened" notifications for AudioManager --
  // MatterRegistry has no direct reference to it, same reasoning as the
  // getFlame() skill-tree bonuses above.
  onIgnite: () => void;
  onEmberCrackle: () => void;
  // flame-visual-designer finding (2026-09-13, BACKLOG.md [visual]): ignite()
  // is deliberately left with only its existing single burst+ping -- a
  // cascade chain (tryCascade below) can call ignite() many times in one
  // frame/tick, so a per-ignite flame-body reaction would pile into
  // overlapping, jittery tweens during exactly the moments that are already
  // the most visually busy. finishBurn() ("this fuel is actually gone, XP
  // awarded") doesn't have that problem -- a cascade's several finishBurn()
  // calls land staggered across each fuel's own independent burn-duration
  // timer (duration scales with fuel.r, so even same-tier fuel rarely
  // finishes on the same tick), not stacked in one frame. intensity is the
  // burning fuel's own radius normalized against the largest tier's max
  // radius (see finishBurn), so common small kindling/brush burns (most of
  // the game's volume) get a barely-there flourish and rare large embercore
  // burns get a bigger one.
  onBurnComplete: (intensity: number) => void;
  // PROGRESSION_QUEUE.md item 3 (Mastery counters) -- same "pure
  // notification, no return value" shape as onIgnite/onEmberCrackle/
  // onBurnComplete above: MatterRegistry has no direct reference to
  // MasteryTracker, so FlameScene wires each of these three straight to a
  // MasteryTracker.record*() call, the same way it wires the audio/visual
  // callbacks above. tierId is a burned fuel's own fuel.tier.id.
  onMasteryBurn: (tierId: number) => void;
  onCascadeTriggered: () => void;
  onRiskyIgnitionSurvived: () => void;
};

const defaultSpawnWeights = MATTER.map(tier => tier.spawnWeight);

// Normalization anchor for finishBurn()'s intensity argument -- the largest
// radius any tier can ever spawn (embercore's radiusMax), so intensity is a
// stable 0..1 scale across every tier/instance rather than something that
// shifts if MATTER's per-tier ranges are retuned later.
const maxFuelRadius = MATTER.reduce((max, tier) => Math.max(max, tier.radiusMax), 0);

export type SpawnBounds = { x: number; y: number; w: number; h: number };

export class MatterRegistry {
  fuels: Fuel[] = [];

  constructor(private host: MatterHost){}

  private pickTier(weights: readonly number[]): MatterTier {
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * total;
    for(let i = 0; i < MATTER.length; i++){
      roll -= weights[i];
      if(roll <= 0) return MATTER[i];
    }
    return MATTER[MATTER.length - 1];
  }

  // bounds/weights default to the whole viewport and MATTER's own global
  // weights (Phase 4 behavior) -- pass a world region's bounds/tierWeights
  // to spawn scoped to that region instead (see WorldManager). hpMultiplier
  // is Phase 11's world-escalation knob -- WorldManager passes the current
  // worldStrength so every subsequent world's matter is tougher, not just
  // more numerous.
  spawnFuel(bounds?: SpawnBounds, weights: readonly number[] = defaultSpawnWeights, hpMultiplier = 1){
    const scene = this.host.scene;
    const margin = 45;
    const b = bounds ?? { x: 0, y: 0, w: scene.scale.width, h: scene.scale.height };
    const x = Phaser.Math.Between(b.x + margin, Math.max(b.x + margin, b.x + b.w - margin));
    const y = Phaser.Math.Between(b.y + margin, Math.max(b.y + margin, b.y + b.h - margin));

    const flame = this.host.getFlame();
    if(Phaser.Math.Distance.Between(x, y, flame.x, flame.y) < BURNING.safeZoneRadius) return;

    const tier = this.pickTier(weights);
    const r = Phaser.Math.Between(tier.radiusMin, tier.radiusMax);
    const maxHp = r * tier.maxHpPerRadius * hpMultiplier;

    const visual = scene.add.circle(x, y, r, tier.color, 0.78).setDepth(1);
    const burnVisual = scene.add.circle(x, y, r * 0.65, flame.palette.core, 0)
      .setDepth(2).setBlendMode(Phaser.BlendModes.ADD);

    this.fuels.push({
      x,
      y,
      r,
      maxHp,
      hp: maxHp,
      xpYield: r * r * tier.xpFactor,
      alive: true,
      pulse: Math.random() * Math.PI * 2,
      tier,
      burnState: 'idle',
      forceProgress: 0,
      forcedBonus: false,
      visual,
      burnVisual
    });
  }

  ignite(fuel: Fuel){
    if(fuel.burnState !== 'idle') return;
    // Single choke point every ignition path (direct contact, forced hold,
    // cascade link) funnels through -- wiring the ping here for free gives
    // a rapid-fire ignite-ping texture during a cascade chain with no
    // extra cascade-specific sound.
    this.host.onIgnite();
    fuel.burnState = 'burning';
    fuel.visual.setAlpha(0.42);
    fuel.burnVisual.setAlpha(BURNING.burnPulse.alpha);
    fuel.burnVisual.setScale(0.75);
    this.host.addHeat(0.08);
    this.host.particles.setPosition(fuel.x, fuel.y);
    this.host.particles.explode(Phaser.Math.Between(BURNING.emberBurst.min, Math.min(BURNING.emberBurst.max, 8)));
  }

  // cascading destruction: a fuel that just caught fire can chain-ignite
  // nearby idle matter, which can itself chain further -- recursion is
  // naturally bounded since ignite() is a no-op on anything not idle, so
  // each fuel enters this chain at most once.
  //
  // Returns whether *this specific call* caught at least one further fuel --
  // used by updateFuel()'s two call sites (below) to decide whether to
  // report a Mastery "cascade triggered" event (PROGRESSION_QUEUE.md item
  // 3). Deliberately counts once per chain-initiating ignition, not once
  // per fuel a chain catches: the recursive `this.tryCascade(other, flame)`
  // calls below are continuations of the same chain reaction, not new
  // triggers, so their own return values are intentionally ignored here --
  // only the outer call (from updateFuel, where a player-caused ignition
  // starts the chain) is ever read by a caller that acts on it. A chain that
  // catches zero fuel at its own immediate radius never happened at all for
  // counting purposes, regardless of what a caught fuel's own recursion
  // might otherwise have done.
  private tryCascade(source: Fuel, flame: FlameSnapshot): boolean {
    const radius = source.r * source.tier.cascadeRadiusMultiplier;
    let caughtAny = false;
    for(const other of this.fuels){
      if(other === source || !other.alive || other.burnState !== 'idle') continue;
      if(flame.level < other.tier.minLevelToIgnite) continue;
      // Heat -> spread (movement/spread feedback slice): a flame running
      // hot spreads fire more readily, on top of the tier's own base chance
      // and the existing skill-tree bonus.
      const cascadeChance = Math.min(1, source.tier.cascadeChance + flame.cascadeChanceBonus
        + flame.heat * BURNING.heatCascadeBonus);
      if(Math.random() >= cascadeChance) continue;

      const dist = Phaser.Math.Distance.Between(source.x, source.y, other.x, other.y);
      if(dist > radius) continue;

      caughtAny = true;
      this.ignite(other);
      this.tryCascade(other, flame);
    }
    return caughtAny;
  }

  finishBurn(fuel: Fuel, flame: FlameSnapshot){
    if(!fuel.alive) return;

    fuel.alive = false;
    fuel.burnState = 'idle';
    const baseXp = fuel.forcedBonus
      ? fuel.xpYield * CHOICES.riskyIgnition.xpBonusMultiplier
      : fuel.xpYield;
    const xpYield = baseXp * flame.xpYieldMultiplier;
    this.host.onFuelBurned(xpYield);
    this.host.addHeat(fuel.r / 22);
    this.host.onBurnComplete(Phaser.Math.Clamp(fuel.r / maxFuelRadius, 0, 1));
    // Mastery burns-per-tier (PROGRESSION_QUEUE.md item 3): this is the
    // point a burn actually completes, same as the onFuelBurned/
    // onBurnComplete calls right above -- fuel.tier is still the same
    // object it was created with, so fuel.tier.id correctly identifies
    // which of the 7 tier counters to increment.
    this.host.onMasteryBurn(fuel.tier.id);

    this.host.particles.setPosition(fuel.x, fuel.y);
    this.host.particles.explode(Phaser.Math.Clamp(Math.floor(fuel.r * 2.2), BURNING.emberBurst.min, BURNING.emberBurst.max));

    const scorch = this.host.scene.add.circle(
      fuel.x,
      fuel.y,
      fuel.r * BURNING.scorch.radiusMultiplier,
      flame.palette.emberRed,
      BURNING.scorch.alpha
    ).setDepth(0);

    this.host.scorches.push(scorch);
    this.host.scene.tweens.add({
      targets: scorch,
      alpha: 0.11,
      duration: BURNING.scorch.fadeMs,
      ease: 'Sine.Out'
    });

    fuel.visual.destroy();
    fuel.burnVisual.destroy();
  }

  private updateFuel(fuel: Fuel, t: number, dt: number, flame: FlameSnapshot){
    if(!fuel.alive) return;

    if(fuel.burnState === 'idle'){
      const ignitable = flame.level >= fuel.tier.minLevelToIgnite;

      const inContact = Phaser.Math.Distance.Between(flame.x, flame.y, fuel.x, fuel.y)
        < (flame.size + fuel.r) * BURNING.contactRadiusMultiplier * flame.contactRadiusMultiplier;

      if(inContact && ignitable){
        fuel.forceProgress = 0;
        this.ignite(fuel);
        if(this.tryCascade(fuel, flame)) this.host.onCascadeTriggered();
        return;
      }

      if(inContact && !ignitable){
        fuel.forceProgress += dt;
        const charge = Phaser.Math.Clamp(fuel.forceProgress / CHOICES.riskyIgnition.holdMs, 0, 1);

        // charging visual: the fuel itself swells and its core glow ramps
        // up, so holding contact visibly reads as "committing" without
        // any text or prompt.
        fuel.visual.setScale(1 + charge * 0.35);
        fuel.visual.setAlpha(0.4 + charge * 0.4);
        fuel.burnVisual.setAlpha(charge * 0.5);
        fuel.burnVisual.setScale(0.5 + charge * 0.5);

        if(fuel.forceProgress >= CHOICES.riskyIgnition.holdMs){
          fuel.forcedBonus = true;
          this.host.addHeat(CHOICES.riskyIgnition.heatPenalty);
          this.host.applyStabilityPenalty(CHOICES.riskyIgnition.stabilityPenalty);
          // The risky-ignition hold is already known to have succeeded at
          // this exact point (forceProgress just crossed holdMs) -- "survived"
          // (PROGRESSION_QUEUE.md item 3) means "completed," since this
          // mechanic has no separate fail state to survive (releasing
          // contact early just resets forceProgress to 0 above, penalty-free).
          this.host.onRiskyIgnitionSurvived();
          this.ignite(fuel);
          if(this.tryCascade(fuel, flame)) this.host.onCascadeTriggered();
        }
        return;
      }

      // not in contact -- reset any partial charge and rest at the
      // normal idle look (dimmer while gated, to signal "not ready yet").
      fuel.forceProgress = 0;
      fuel.visual.setScale(1 + Math.sin(t * 0.003 + fuel.pulse) * 0.06);
      fuel.visual.setAlpha(ignitable ? 0.78 : 0.4);
      fuel.burnVisual.setAlpha(0);
      return;
    }

    fuel.hp -= fuel.tier.drainPerMs * dt;
    const pulse = 1 + Math.sin(t * BURNING.burnPulse.frequency + fuel.pulse) * BURNING.burnPulse.scale;
    const progress = Phaser.Math.Clamp(1 - fuel.hp / fuel.maxHp, 0, 1);

    fuel.visual.setScale(1 + progress * 0.16);
    fuel.visual.setAlpha(Math.max(0.08, 0.42 - progress * 0.28));
    fuel.burnVisual.setScale((0.75 + progress * 0.7) * pulse);
    fuel.burnVisual.setAlpha(BURNING.burnPulse.alpha + progress * 0.2);

    this.host.addHeat((GROWTH.heatRisePerBurnSecond * dt) / 1000);

    this.host.particles.setPosition(fuel.x, fuel.y);
    if(Math.random() < 0.15 + progress * 0.16) this.host.particles.explode(1);
    // Same ember-particle-chance shape, but divided down so ~150-250
    // simultaneously-burning fuel instances in a dense cluster don't turn
    // into audio mush -- an independent random draw, not reusing the
    // particle roll above.
    if(Math.random() < (0.15 + progress * 0.16) / AUDIO.emberCrackle.probabilityDivisor) this.host.onEmberCrackle();

    if(fuel.hp <= 0) this.finishBurn(fuel, flame);
  }

  updateAll(t: number, dt: number){
    const flame = this.host.getFlame();
    for(const fuel of this.fuels) this.updateFuel(fuel, t, dt, flame);
  }

  // Burn marks (this.host.scorches) are pushed to in finishBurn() and never
  // removed on their own -- a session that clears several escalating worlds
  // (see WorldManager.regenerate()) would otherwise accumulate scorches from
  // every world it ever passed through, unbounded for the life of the tab.
  // Called from WorldManager.regenerate() so a freshly generated world starts
  // with a clean canvas instead of showing the previous world's burn marks.
  // Lives here (not on WorldManager) because scorches are matter/burn-mark
  // state that MatterRegistry already owns via the host reference, not
  // world-region state.
  clearScorches(){
    for(const scorch of this.host.scorches) scorch.destroy();
    this.host.scorches.length = 0;
  }
}
