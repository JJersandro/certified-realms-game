import Phaser from 'phaser';
import { FLAME_VISUAL } from './data/flameVisualData';
import { BURNING } from './data/burningData';
import { GROWTH } from './data/growthData';

type BurnState = 'idle' | 'burning';

type Fuel = {
  x: number;
  y: number;
  r: number;
  energy: number;
  alive: boolean;
  pulse: number;
  kind: number;
  burnState: BurnState;
  burnRemaining: number;
  visual: Phaser.GameObjects.Arc;
  burnVisual: Phaser.GameObjects.Arc;
};

type Ribbon = {
  visual: Phaser.GameObjects.Ellipse;
  phase: number;
  speed: number;
  width: number;
  height: number;
  alpha: number;
};

class FlameScene extends Phaser.Scene {
  flame!: Phaser.GameObjects.Arc;
  halo!: Phaser.GameObjects.Arc;
  core!: Phaser.GameObjects.Ellipse;
  target = new Phaser.Math.Vector2();
  velocity = new Phaser.Math.Vector2();
  lastDirection = 0;
  flameSize = GROWTH.baseFlameSize;
  energy = 0;
  heat = 0;
  stability = 1;
  burned = 0;
  fuels: Fuel[] = [];
  ribbons: Ribbon[] = [];
  scorches: Phaser.GameObjects.Arc[] = [];
  particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(){ super('flame'); }

