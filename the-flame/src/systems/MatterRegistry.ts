import Phaser from 'phaser';
import { FLAME_VISUAL } from '../data/flameVisualData';
import { BURNING } from '../data/burningData';
import { GROWTH } from '../data/growthData';
import { MATTER, MatterTier } from '../data/matterData';

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
  visual: Phaser.GameObjects.Arc;
  burnVisual: Phaser.GameObjects.Arc;
};

export type FlameSnapshot = { x: number; y: number; size: number; level: number };

export type MatterHost = {
  scene: Phaser.Scene;
  particles: Phaser.GameObjects.Particles.ParticleEmitter;
  scorches: Phaser.GameObjects.Arc[];
  getFlame: () => FlameSnapshot;
  addHeat: (amount: number) => void;
  onFuelBurned: (xpYield: number) => void;
};

const totalSpawnWeight = MATTER.reduce((sum, tier) => sum + tier.spawnWeight, 0);

export class MatterRegistry {
  fuels: Fuel[] = [];

  constructor(private host: MatterHost){}

  private pickTier(): MatterTier {
    let roll = Math.random() * totalSpawnWeight;
    for(const tier of MATTER){
      roll -= tier.spawnWeight;
      if(roll <= 0) return tier;
    }
    return MATTER[MATTER.length - 1];
  }

  spawnFuel(){
    const scene = this.host.scene;
    const margin = 45;
    const width = scene.scale.width;
    const height = scene.scale.height;
    const x = Phaser.Math.Between(margin, Math.max(margin, width - margin));
    const y = Phaser.Math.Between(80, Math.max(80, height - margin));

    const flame = this.host.getFlame();
    if(Phaser.Math.Distance.Between(x, y, flame.x, flame.y) < 120) return;

    const tier = this.pickTier();
    const r = Phaser.Math.Between(tier.radiusMin, tier.radiusMax);
    const maxHp = r * tier.maxHpPerRadius;

    const visual = scene.add.circle(x, y, r, tier.color, 0.78).setDepth(1);
    const burnVisual = scene.add.circle(x, y, r * 0.65, FLAME_VISUAL.palette.core, 0)
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
      visual,
      burnVisual
    });
  }

  ignite(fuel: Fuel){
    if(fuel.burnState !== 'idle') return;
    fuel.burnState = 'burning';
    fuel.visual.setAlpha(0.42);
    fuel.burnVisual.setAlpha(BURNING.burnPulse.alpha);
    fuel.burnVisual.setScale(0.75);
    this.host.addHeat(0.08);
    this.host.particles.setPosition(fuel.x, fuel.y);
    this.host.particles.explode(Phaser.Math.Between(BURNING.emberBurst.min, Math.min(BURNING.emberBurst.max, 8)));
  }

  finishBurn(fuel: Fuel){
    if(!fuel.alive) return;

    fuel.alive = false;
    fuel.burnState = 'idle';
    this.host.onFuelBurned(fuel.xpYield);
    this.host.addHeat(fuel.r / 22);

    this.host.particles.setPosition(fuel.x, fuel.y);
    this.host.particles.explode(Phaser.Math.Clamp(Math.floor(fuel.r * 2.2), BURNING.emberBurst.min, BURNING.emberBurst.max));

    const scorch = this.host.scene.add.circle(
      fuel.x,
      fuel.y,
      fuel.r * BURNING.scorch.radiusMultiplier,
      FLAME_VISUAL.palette.emberRed,
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
      const restingAlpha = ignitable ? 0.78 : 0.4;

      fuel.visual.setScale(1 + Math.sin(t * 0.003 + fuel.pulse) * 0.06);
      fuel.visual.setAlpha(restingAlpha);

      const inContact = Phaser.Math.Distance.Between(flame.x, flame.y, fuel.x, fuel.y)
        < (flame.size + fuel.r) * BURNING.contactRadiusMultiplier;

      if(inContact && ignitable) this.ignite(fuel);
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

    if(fuel.hp <= 0) this.finishBurn(fuel);
  }

  updateAll(t: number, dt: number){
    const flame = this.host.getFlame();
    for(const fuel of this.fuels) this.updateFuel(fuel, t, dt, flame);
  }
}
