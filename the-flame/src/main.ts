import Phaser from 'phaser';
import { FLAME_VISUAL } from './data/flameVisualData';
import { GROWTH } from './data/growthData';
import { PROGRESSION } from './data/progressionData';
import { capabilitiesForLevel } from './data/scaleData';
import { formForLevel } from './data/evolutionData';
import { WORLD } from './data/worldData';
import { MatterRegistry } from './systems/MatterRegistry';
import { WorldManager } from './systems/WorldManager';
import { toDisplayNumber } from './util/displayNumber';

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
  flameSize: number = GROWTH.baseFlameSize;
  energy = 0;
  heat = 0;
  stability = 1;
  burned = 0;
  level = 1;
  matterSystem!: MatterRegistry;
  world!: WorldManager;
  ribbons: Ribbon[] = [];
  scorches: Phaser.GameObjects.Arc[] = [];
  particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(){ super('flame'); }

  create(){
    this.cameras.main.setBackgroundColor('#080604');
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.target.set(WORLD.width / 2, WORLD.height / 2);

    this.halo = this.add.circle(
      this.target.x,
      this.target.y,
      this.flameSize * 2.1,
      FLAME_VISUAL.palette.orange,
      0.08
    ).setDepth(3);

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
      }),
      addHeat: (amount) => { this.heat = Math.min(GROWTH.maxHeat, this.heat + amount); },
      onFuelBurned: (xpYield) => {
        this.energy += xpYield;
        this.burned++;
        this.flameSize = Math.min(
          GROWTH.maxFlameSize,
          GROWTH.baseFlameSize + Math.sqrt(this.energy) * GROWTH.sizeEnergyFactor
        );
        this.tryLevelUp();
      }
    });

    this.world = new WorldManager(this.matterSystem);
    this.world.populate();

    this.cameras.main.startFollow(this.flame, true, 0.09, 0.09);

    const aimAt = (p: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(p.x, p.y);
      this.target.set(world.x, world.y);
    };
    this.input.on('pointermove', aimAt);
    this.input.on('pointerdown', aimAt);

    this.add.text(24, 22, 'THE FLAME', {
      fontFamily:'Inter, sans-serif', fontSize:'12px', color:'#ffffff'
    }).setScrollFactor(0).setDepth(10).setAlpha(.72);

    this.add.text(24, 43, 'move • touch • burn • grow', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff'
    }).setScrollFactor(0).setDepth(10).setAlpha(.34);

    this.add.text(this.scale.width - 24, 22, capabilitiesForLevel(this.level).name, {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10).setAlpha(.65).setName('stage');

    this.add.text(this.scale.width - 24, 43, `LV ${toDisplayNumber(this.level)}`, {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10).setAlpha(.5).setName('level');

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

  tryLevelUp(){
    while(this.level < PROGRESSION.totalLevels){
      const nextLevel = this.level + 1;
      const hasXp = this.energy >= PROGRESSION.xpForLevel(nextLevel);
      const hasSize = this.flameSize >= PROGRESSION.minFlameSizeForLevel(nextLevel);
      if(!hasXp || !hasSize) break;
      this.level = nextLevel;
    }
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

    const form = formForLevel(this.level);
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

    this.core.setPosition(this.flame.x, this.flame.y);
    this.core.setSize(
      this.flameSize * 0.72 * (1 + speed * 0.3),
      this.flameSize * 1.25 * heatStretch
    );
    this.core.setFillStyle(Phaser.Display.Color.ValueToColor(evolvedColor).lighten(35).color, 0.82);
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

    const maxSpeed = (90 + this.flameSize * 8) * capabilitiesForLevel(this.level).speedMultiplier;
    if(this.velocity.length() > maxSpeed) this.velocity.setLength(maxSpeed);

    this.flame.x = Phaser.Math.Clamp(this.flame.x + this.velocity.x * dtS, 10, WORLD.width - 10);
    this.flame.y = Phaser.Math.Clamp(this.flame.y + this.velocity.y * dtS, 10, WORLD.height - 10);

    this.heat = Math.max(0, this.heat - GROWTH.heatDecayPerSecond * dtS);
    this.updateFlameVisual(t);

    this.matterSystem.updateAll(t, dt);

    const stage = this.children.getByName('stage') as Phaser.GameObjects.Text;
    stage.setText(capabilitiesForLevel(this.level).name);

    const levelLabel = this.children.getByName('level') as Phaser.GameObjects.Text;
    levelLabel.setText(`LV ${toDisplayNumber(this.level)}`);

    this.particles.setPosition(this.flame.x, this.flame.y);
    if(Math.random() < FLAME_VISUAL.particles.emberChance + this.heat * 0.12) this.particles.explode(1);
  }

  layout(){
    (this.children.getByName('stage') as Phaser.GameObjects.Text)?.setPosition(this.scale.width - 24, 22);
    (this.children.getByName('level') as Phaser.GameObjects.Text)?.setPosition(this.scale.width - 24, 43);
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