  create(){
    this.cameras.main.setBackgroundColor('#080604');
    this.target.set(this.scale.width / 2, this.scale.height / 2);

    this.halo = this.add.circle(
      this.target.x,
      this.target.y,
      this.flameSize * 2.1,
      FLAME_VISUAL.palette.orange,
      0.08
    ).setDepth(3);

    this.createFlameBody();
    this.createParticles();

    for(let i = 0; i < 180; i++) this.spawnFuel();

    this.input.on('pointermove', (p: Phaser.Input.Pointer)=>this.target.set(p.x, p.y));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer)=>this.target.set(p.x, p.y));

    this.add.text(24, 22, 'THE FLAME', {
      fontFamily:'Inter, sans-serif', fontSize:'12px', color:'#ffffff', alpha:.72
    }).setDepth(10);

    this.add.text(24, 43, 'move • touch • burn • grow', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff', alpha:.34
    }).setDepth(10);

    this.add.text(this.scale.width - 24, 22, 'SPARK', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347', alpha:.65
    }).setOrigin(1, 0).setDepth(10).setName('stage');

    this.scale.on('resize', ()=>this.layout());
  }

  createFlameBody(){
    this.flame = this.add.circle(
      this.target.x,
      this.target.y,
      this.flameSize,
      FLAME_VISUAL.palette.orange,
      0.9
    ).setDepth(6);

    this.core = this.add.ellipse(
      this.target.x,
      this.target.y,
      this.flameSize * 0.72,
      this.flameSize * 1.25,
      FLAME_VISUAL.palette.core,
      0.82
    ).setDepth(7);

    const colors = [
      FLAME_VISUAL.palette.emberRed,
      FLAME_VISUAL.palette.hotRed,
      FLAME_VISUAL.palette.orange,
      FLAME_VISUAL.palette.violet,
      FLAME_VISUAL.palette.cyan
    ];

    for(let i = 0; i < FLAME_VISUAL.motion.ribbonCount; i++){
      const visual = this.add.ellipse(
        this.target.x,
        this.target.y,
        this.flameSize * (0.44 + i * 0.035),
        this.flameSize * (1.7 + (i % 2) * 0.35),
        colors[i],
        FLAME_VISUAL.presentation.preferLayeredTransparency ? 0.24 + i * 0.025 : 0.8
      ).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);

      this.ribbons.push({
        visual,
        phase: i * 1.47,
        speed: FLAME_VISUAL.motion.twistFrequency[i % FLAME_VISUAL.motion.twistFrequency.length],
        width: 1 + i * 0.08,
        height: 1 + i * 0.16,
        alpha: 0.24 + i * 0.025
      });
    }
  }

  createParticles(){
    const g = this.make.graphics({x:0, y:0, add:false});
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

  spawnFuel(){
    const margin = 45;
    const x = Phaser.Math.Between(margin, Math.max(margin, this.scale.width - margin));
    const y = Phaser.Math.Between(80, Math.max(80, this.scale.height - margin));
    if(Phaser.Math.Distance.Between(x, y, this.flame.x, this.flame.y) < 120) return;

    const kind = Phaser.Math.Between(0, 2);
    const r = kind === 0
      ? Phaser.Math.Between(3, 6)
      : kind === 1
        ? Phaser.Math.Between(6, 10)
        : Phaser.Math.Between(10, 16);

    const color = kind === 0 ? 0xd7c7aa : kind === 1 ? 0x5d8c55 : 0x6b625b;
    const visual = this.add.circle(x, y, r, color, 0.78).setDepth(1);
    const burnVisual = this.add.circle(x, y, r * 0.65, FLAME_VISUAL.palette.core, 0)
      .setDepth(2).setBlendMode(Phaser.BlendModes.ADD);

    this.fuels.push({
      x,
      y,
      r,
      energy:r * r * (kind + 1),
      alive:true,
      pulse:Math.random() * Math.PI * 2,
      kind,
      burnState:'idle',
      burnRemaining:0,
      visual,
      burnVisual
    });
  }

  ignitionDuration(fuel: Fuel){
    if(fuel.kind === 0) return BURNING.ignitionTime.smallest;
    if(fuel.kind === 1) return BURNING.ignitionTime.medium;
    return BURNING.ignitionTime.large;
  }

  ignite(fuel: Fuel){
    if(fuel.burnState !== 'idle') return;
    fuel.burnState = 'burning';
    fuel.burnRemaining = this.ignitionDuration(fuel);
    fuel.visual.setAlpha(0.42);
    fuel.burnVisual.setAlpha(BURNING.burnPulse.alpha);
    fuel.burnVisual.setScale(0.75);
    this.heat = Math.min(GROWTH.maxHeat, this.heat + 0.08);
    this.particles.setPosition(fuel.x, fuel.y);
    this.particles.explode(Phaser.Math.Between(BURNING.emberBurst.min, Math.min(BURNING.emberBurst.max, 8)));
  }

  finishBurn(fuel: Fuel){
    if(!fuel.alive) return;

    fuel.alive = false;
    fuel.burnState = 'idle';
    this.energy += fuel.energy;
    this.burned++;
    this.flameSize = Math.min(
      GROWTH.maxFlameSize,
      GROWTH.baseFlameSize + Math.sqrt(this.energy) * GROWTH.sizeEnergyFactor
    );
    this.heat = Math.min(GROWTH.maxHeat, this.heat + fuel.r / 22);

    this.particles.setPosition(fuel.x, fuel.y);
    this.particles.explode(Phaser.Math.Clamp(Math.floor(fuel.r * 2.2), BURNING.emberBurst.min, BURNING.emberBurst.max));

    const scorch = this.add.circle(
      fuel.x,
      fuel.y,
      fuel.r * BURNING.scorch.radiusMultiplier,
      FLAME_VISUAL.palette.emberRed,
      BURNING.scorch.alpha
    ).setDepth(0);

    this.scorches.push(scorch);
    this.tweens.add({
      targets:scorch,
      alpha:0.11,
      duration:BURNING.scorch.fadeMs,
      ease:'Sine.Out'
    });

    fuel.visual.destroy();
    fuel.burnVisual.destroy();
  }

  updateFuel(fuel: Fuel, t:number, dt:number){
    if(!fuel.alive) return;

    if(fuel.burnState === 'idle'){
      fuel.visual.setScale(1 + Math.sin(t * 0.003 + fuel.pulse) * 0.06);

      if(Phaser.Math.Distance.Between(this.flame.x, this.flame.y, fuel.x, fuel.y)
        < (this.flameSize + fuel.r) * BURNING.contactRadiusMultiplier){
        this.ignite(fuel);
      }
      return;
    }

    fuel.burnRemaining -= dt;
    const pulse = 1 + Math.sin(t * BURNING.burnPulse.frequency + fuel.pulse) * BURNING.burnPulse.scale;
    const progress = Phaser.Math.Clamp(1 - fuel.burnRemaining / this.ignitionDuration(fuel), 0, 1);

    fuel.visual.setScale(1 + progress * 0.16);
    fuel.visual.setAlpha(Math.max(0.08, 0.42 - progress * 0.28));
    fuel.burnVisual.setScale((0.75 + progress * 0.7) * pulse);
    fuel.burnVisual.setAlpha(BURNING.burnPulse.alpha + progress * 0.2);

    this.heat = Math.min(
      GROWTH.maxHeat,
      this.heat + (GROWTH.heatRisePerBurnSecond * dt) / 1000
    );

    this.particles.setPosition(fuel.x, fuel.y);
    if(Math.random() < 0.15 + progress * 0.16) this.particles.explode(1);

    if(fuel.burnRemaining <= 0) this.finishBurn(fuel);
  }

  updateFlameVisual(t:number){
    const currentDirection = Math.atan2(this.velocity.y, this.velocity.x || 1);
    let directionDelta = Phaser.Math.Angle.Wrap(currentDirection - this.lastDirection);
    if(Math.abs(directionDelta) > Math.PI) directionDelta = 0;

    this.stability = Phaser.Math.Clamp(
      this.stability - Math.abs(directionDelta) * GROWTH.instabilityFromDirectionChange * 0.01,
      GROWTH.minStability,
      GROWTH.maxStability
    );

    this.stability = Phaser.Math.Clamp(
      this.stability + 0.016 * GROWTH.stabilityRecoveryPerSecond,
      GROWTH.minStability,
      GROWTH.maxStability
    );
    this.lastDirection = currentDirection;

    const wobble = 1
      + Math.sin(t * 0.012) * (0.06 + (1 - this.stability) * 0.08)
      + Math.sin(t * 0.027) * 0.035;
    const speed = Phaser.Math.Clamp(this.velocity.length() / 180, 0, 1);
    const heatStretch = 1 + this.heat * 0.12;
    const flameAlpha = 0.84 + this.heat * 0.13;

    this.flame.setRadius(this.flameSize * wobble);
    this.flame.setAlpha(flameAlpha);
    this.flame.setPosition(this.flame.x, this.flame.y);
    this.flame.setFillStyle(
      Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(FLAME_VISUAL.palette.orange),
        Phaser.Display.Color.ValueToColor(FLAME_VISUAL.palette.gold),
        100,
        Math.round(this.heat * 100)
      ).color,
      flameAlpha
    );

    this.core.setPosition(this.flame.x, this.flame.y);
    this.core.setSize(
      this.flameSize * 0.72 * (1 + speed * 0.3),
      this.flameSize * 1.25 * heatStretch
    );
    this.core.setAlpha(0.76 + this.heat * 0.2);
    this.core.rotation = currentDirection + Math.PI / 2;

    this.halo
      .setPosition(this.flame.x, this.flame.y)
      .setRadius(this.flameSize * (2.0 + 0.28 * this.heat + 0.22 * Math.sin(t * 0.008)))
      .setAlpha(Math.min(0.19, 0.035 + this.flameSize / 700 + this.heat * 0.05));

    for(const ribbon of this.ribbons){
      const s = Math.sin(t * ribbon.speed + ribbon.phase);
      const c = Math.cos(t * ribbon.speed * 0.73 + ribbon.phase * 0.8);
      const stretch = 1 + speed * FLAME_VISUAL.motion.stretch * 0.18 + this.heat * 0.16;
      const instability = 1 + (1 - this.stability) * 0.28;

      ribbon.visual.setPosition(
        this.flame.x + s * this.flameSize * FLAME_VISUAL.motion.swayAmplitude * (0.7 + speed) * instability,
        this.flame.y - c * this.flameSize * (0.22 + this.heat * 0.08)
      );

      ribbon.visual.setSize(
        this.flameSize * (0.38 + ribbon.width * 0.05) * (1 + this.heat * 0.08),
        this.flameSize * (1.45 + ribbon.height * 0.15) * stretch
      );
      ribbon.visual.rotation = currentDirection + Math.PI / 2 + s * (0.28 + this.heat * 0.1);
      ribbon.visual.setAlpha(Math.min(0.38, ribbon.alpha + this.flameSize / 5000 + this.heat * 0.05));
    }
  }

  update(t:number, dt:number){
    const dtS = dt / 1000;
    const desired = new Phaser.Math.Vector2(
      this.target.x - this.flame.x,
      this.target.y - this.flame.y
    ).scale(5.2);

    this.velocity.lerp(desired, Math.min(1, dtS * 5.5));

    const maxSpeed = 90 + this.flameSize * 8;
    if(this.velocity.length() > maxSpeed) this.velocity.setLength(maxSpeed);

    this.flame.x = Phaser.Math.Clamp(this.flame.x + this.velocity.x * dtS, 10, this.scale.width - 10);
    this.flame.y = Phaser.Math.Clamp(this.flame.y + this.velocity.y * dtS, 65, this.scale.height - 10);

    this.heat = Math.max(0, this.heat - GROWTH.heatDecayPerSecond * dtS);
    this.updateFlameVisual(t);

    for(const fuel of this.fuels) this.updateFuel(fuel, t, dt);

    const stage = this.children.getByName('stage') as Phaser.GameObjects.Text;
    stage.setText(
      this.flameSize < 14 ? 'SPARK' :
      this.flameSize < 22 ? 'EMBER' :
      this.flameSize < 34 ? 'FLAME' :
      this.flameSize < 50 ? 'BLAZE' :
      'INFERNO'
    );

    this.particles.setPosition(this.flame.x, this.flame.y);
    if(Math.random() < FLAME_VISUAL.particles.emberChance + this.heat * 0.12) this.particles.explode(1);
  }

  layout(){
    (this.children.getByName('stage') as Phaser.GameObjects.Text)?.setPosition(this.scale.width - 24, 22);
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
  scene:FlameScene
});
